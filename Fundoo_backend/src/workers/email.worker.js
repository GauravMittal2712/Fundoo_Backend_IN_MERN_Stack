require('dotenv').config();

const {
  connectRabbitMQ
} = require('../utils/rabbitmq');

const {
  sendWelcomeEmail
} = require('../utils/mailer');

const logger = require('../utils/logger');

const startEmailWorker = async () => {
  const channel = await connectRabbitMQ();

  const queue = process.env.RABBITMQ_EMAIL_QUEUE;

  channel.prefetch(1);

  logger.info(`Email worker listening on queue: ${queue}`);

  await channel.consume(
    queue,
    async (message) => {
      if (!message) {
        return;
      }

      try {
        const data = JSON.parse(
          message.content.toString()
        );

        logger.info(
          `Processing email job: ${data.type} -> ${data.to}`
        );

        if (data.type === 'WELCOME_EMAIL') {
          await sendWelcomeEmail(
            data.to,
            data.firstName
          );
        }

        channel.ack(message);

        logger.info(
          `Email job completed: ${data.to}`
        );

      } catch (error) {
        logger.error(
          `Email job failed: ${error.message}`
        );

        channel.nack(
          message,
          false,
          true
        );
      }
    },
    {
      noAck: false
    }
  );
};

startEmailWorker()
  .catch((error) => {
    logger.error(
      `Email worker failed: ${error.message}`
    );

    process.exit(1);
  });