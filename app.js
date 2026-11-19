const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const wordsRoutes = require('./routes/wordsRoutes');
const categoriesRoutes = require('./routes/categoriesRoutes');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const spaFallback = require('./middleware/spaFallback');
const { requireAuth } = require('./middleware/auth');
const { apiRateLimiter } = require('./middleware/rateLimiters');
const { errorHandler, apiNotFoundHandler } = require('./middleware/errorHandler');
const { API_PREFIX, TRUST_PROXY } = require('./config/constants');

const app = express();
const publicDir = path.join(__dirname, 'public');
app.set('trust proxy', TRUST_PROXY);
app.use(helmet());
app.use(API_PREFIX, (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());
app.use(express.static(publicDir));

app.use(API_PREFIX, apiRateLimiter);
app.use(API_PREFIX, require('./middleware/requestSafety'));
app.use(API_PREFIX, (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/health`, healthRoutes);
app.use(`${API_PREFIX}/words`, requireAuth, wordsRoutes);
app.use(`${API_PREFIX}/categories`, requireAuth, categoriesRoutes);
app.use(spaFallback(publicDir));
app.use(API_PREFIX, apiNotFoundHandler);
app.use(errorHandler);

module.exports = app;
