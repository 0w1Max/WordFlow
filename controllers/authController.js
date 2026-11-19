const authService = require('../services/authService');
const { AUTH_COOKIE_NAME, APP_ORIGIN } = require('../config/constants');

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
  const options = { ...COOKIE_OPTIONS };
  delete options.maxAge;
  res.clearCookie(AUTH_COOKIE_NAME, options);
  res.status(204).end();
}

function meController(req, res) {
  res.json({ user: req.user });
}

async function forgotPasswordController(req, res) {
  const { email } = req.body;
  const baseUrl = APP_ORIGIN;

  await authService.requestPasswordReset(email, baseUrl);
  res.json({ message: 'Если такой email зарегистрирован, письмо со ссылкой уже отправлено' });
}

async function resetPasswordController(req, res) {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);

  res.json({ message: 'Пароль успешно изменён' });
}
async function guestController(req, res) {
  const { user, token } = await authService.createGuestSession();

  res.cookie(AUTH_COOKIE_NAME, token, COOKIE_OPTIONS);
  res.status(201).json({ user });
}
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
