const { ValidationError } = require('../errors/AppError');
module.exports = function validateId(req, res, next, value) {
  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) {
    throw new ValidationError('Некорректный идентификатор');
  }
  next();
};
