const Sentry = require('@sentry/node');

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0,
    sendDefaultPii: false,
    beforeSend(event) {
      delete event.request;
      delete event.user;
      return event;
    }
  });
} else {
  console.warn(
    '[sentry] SENTRY_DSN не задан — мониторинг ошибок отключён. ' +
      'Задайте SENTRY_DSN в переменных окружения, если нужно отслеживание ошибок в проде.'
  );
}

module.exports = Sentry;
