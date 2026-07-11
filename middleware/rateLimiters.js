const rateLimit = require('express-rate-limit');

// ВАЖНО: на Vercel каждая serverless-функция может выполняться в разных,
// не связанных между собой инстансах — express-rate-limit по умолчанию
// хранит счётчики в памяти процесса, поэтому лимит соблюдается "на инстанс",
// а не глобально по всему проекту. Это по-прежнему полезно (отсекает грубые
// автоматические атаки одного клиента, попавшего на один и тот же тёплый
// инстанс), но не является строгой гарантией. Для полноценной защиты в
// высоконагруженном проде стоит перейти на store с общим хранилищем
// (например, @upstash/ratelimit поверх Redis).

// Общий лимит на все API-запросы — грубая защита от простого флуда.
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Слишком много запросов, попробуйте позже' }
});

// Более строгий лимит на логин/регистрацию — защита от подбора пароля.
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Слишком много попыток входа, попробуйте позже' }
});

module.exports = { apiRateLimiter, authRateLimiter };
