const userRepo = require('../repositories/user.repository');
const ApiError = require('../utils/ApiError');
const messages = require('../constants/messages');

const { getCache, setCache, deleteCache } = require('../utils/cache');

const getProfile = async (userId) => {
  const cacheKey = `profile:${userId}`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const user = await userRepo.findById(userId);
  if (!user) throw new ApiError(404, messages.NOT_FOUND);

  await setCache(cacheKey, user);
  return user;
};

const updateProfile = async (userId, data) => {
  const user = await userRepo.updateById(userId, data);
  if (!user) throw new ApiError(404, messages.NOT_FOUND);

  await deleteCache(`profile:${userId}`);  
  return user;
};

module.exports = { getProfile, updateProfile };