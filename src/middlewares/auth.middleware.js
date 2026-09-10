const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const messages = require('../constants/messages');

const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, messages.UNAUTHORIZED));
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    next(new ApiError(401, messages.UNAUTHORIZED));
  }
};

module.exports = auth;