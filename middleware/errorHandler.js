const { AppError } = require('../errors/AppError');
const Sentry = require('../instrument');

// Express 5 сам пробрасывает отклонённые промисы из async-контроллеров сюда,
// поэтому в контроллерах больше не нужен try/catch на каждый роут.
async function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof AppError) {
    // Ожидаемые ошибки (валидация, "не найдено" и т.п.) не шлём в Sentry —
    // это не баги, а нормальная часть работы приложения, незачем тратить
    // на них лимит бесплатного плана.
    //
    // field (если задан у ValidationError) добавляется в ответ отдельным
    // полем — фронтенд использует его, чтобы подсветить конкретное поле
    // формы, а не только показать общий баннер сверху.
    const body = { error: err.message };
    if (err.field) body.field = err.field;

    return res.status(err.statusCode).json(body);
  }

  // Неожиданная ошибка — не показываем стектрейс клиенту, только логируем.
  console.error('Необработанная ошибка:', err);

  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err);
    // Vercel замораживает функцию сразу после отправки ответа, а транспорт
    // Sentry шлёт события асинхронно в фоне — без явного flush событие может
    // просто не успеть уйти и потеряться вместе с "замороженным" инстансом.
    await Sentry.flush(2000);
  }

  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
}

function apiNotFoundHandler(req, res) {
  res.status(404).json({ error: 'Маршрут не найден' });
}

module.exports = { errorHandler, apiNotFoundHandler };
