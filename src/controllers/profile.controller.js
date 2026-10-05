const profileService = require('../services/profile.service');
const messages = require('../constants/messages');

const get = async (req, res, next) => {
  try {
    const user = await profileService.getProfile(req.user.id);
    res.status(200).json({ success: true, message: 'Profile fetched', data: user, timestamp: new Date().toISOString() });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const user = await profileService.updateProfile(req.user.id, req.body);
    res.status(200).json({ success: true, message: messages.PROFILE_UPDATED, data: user, timestamp: new Date().toISOString() });
  } catch (err) { next(err); }
};

module.exports = { get, update };