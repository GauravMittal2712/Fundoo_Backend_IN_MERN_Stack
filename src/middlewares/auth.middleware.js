const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const messages = require('../constants/messages');
const User = require('../models/user.model');

const auth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, messages.UNAUTHORIZED));
  }

  let decoded;
  try {
    const token = header.split(' ')[1];
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new ApiError(401, messages.UNAUTHORIZED));
  }

  try {
    // A token stays valid after its account is deleted, so make sure the user still exists
    const exists = await User.exists({ _id: decoded.id });
    if (!exists) return next(new ApiError(401, messages.UNAUTHORIZED));
  } catch (err) {
    return next(err);
  }

  req.user = { id: decoded.id };
  next();
};

module.exports = auth;