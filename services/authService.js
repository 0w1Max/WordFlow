const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userRepository = require('../data/userRepository');
const { createUser } = require('../models/user');
const { validateCredentials, validatePassword } = require('../validators/authValidator');
const { ValidationError, ConflictError, UnauthorizedError } = require('../errors/AppError');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/constants');
const { sendPasswordResetEmail } = require('./emailService');
const SALT_ROUNDS = 10;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 час

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, isGuest: !!user.isGuest, version: user.tokenVersion ?? 0 },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN
    }
  );
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
  if (typeof email !== 'string' || !email.trim() || email.length > 254) {
    throw new ValidationError('Укажите email', 'email');
  }

  if (typeof password !== 'string' || !password || password.length > 1024) {
    throw new ValidationError('Укажите пароль', 'password');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const row = await userRepository.getUserRowByEmail(normalizedEmail);
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
async function requestPasswordReset(email, baseUrl) {
  if (!email || typeof email !== 'string') {
    throw new ValidationError('Укажите email', 'email');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const row = await userRepository.getUserRowByEmail(normalizedEmail);
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

  validatePassword(newPassword);

  const tokenHash = hashToken(token);
  const row = await userRepository.getUserRowByResetTokenHash(tokenHash);

  if (!row) {
    throw new ValidationError('Ссылка для сброса пароля недействительна или устарела');
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  const changed = await userRepository.updatePassword(row.id, passwordHash, tokenHash);
  if (!changed) throw new ValidationError('Ссылка для сброса пароля недействительна или устарела');
}
async function createGuestSession() {
  const guestEmail = `guest-${crypto.randomBytes(6).toString('hex')}@wordflow.local`;
  const randomPassword = crypto.randomBytes(24).toString('hex');
  const passwordHash = await bcrypt.hash(randomPassword, SALT_ROUNDS);

  const user = await userRepository.addGuestUser(guestEmail, passwordHash);
  return { user, token: signToken(user) };
}
async function claimAccount(userId, { email, password }) {
  validateCredentials({ email, password });

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await userRepository.getUserRowByEmail(normalizedEmail);

  if (existing && existing.id !== userId) {
    throw new ConflictError('Пользователь с таким email уже зарегистрирован');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userRepository.claimGuestUser(userId, {
    email: normalizedEmail,
    passwordHash
  });

  if (!user) throw new ConflictError('Сохранить прогресс можно только для гостевого аккаунта');
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
