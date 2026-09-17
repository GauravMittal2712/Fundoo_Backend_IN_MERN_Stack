const Joi = require('joi');

const add = Joi.object({
  noteId: Joi.string().hex().length(24).required(),
  email: Joi.string().email().required()
});

module.exports = { add };