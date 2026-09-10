const Joi = require('joi');

const create = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().allow('').max(5000),
  color: Joi.string().optional(),
  labels: Joi.array().items(Joi.string()).optional(),
  isPinned: Joi.boolean().optional()
});

const update = Joi.object({
  title: Joi.string().min(1).max(200),
  description: Joi.string().allow('').max(5000),
  color: Joi.string(),
  labels: Joi.array().items(Joi.string()),
  isPinned: Joi.boolean()
}).min(1);

module.exports = { create, update };