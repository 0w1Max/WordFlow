const { AppError } = require('../errors/AppError');

// Express 5 сам пробрасывает отклонённые промисы из async-контроллеров сюда,
// поэтому в контроллерах больше не нужен try/catch на каждый роут.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Неожиданная ошибка — не показываем стектрейс клиенту, только логируем на сервере
  console.error('Необработанная ошибка:', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
}

function apiNotFoundHandler(req, res) {
  res.status(404).json({ error: 'Маршрут не найден' });
}

module.exports = { errorHandler, apiNotFoundHandler };
