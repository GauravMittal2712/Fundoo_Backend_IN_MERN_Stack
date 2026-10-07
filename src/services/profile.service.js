const bcrypt = require('bcryptjs');
const userRepo = require('../repositories/user.repository');
const accountRepo = require('../repositories/account.repository');
const ApiError = require('../utils/ApiError');
const messages = require('../constants/messages');
const logger = require('../utils/logger');
const { verifyGoogleCredential } = require('./auth.service');

const { getCache, setCache, deleteCache, deleteCacheByPattern } = require('../utils/cache');

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

// Deleting an account is permanent, so the person must prove it is really them:
// their password, or (for Google sign-in accounts) a fresh Google credential.
const confirmIdentity = async (user, { password, credential }) => {
  if (credential) {
    const payload = await verifyGoogleCredential(credential);
    if (!user.googleId || payload.sub !== user.googleId) {
      throw new ApiError(401, 'This Google account does not match your Fundoo account');
    }
    return;
  }

  if (!user.password) {
    throw new ApiError(400, 'This account has no password. Confirm with Google instead');
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new ApiError(401, 'Incorrect password');
};

const deleteAccount = async (userId, confirmation) => {
  const user = await accountRepo.findForDeletion(userId);
  if (!user) throw new ApiError(404, messages.NOT_FOUND);

  await confirmIdentity(user, confirmation);
  await accountRepo.deleteAllForUser(userId);

  // The data is already gone, so a cache problem must not turn this into an error.
  try {
    await deleteCacheByPattern(`notes:${userId}:*`);
    await deleteCache(`labels:${userId}`);
    await deleteCache(`profile:${userId}`);
  } catch (error) {
    logger.error(`Could not clear cache for deleted user ${userId}: ${error.message}`);
  }

  logger.info(`Account deleted: ${userId}`);
};

module.exports = { getProfile, updateProfile, deleteAccount };