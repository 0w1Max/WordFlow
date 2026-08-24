const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

// Подключаем обработчики событий (задел на будущую интеграцию с KeyStep)
require('./events/listeners');

const wordsRoutes = require('./routes/wordsRoutes');
const categoriesRoutes = require('./routes/categoriesRoutes');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const spaFallback = require('./middleware/spaFallback');
const { requireAuth } = require('./middleware/auth');
const { apiRateLimiter } = require('./middleware/rateLimiters');
const { errorHandler, apiNotFoundHandler } = require('./middleware/errorHandler');
const { API_PREFIX } = require('./config/constants');

const app = express();
const publicDir = path.join(__dirname, 'public');

// Vercel (как и большинство хостингов) ставит приложение за прокси и передаёт
// реальный IP клиента через X-Forwarded-For. Без этой настройки Express (а
// вместе с ним express-rate-limit) видел бы IP прокси одинаковым для всех
// пользователей — то есть все посетители сайта делили бы один общий лимит
// запросов вместо лимита "на посетителя".
app.set('trust proxy', 1);

// helmet выставляет набор стандартных security-заголовков (X-Content-Type-
// -Options, отключение X-Powered-By и т.д.) — раньше их не было вообще.
app.use(helmet());

// Helmet по умолчанию ставит Cross-Origin-Resource-Policy: same-origin —
// это верно для HTML/статики сайта, но мешает браузерному расширению
// WordFlow читать ответы API из своего привилегированного контекста
// (chrome-extension://...). Снимаем ограничение только для /api — страница
// сайта и статика по-прежнему same-origin, как и раньше.
app.use(API_PREFIX, (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

app.use(express.json());
app.use(cookieParser());
app.use(express.static(publicDir));

app.use(API_PREFIX, apiRateLimiter);

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/health`, healthRoutes);

// Всё, что ниже, требует авторизации — requireAuth кладёт req.user.id,
// которым пользуются контроллеры вместо старого DEFAULT_USER_ID.
app.use(`${API_PREFIX}/words`, requireAuth, wordsRoutes);
app.use(`${API_PREFIX}/categories`, requireAuth, categoriesRoutes);

// Любой не-API GET-запрос (например, прямой переход на /review) отдаёт
// index.html — дальше клиентский роутер сам решает, что рендерить.
app.use(spaFallback(publicDir));

// Если запрос дошёл сюда — это /api/v1/... запрос, не попавший ни в один роут
app.use(API_PREFIX, apiNotFoundHandler);

// Централизованный обработчик ошибок — всегда последним
app.use(errorHandler);

module.exports = app;
