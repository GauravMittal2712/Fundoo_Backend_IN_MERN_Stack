const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const message = error.details.map((d) => d.message).join(', ');
    return next(new ApiError(400, message));
  }
  req.body = value;
  next();
};

module.exports = validate;