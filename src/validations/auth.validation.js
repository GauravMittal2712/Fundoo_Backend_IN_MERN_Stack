const Joi = require('joi');

const register = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const forgotPassword = Joi.object({
  email: Joi.string().email().required()
});

const resetPassword = Joi.object({
  password: Joi.string().min(6).required()
});

const googleLogin = Joi.object({
  credential: Joi.string().required()
});

module.exports = { register, login, forgotPassword, resetPassword, googleLogin };