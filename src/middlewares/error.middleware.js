const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`${req.method} ${req.originalUrl} - ${statusCode} - ${message}`);

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    error: process.env.NODE_ENV === 'development' ? { stack: err.stack } : null,
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;