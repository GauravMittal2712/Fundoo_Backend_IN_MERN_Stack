const Joi = require('joi');

const update = Joi.object({
  firstName: Joi.string().min(2).max(50),
  lastName: Joi.string().min(2).max(50),
  profileImage: Joi.string().allow('')
}).min(1);

// Either the password or a fresh Google credential must be sent
const deleteAccount = Joi.object({
  password: Joi.string().max(200),
  credential: Joi.string()
}).or('password', 'credential');

module.exports = { update, deleteAccount };