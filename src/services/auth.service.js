const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepo = require('../repositories/user.repository');
const ApiError = require('../utils/ApiError');
const messages = require('../constants/messages');
const { sendWelcomeEmailJob } = require('./email.service');

const register = async (data) => {
  const existing = await userRepo.findByEmail(data.email);

  if (existing) {
    throw new ApiError(409, 'Email already registered');
  }

  const hashed = await bcrypt.hash(data.password, 10);

  const user = await userRepo.create({
    ...data,
    password: hashed
  });

  await sendWelcomeEmailJob(
    user.email,
    user.firstName
  );

  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email
  };
};

const login = async (email, password) => {
  const user = await userRepo.findByEmail(email);

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );

  return {
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    }
  };
};

module.exports = {
  register,
  login
};