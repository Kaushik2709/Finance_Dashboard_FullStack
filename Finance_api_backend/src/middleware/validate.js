const { validationResult } = require('express-validator');

const { AppError } = require('../utils/errors');

const validate = (rules) => {
  if (!Array.isArray(rules)) {
    throw new Error('validate(rules) expects an array of express-validator rules');
  }

  return [
    ...rules,
    (req, res, next) => {
      const errors = validationResult(req);

      if (errors.isEmpty()) {
        return next();
      }

      const details = errors.array({ onlyFirstError: true }).map((error) => ({
        field: error.path || error.param || 'request',
        message: error.msg,
      }));

      return next(new AppError('Validation failed', 422, 'VALIDATION_ERROR', details));
    },
  ];
};

module.exports = validate;