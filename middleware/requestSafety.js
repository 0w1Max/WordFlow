const { APP_ORIGIN } = require('../config/constants');
const { AppError, ValidationError } = require('../errors/AppError');

module.exports = function requestSafety(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.get('origin');
  if (req.get('sec-fetch-site') === 'cross-site' || (origin && origin !== APP_ORIGIN)) {
    throw new AppError('Запрос с другого сайта запрещён', 403);
  }
  if (
    req.body !== undefined &&
    (!req.body || typeof req.body !== 'object' || Array.isArray(req.body))
  ) {
    throw new ValidationError('Ожидается JSON-объект');
  }
  req.body ??= {};
  next();
};
