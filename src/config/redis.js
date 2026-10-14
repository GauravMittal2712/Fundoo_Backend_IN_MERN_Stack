
const Redis = require('ioredis');
const logger = require('../utils/logger');

if (process.env.DISABLE_REDIS_CACHE === 'true') {
  module.exports = {
    get: async () => null,
    set: async () => 'OK',
    del: async () => 0,
    keys: async () => []
  };
} else {
  const redis = new Redis(process.env.REDIS_URL);

  redis.on('connect', () => {
    logger.info('Redis connected successfully');
  });

  redis.on('error', (err) => {
    logger.error(`Redis Error: ${err.message}`);
  });

  module.exports = redis;
}
