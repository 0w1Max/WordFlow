// Sentry должен инициализироваться раньше всего остального — до того,
// как require('../app') подтянет express и все роуты.
require('../instrument');

// Vercel превращает весь Express-app в одну serverless-функцию:
// https://vercel.com/docs/frameworks/backend/express
//
// app.js уже был написан так, что не вызывает app.listen() сам —
// это делает только server.js (для локальной разработки). Поэтому
// здесь достаточно просто реэкспортировать готовое приложение.
module.exports = require('../app');
