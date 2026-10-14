
const mongoose = require('mongoose');
const logger = require('../utils/logger');

let connectionPromise;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured');
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGODB_URI)
      .then(() => {
        logger.info('MongoDB connected');
        return mongoose.connection;
      })
      .catch((error) => {
        connectionPromise = null;
        logger.error(`MongoDB connection error: ${error.message}`);
        throw error;
      });
  }

  return connectionPromise;
};

module.exports = connectDB;
