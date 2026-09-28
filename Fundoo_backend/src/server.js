require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const {
  connectRabbitMQ
} = require('./utils/rabbitmq');

const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    await connectRabbitMQ();

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

  } catch (error) {
    logger.error(
      `Server startup failed: ${error.message}`
    );

    process.exit(1);
  }
};

startServer();