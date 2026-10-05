const amqp = require('amqplib');
const logger = require('./logger');

const RECONNECT_MIN_MS = 2000;
const RECONNECT_MAX_MS = 30000;
const PUBLISH_TIMEOUT_MS = 10000;

let connection = null;
let channel = null;
let closing = false;
let reconnecting = false;
const reconnectListeners = [];

// Opens a connection + confirm channel and makes sure the main queue exists.
// A confirm channel lets us wait until the broker has really accepted a message.
const openConnection = async () => {
  const conn = await amqp.connect(process.env.RABBITMQ_URL);

  // Must be attached straight away, otherwise an 'error' event would crash the process.
  conn.on('error', (error) => {
    logger.error(`RabbitMQ connection error: ${error.message}`);
  });

  let ch;
  try {
    ch = await conn.createConfirmChannel();
    await ch.assertQueue(process.env.RABBITMQ_EMAIL_QUEUE, {
      durable: true
    });
  } catch (error) {
    conn.close().catch(() => {});
    throw error;
  }

  connection = conn;
  channel = ch;

  conn.on('close', () => {
    if (connection === conn) {
      connection = null;
      channel = null;
    }
    if (closing) return;
    logger.error('RabbitMQ connection closed');
    scheduleReconnect();
  });

  ch.on('error', (error) => {
    logger.error(`RabbitMQ channel error: ${error.message}`);
  });

  ch.on('close', () => {
    if (channel === ch) channel = null;
    // Channel gone but connection still up: drop the connection so we rebuild both.
    if (!closing && connection === conn) {
      logger.error('RabbitMQ channel closed, reconnecting');
      conn.close().catch(() => {});
    }
  });
};

// Keeps trying (2s, 4s, 8s ... up to 30s) until RabbitMQ is back, then tells listeners.
const scheduleReconnect = () => {
  if (reconnecting || closing) return;
  reconnecting = true;

  let delay = RECONNECT_MIN_MS;

  const attempt = async () => {
    if (closing) {
      reconnecting = false;
      return;
    }

    try {
      await openConnection();
      reconnecting = false;
      logger.info('RabbitMQ reconnected');

      for (const listener of reconnectListeners) {
        try {
          await listener(channel);
        } catch (error) {
          logger.error(`RabbitMQ reconnect handler failed: ${error.message}`);
        }
      }
    } catch (error) {
      logger.error(`RabbitMQ reconnect failed: ${error.message} (retrying in ${delay / 1000}s)`);
      setTimeout(attempt, delay);
      delay = Math.min(delay * 2, RECONNECT_MAX_MS);
    }
  };

  setTimeout(attempt, delay);
};

// Same behaviour as before: throws if RabbitMQ is unreachable at start-up.
const connectRabbitMQ = async () => {
  try {
    closing = false;
    await openConnection();

    logger.info('RabbitMQ connected');

    return channel;
  } catch (error) {
    logger.error(`RabbitMQ connection failed: ${error.message}`);
    throw error;
  }
};

const getChannel = () => {
  if (!channel) {
    throw new Error('RabbitMQ channel is not initialized');
  }

  return channel;
};

// Runs fn(channel) every time the connection is restored (the worker re-subscribes here).
const onRabbitReconnect = (fn) => {
  reconnectListeners.push(fn);
};

// Sends a message and resolves only after RabbitMQ confirms it was stored.
const publish = (queue, content, options = {}) =>
  new Promise((resolve, reject) => {
    let ch;
    try {
      ch = getChannel();
    } catch (error) {
      reject(error);
      return;
    }

    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error('RabbitMQ did not confirm the message in time'));
    }, PUBLISH_TIMEOUT_MS);

    const done = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (error) reject(error);
      else resolve();
    };

    try {
      ch.sendToQueue(queue, content, { persistent: true, ...options }, done);
    } catch (error) {
      done(error);
    }
  });

const closeRabbitMQ = async () => {
  closing = true;

  if (connection) {
    const conn = connection;
    connection = null;
    channel = null;
    await conn.close();
    logger.info('RabbitMQ connection closed');
  }
};

module.exports = {
  connectRabbitMQ,
  getChannel,
  onRabbitReconnect,
  publish,
  closeRabbitMQ
};
