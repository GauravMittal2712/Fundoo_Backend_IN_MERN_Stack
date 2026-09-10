const amqp = require('amqplib');
const logger = require('./logger');

let connection;
let channel;

const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);

    channel = await connection.createChannel();

    await channel.assertQueue(process.env.RABBITMQ_EMAIL_QUEUE, {
      durable: true
    });

    logger.info('RabbitMQ connected');

    connection.on('error', (error) => {
      logger.error(`RabbitMQ connection error: ${error.message}`);
    });

    connection.on('close', () => {
      logger.error('RabbitMQ connection closed');
    });

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

const closeRabbitMQ = async () => {
  if (connection) {
    await connection.close();
    logger.info('RabbitMQ connection closed');
  }
};

module.exports = {
  connectRabbitMQ,
  getChannel,
  closeRabbitMQ
};