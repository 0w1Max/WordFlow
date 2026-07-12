const jwt = require('jsonwebtoken');
const { JWT_SECRET, AUTH_COOKIE_NAME } = require('../config/constants');
const { UnauthorizedError } = require('../errors/AppError');

// Читает JWT из httpOnly-куки (не localStorage — так токен недоступен
// клиентскому JS и не может быть украден через XSS) и кладёт req.user.
// Дальше все контроллеры слов/категорий используют req.user.id вместо
// DEFAULT_USER_ID.
function requireAuth(req, res, next) {
  const token = req.cookies && req.cookies[AUTH_COOKIE_NAME];

  if (!token) {
    return next(new UnauthorizedError());
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email, isGuest: !!payload.isGuest };
    next();
  } catch {
    next(new UnauthorizedError('Сессия истекла или недействительна, войдите заново'));
  }
}

module.exports = { requireAuth };
