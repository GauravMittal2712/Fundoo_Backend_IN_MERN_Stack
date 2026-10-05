const redis = require('../config/redis');

const DEFAULT_TTL = 60 * 5; // 5 minutes

const getCache = async (key) => {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};

const setCache = async (key, value, ttl = DEFAULT_TTL) => {
  await redis.set(key, JSON.stringify(value), 'EX', ttl);
};

const deleteCache = async (key) => {
  await redis.del(key);
};

const deleteCacheByPattern = async (pattern) => {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
};

module.exports = {
  getCache,
  setCache,
  deleteCache,
  deleteCacheByPattern
};