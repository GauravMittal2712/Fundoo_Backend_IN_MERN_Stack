const userRepo = require('../repositories/user.repository');
const ApiError = require('../utils/ApiError');
const messages = require('../constants/messages');

const getProfile = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) throw new ApiError(404, messages.NOT_FOUND);
  return user;
};

const updateProfile = async (userId, data) => {
  const user = await userRepo.updateById(userId, data);
  if (!user) throw new ApiError(404, messages.NOT_FOUND);
  return user;
};

module.exports = { getProfile, updateProfile };