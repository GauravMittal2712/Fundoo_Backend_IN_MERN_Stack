require('dotenv').config();

const {
  connectRabbitMQ,
  onRabbitReconnect,
  publish,
  closeRabbitMQ
} = require('../utils/rabbitmq');

const {
  sendWelcomeEmail,
  sendResetPasswordEmail,
  sendCollaboratorAddedEmail,
  sendReminderEmail,
  verifyMailer
} = require('../utils/mailer');

const logger = require('../utils/logger');

const MAX_RETRIES = 5; // after the first failure: 5 more tries, one minute apart
const RETRY_DELAY_MS = 60 * 1000;

const queue = process.env.RABBITMQ_EMAIL_QUEUE;
const retryQueue = `${queue}.retry`; // waits RETRY_DELAY_MS, then flows back into the main queue
const failedQueue = `${queue}.failed`; // jobs that could not be sent; kept for inspection

const handlers = {
  WELCOME_EMAIL: (d) => sendWelcomeEmail(d.to, d.firstName),
  RESET_PASSWORD_EMAIL: (d) => sendResetPasswordEmail(d.to, d.firstName, d.resetUrl),
  COLLABORATOR_ADDED_EMAIL: (d) =>
    sendCollaboratorAddedEmail(d.to, d.collaboratorName, d.ownerName, d.noteTitle, d.noteUrl),
  REMINDER_EMAIL: (d) =>
    sendReminderEmail(d.to, d.firstName, d.noteTitle, d.noteDescription, d.dateTime, d.noteUrl)
};

const safeNack = (channel, message) => {
  try {
    channel.nack(message, false, true);
  } catch (error) {
    // Channel already gone: RabbitMQ puts the unacknowledged job back by itself.
    logger.error(`Could not nack email job: ${error.message}`);
  }
};

// Publishes first, acknowledges second, so a job is never lost in between.
const moveTo = async (channel, message, targetQueue, headers) => {
  try {
    await publish(targetQueue, message.content, { headers });
    channel.ack(message);
  } catch (error) {
    logger.error(`Could not move email job to ${targetQueue}: ${error.message}`);
    safeNack(channel, message);
  }
};

const park = (channel, message, retries, reason) => {
  logger.error(`Email job given up, moved to ${failedQueue}: ${reason}`);
  return moveTo(channel, message, failedQueue, {
    'x-retry-count': retries,
    'x-failure-reason': String(reason).slice(0, 500)
  });
};

const scheduleRetry = (channel, message, retries, reason) => {
  const next = retries + 1;
  logger.warn(
    `Email job failed (retry ${next}/${MAX_RETRIES} in ${RETRY_DELAY_MS / 1000}s): ${reason}`
  );
  return moveTo(channel, message, retryQueue, {
    'x-retry-count': next,
    'x-last-error': String(reason).slice(0, 500)
  });
};

const handleMessage = async (channel, message) => {
  const retries = Number(message.properties?.headers?.['x-retry-count']) || 0;

  let data;
  try {
    data = JSON.parse(message.content.toString());
  } catch (error) {
    return park(channel, message, retries, `Malformed job: ${error.message}`);
  }

  const handler = handlers[data?.type];
  if (!handler) {
    return park(channel, message, retries, `Unknown job type: ${data?.type}`);
  }

  logger.info(`Processing email job: ${data.type} -> ${data.to}`);

  try {
    await handler(data);
  } catch (error) {
    if (retries >= MAX_RETRIES) {
      return park(channel, message, retries, error.message);
    }
    return scheduleRetry(channel, message, retries, error.message);
  }

  try {
    channel.ack(message);
  } catch (error) {
    logger.error(`Could not acknowledge email job: ${error.message}`);
  }

  logger.info(`Email job completed: ${data.to}`);
  return undefined;
};

// Runs at start-up and again after every RabbitMQ reconnect.
const startConsuming = async (channel) => {
  await channel.assertQueue(failedQueue, { durable: true });
  await channel.assertQueue(retryQueue, {
    durable: true,
    arguments: {
      'x-message-ttl': RETRY_DELAY_MS,
      'x-dead-letter-exchange': '',
      'x-dead-letter-routing-key': queue
    }
  });

  channel.prefetch(1);

  await channel.consume(
    queue,
    (message) => {
      if (!message) {
        logger.warn('Email consumer was cancelled by RabbitMQ');
        return;
      }

      handleMessage(channel, message).catch((error) => {
        logger.error(`Unexpected email worker error: ${error.message}`);
        safeNack(channel, message);
      });
    },
    { noAck: false }
  );

  logger.info(`Email worker listening on queue: ${queue}`);
};

const startEmailWorker = async () => {
  const channel = await connectRabbitMQ();

  onRabbitReconnect(startConsuming);

  await startConsuming(channel);

  // Only logs: tells you at start-up if the Gmail login is wrong.
  verifyMailer().catch(() => {});
};

const shutdown = async () => {
  try {
    await closeRabbitMQ();
  } finally {
    process.exit(0);
  }
};

if (require.main === module) {
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  startEmailWorker().catch((error) => {
    logger.error(`Email worker failed: ${error.message}`);

    process.exit(1);
  });
}

module.exports = { handleMessage, startConsuming, MAX_RETRIES, retryQueue, failedQueue };
