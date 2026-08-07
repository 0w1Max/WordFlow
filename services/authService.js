const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userRepository = require('../data/userRepository');
const { createUser } = require('../models/user');
const { validateCredentials } = require('../validators/authValidator');
const { ValidationError, ConflictError, UnauthorizedError } = require('../errors/AppError');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/constants');
const { sendPasswordResetEmail } = require('./emailService');

// bcryptjs — чистый JS без нативной компиляции. Для serverless это важнее,
// чем небольшой выигрыш в скорости у нативного bcrypt: не нужно беспокоиться
// о совместимости бинарника между окружением сборки и рантаймом Vercel.
const SALT_ROUNDS = 10;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 час

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, isGuest: !!user.isGuest }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
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
  // Разделяем на два отдельных случая (а не общее "укажите email и
  // пароль"), чтобы фронтенд мог подсветить именно то поле, которое
  // пустое, а не оба сразу.
  if (!email) {
    throw new ValidationError('Укажите email', 'email');
  }

  if (!password) {
    throw new ValidationError('Укажите пароль', 'password');
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

// baseUrl — адрес сайта, на который вести из письма (собирается в
// контроллере из самого запроса, см. controllers/authController.js), чтобы
// не хардкодить домен и корректно работать и на превью-деплоях Vercel.
async function requestPasswordReset(email, baseUrl) {
  if (!email || typeof email !== 'string') {
    throw new ValidationError('Укажите email', 'email');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const row = await userRepository.getUserRowByEmail(normalizedEmail);

  // Намеренно не сообщаем, существует ли такой email в системе — иначе
  // форма "забыли пароль" превращается в способ проверить чужие email.
  // Просто ничего не делаем, если пользователя нет, и всегда отвечаем
  // одинаково успешно (см. authController.js).
  if (!row) {
    return;
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString();

  await userRepository.setResetToken(row.id, tokenHash, expiresAt);

  const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;
  await sendPasswordResetEmail(row.email, resetUrl);
}

async function resetPassword(token, newPassword) {
  if (!token || typeof token !== 'string') {
    throw new ValidationError('Отсутствует токен сброса пароля');
  }

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
    throw new ValidationError('Пароль должен быть не короче 8 символов', 'password');
  }

  const tokenHash = hashToken(token);
  const row = await userRepository.getUserRowByResetTokenHash(tokenHash);

  if (!row) {
    throw new ValidationError('Ссылка для сброса пароля недействительна или устарела');
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await userRepository.updatePassword(row.id, passwordHash);
}

// Гостевая сессия — обычный аккаунт с сгенерированными email/паролем,
// которыми никто и никогда не будет пытаться войти. Дальше это такой же
// пользователь, как и любой другой: тот же JWT в той же httpOnly-cookie,
// то же ограничение по user_id на все слова и категории.
//
// ВАЖНО: httpOnly-cookie — единственное, что связывает браузер с этим
// аккаунтом, и она намеренно недоступна из JS (иначе токен можно было бы
// украсть через XSS). Это значит, что распознать "того же" анонимного
// посетителя после явного logout нечем: каждый вызов этой функции создаёт
// новый пустой аккаунт. Раньше кнопка "Выйти" делала это молча, и человек
// без предупреждения терял все слова, собранные как гость. Единственный
// предусмотренный путь сохранить гостевые данные — claimAccount ниже
// (привязать email/пароль к ЭТОМУ ЖЕ user_id до выхода); фронтенд теперь
// явно предупреждает об этом перед logout (см. dashboard.page.js).
async function createGuestSession() {
  const guestEmail = `guest-${crypto.randomBytes(6).toString('hex')}@wordflow.local`;
  const randomPassword = crypto.randomBytes(24).toString('hex');
  const passwordHash = await bcrypt.hash(randomPassword, SALT_ROUNDS);

  const user = await userRepository.addGuestUser(guestEmail, passwordHash);
  return { user, token: signToken(user) };
}

// "Привязка" гостевого аккаунта к настоящему email/паролю. id пользователя
// не меняется — все уже собранные слова и категории просто продолжают
// ссылаться на тот же user_id, ничего не переносится и не теряется.
async function claimAccount(userId, { email, password }) {
  validateCredentials({ email, password });

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await userRepository.getUserRowByEmail(normalizedEmail);

  if (existing && existing.id !== userId) {
    throw new ConflictError('Пользователь с таким email уже зарегистрирован');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userRepository.claimGuestUser(userId, { email: normalizedEmail, passwordHash });

  return { user, token: signToken(user) };
}

module.exports = {
  register,
  login,
  requestPasswordReset,
  resetPassword,
  createGuestSession,
  claimAccount
};
