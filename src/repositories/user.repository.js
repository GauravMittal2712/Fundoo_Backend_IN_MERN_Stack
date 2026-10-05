const User = require('../models/user.model');

const create = (data) => User.create(data);
const findByEmail = (email) => User.findOne({ email });
// OAuth lookups (googleId is hidden by default, so select it explicitly)
const findByGoogleId = (googleId) => User.findOne({ googleId }).select('+googleId');
const findByEmailForOAuth = (email) => User.findOne({ email }).select('+googleId');
const linkGoogleAccount = (id, googleId, profileImage) =>
  User.findByIdAndUpdate(
    id,
    { googleId, ...(profileImage ? { profileImage } : {}) },
    { new: true }
  );

const findById = (id) => User.findById(id).select('-password');
const updateById = (id, data) => User.findByIdAndUpdate(id, data, { new: true }).select('-password');

const setResetToken = (id, hashedToken, expires) =>
  User.findByIdAndUpdate(id, { passwordResetToken: hashedToken, passwordResetExpires: expires });

const findByResetToken = (hashedToken) =>
  User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: new Date() } });

const updatePassword = (id, hashedPassword) =>
  User.findByIdAndUpdate(id, {
    password: hashedPassword,
    $unset: { passwordResetToken: 1, passwordResetExpires: 1 }
  });

module.exports = {
  create,
  findByEmail,
  findByGoogleId,
  findByEmailForOAuth,
  linkGoogleAccount,
  findById,
  updateById,
  setResetToken,
  findByResetToken,
  updatePassword
};