// Sentry нужно инициализировать раньше, чем что-либо ещё импортирует
// приложение — поэтому этот файл требуется первым делом в api/index.js
// и server.js, до require('./app').
//
// Если SENTRY_DSN не задан (например, при локальной разработке без
// настроенного аккаунта) — просто ничего не делаем, приложение работает
// как раньше, без мониторинга ошибок.
const Sentry = require('@sentry/node');

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    // Нас интересует только отслеживание ошибок, не performance-трейсинг —
    // держим это выключенным, чтобы не расходовать лимит бесплатного плана
    // на события, которые никто не будет смотреть.
    tracesSampleRate: 0
  });
} else {
  console.warn(
    '[sentry] SENTRY_DSN не задан — мониторинг ошибок отключён. ' +
    'Задайте SENTRY_DSN в переменных окружения, если нужно отслеживание ошибок в проде.'
  );
}

module.exports = Sentry;
