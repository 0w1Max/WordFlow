const jwt = require('jsonwebtoken');
const { JWT_SECRET, AUTH_COOKIE_NAME } = require('../config/constants');
const { UnauthorizedError } = require('../errors/AppError');
const users = require('../data/userRepository');

async function requireAuth(req, res, next) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) throw new UnauthorizedError();
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    throw new UnauthorizedError('Сессия истекла или недействительна, войдите заново');
  }
  if (!Number.isSafeInteger(payload.sub) || payload.sub <= 0) throw new UnauthorizedError();
  const user = await users.getUserById(payload.sub);
  if (!user || (payload.version ?? 0) !== user.tokenVersion) throw new UnauthorizedError();
  req.user = { id: user.id, email: user.email, isGuest: user.isGuest };
  next();
}

module.exports = { requireAuth };
