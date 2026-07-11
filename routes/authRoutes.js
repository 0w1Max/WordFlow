const express = require('express');
const router = express.Router();

const {
  registerController,
  loginController,
  logoutController,
  meController,
  forgotPasswordController,
  resetPasswordController
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { authRateLimiter } = require('../middleware/rateLimiters');

router.post('/register', authRateLimiter, registerController);
router.post('/login', authRateLimiter, loginController);
router.post('/logout', logoutController);
router.get('/me', requireAuth, meController);
router.post('/forgot-password', authRateLimiter, forgotPasswordController);
router.post('/reset-password', authRateLimiter, resetPasswordController);

module.exports = router;
