const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userRepository = require('../data/userRepository');
const { createUser } = require('../models/user');
const { validateCredentials } = require('../validators/authValidator');
const { ValidationError, ConflictError, UnauthorizedError } = require('../errors/AppError');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/constants');

// bcryptjs — чистый JS без нативной компиляции. Для serverless это важнее,
// чем небольшой выигрыш в скорости у нативного bcrypt: не нужно беспокоиться
// о совместимости бинарника между окружением сборки и рантаймом Vercel.
const SALT_ROUNDS = 10;

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

async function register({ email, password }) {
  validateCredentials({ email, password });

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await userRepository.getUserRowByEmail(normalizedEmail);

  if (existing) {
    throw new ConflictError('Пользователь с таким email уже зарегистрирован');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = createUser({ email: normalizedEmail, passwordHash });
  const savedUser = await userRepository.addUser(user);

  return { user: savedUser, token: signToken(savedUser) };
}

async function login({ email, password }) {
  if (!email || !password) {
    throw new ValidationError('Укажите email и пароль');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const row = await userRepository.getUserRowByEmail(normalizedEmail);

  // Намеренно один и тот же текст ошибки для "нет такого email" и
  // "неверный пароль" — иначе форма логина превращается в способ
  // проверить, какие email зарегистрированы в системе.
  if (!row) {
    throw new UnauthorizedError('Неверный email или пароль');
  }

  const passwordMatches = await bcrypt.compare(password, row.password_hash);

  if (!passwordMatches) {
    throw new UnauthorizedError('Неверный email или пароль');
  }

  const user = userRepository.mapUserRow(row);
  return { user, token: signToken(user) };
}

module.exports = { register, login };
