const Joi = require('joi');

const create = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().allow('').max(5000),
  color: Joi.string().optional(),
  labels: Joi.array().items(Joi.string().hex().length(24)).optional(),
  isPinned: Joi.boolean().optional()
});

const update = Joi.object({
  title: Joi.string().min(1).max(200),
  description: Joi.string().allow('').max(5000),
  color: Joi.string(),
  labels: Joi.array().items(Joi.string().hex().length(24)),
  isPinned: Joi.boolean()
}).min(1);

const setReminder = Joi.object({
  dateTime: Joi.date().iso().greater('now').required()
});

module.exports = { create, update, setReminder };