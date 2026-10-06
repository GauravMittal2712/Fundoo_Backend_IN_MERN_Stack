const Joi = require('joi');

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).+$/;

const strongPassword = Joi.string()
  .min(8)
  .max(72)
  .pattern(PASSWORD_PATTERN)
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters',
    'string.max': 'Password must be at most 72 characters',
    'string.pattern.base':
      'Password must include an uppercase letter, a lowercase letter, a number and a special character',
    'string.empty': 'Password is required',
    'any.required': 'Password is required'
  });

const register = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: strongPassword
});

const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const forgotPassword = Joi.object({
  email: Joi.string().email().required()
});

const resetPassword = Joi.object({
  password: strongPassword
});

const googleLogin = Joi.object({
  credential: Joi.string().required()
});

module.exports = { register, login, forgotPassword, resetPassword, googleLogin };