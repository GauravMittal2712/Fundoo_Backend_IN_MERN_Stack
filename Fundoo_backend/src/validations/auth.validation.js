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

module.exports = { register, login };