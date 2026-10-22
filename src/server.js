require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const { connectRabbitMQ, onRabbitReconnect } = require('./utils/rabbitmq');
const { startConsuming } = require('./workers/email.worker');
const { verifyMailer } = require('./utils/mailer');

const logger = require('./utils/logger');
const { startReminderScheduler } = require('./utils/reminderScheduler');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const channel = await connectRabbitMQ();

    // Free hosting: run the email worker inside this same process.
    if (process.env.RUN_EMAIL_WORKER === 'true') {
      onRabbitReconnect(startConsuming);
      await startConsuming(channel);
      verifyMailer().catch(() => {});
      logger.info('Email worker is running inside the API process');
    }

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

    startReminderScheduler();
  } catch (error) {
    logger.error(`Server startup failed: ${error.message}`);

    process.exit(1);
  }
};

startServer();