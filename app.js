const path = require('path');
const express = require('express');

// Подключаем обработчики событий (задел на будущую интеграцию с KeyStep)
require('./events/listeners');

const wordsRoutes = require('./routes/wordsRoutes');
const categoriesRoutes = require('./routes/categoriesRoutes');
const healthRoutes = require('./routes/healthRoutes');
const spaFallback = require('./middleware/spaFallback');
const { errorHandler, apiNotFoundHandler } = require('./middleware/errorHandler');
const { API_PREFIX } = require('./config/constants');

const app = express();
const publicDir = path.join(__dirname, 'public');

app.use(express.json());
app.use(express.static(publicDir));

app.use(`${API_PREFIX}/words`, wordsRoutes);
app.use(`${API_PREFIX}/categories`, categoriesRoutes);
app.use(`${API_PREFIX}/health`, healthRoutes);

// Любой не-API GET-запрос (например, прямой переход на /review) отдаёт
// index.html — дальше клиентский роутер сам решает, что рендерить.
app.use(spaFallback(publicDir));

// Если запрос дошёл сюда — это /api/v1/... запрос, не попавший ни в один роут
app.use(API_PREFIX, apiNotFoundHandler);

// Централизованный обработчик ошибок — всегда последним
app.use(errorHandler);

module.exports = app;
