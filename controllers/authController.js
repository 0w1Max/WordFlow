const authService = require('../services/authService');
const { AUTH_COOKIE_NAME } = require('../config/constants');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней, совпадает с JWT_EXPIRES_IN
  path: '/'
};

async function registerController(req, res) {
  const { email, password } = req.body;
  const { user, token } = await authService.register({ email, password });

  res.cookie(AUTH_COOKIE_NAME, token, COOKIE_OPTIONS);
  res.status(201).json({ user });
}

async function loginController(req, res) {
  const { email, password } = req.body;
  const { user, token } = await authService.login({ email, password });

  res.cookie(AUTH_COOKIE_NAME, token, COOKIE_OPTIONS);
  res.json({ user });
}

function logoutController(req, res) {
  res.clearCookie(AUTH_COOKIE_NAME, { path: '/' });
  res.status(204).end();
}

function meController(req, res) {
  // requireAuth уже отработал до этого контроллера и положил req.user
  res.json({ user: req.user });
}

async function forgotPasswordController(req, res) {
  const { email } = req.body;
  // req.protocol корректно определяет https благодаря app.set('trust proxy', 1) —
  // без этой настройки за прокси Vercel он всегда показывал бы http.
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  await authService.requestPasswordReset(email, baseUrl);

  // Один и тот же ответ независимо от того, существует email или нет —
  // см. комментарий в authService.requestPasswordReset.
  res.json({ message: 'Если такой email зарегистрирован, письмо со ссылкой уже отправлено' });
}

async function resetPasswordController(req, res) {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);

  res.json({ message: 'Пароль успешно изменён' });
}

// "Попробовать без регистрации" — создаёт обычный аккаунт с сгенерированными
// email/паролем и сразу выдаёт ту же cookie-сессию, что и логин/регистрация.
// Дальше гость ничем не отличается от обычного пользователя для остального
// API (слова, категории и т.д.).
async function guestController(req, res) {
  const { user, token } = await authService.createGuestSession();

  res.cookie(AUTH_COOKIE_NAME, token, COOKIE_OPTIONS);
  res.status(201).json({ user });
}

// "Сохранить прогресс" — привязывает email/пароль к уже существующему
// (гостевому) аккаунту вместо создания нового, поэтому все слова и
// категории, собранные как гость, остаются на месте.
async function claimController(req, res) {
  const { email, password } = req.body;
  const { user, token } = await authService.claimAccount(req.user.id, { email, password });

  res.cookie(AUTH_COOKIE_NAME, token, COOKIE_OPTIONS);
  res.json({ user });
}

module.exports = {
  registerController,
  loginController,
  logoutController,
  meController,
  forgotPasswordController,
  resetPasswordController,
  guestController,
  claimController
};
