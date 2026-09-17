const Joi = require('joi');

const create = Joi.object({
  name: Joi.string().min(1).max(100).required()
});

const update = Joi.object({
  name: Joi.string().min(1).max(100).required()
});

module.exports = { create, update };