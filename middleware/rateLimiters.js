const rateLimit = require('express-rate-limit');
// Memory counters are per process; use a shared store for a global serverless limit.
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Слишком много запросов, попробуйте позже' }
});
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Слишком много попыток входа, попробуйте позже' }
});

module.exports = { apiRateLimiter, authRateLimiter };
