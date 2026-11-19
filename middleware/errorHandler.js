const { AppError } = require('../errors/AppError');
const Sentry = require('../instrument');
async function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  if (/category ownership violation/.test(err.message))
    return res.status(400).json({ error: 'Категория недоступна', field: 'categoryId' });
  if (err.type === 'entity.parse.failed')
    return res.status(400).json({ error: 'Некорректный JSON' });
  if (err.type === 'entity.too.large')
    return res.status(413).json({ error: 'Слишком большой запрос' });
  if (/UNIQUE constraint failed: users.email/.test(err.message))
    return res.status(409).json({ error: 'Пользователь с таким email уже зарегистрирован' });
  if (err instanceof AppError) {
    const body = { error: err.message };
    if (err.field) body.field = err.field;

    return res.status(err.statusCode).json(body);
  }
  console.error('Необработанная ошибка:', err);

  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err);
    await Sentry.flush(2000);
  }

  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
}

function apiNotFoundHandler(req, res) {
  res.status(404).json({ error: 'Маршрут не найден' });
}

module.exports = { errorHandler, apiNotFoundHandler };
