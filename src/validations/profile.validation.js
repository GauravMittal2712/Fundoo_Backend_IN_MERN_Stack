const Joi = require('joi');

const update = Joi.object({
  firstName: Joi.string().min(2).max(50),
  lastName: Joi.string().min(2).max(50),
  profileImage: Joi.string().allow('')
}).min(1);

module.exports = { update };