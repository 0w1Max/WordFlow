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

module.exports = {
  registerController,
  loginController,
  logoutController,
  meController
};
