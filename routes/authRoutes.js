const express = require('express');
const router = express.Router();

const {
  registerController,
  loginController,
  logoutController,
  meController
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { authRateLimiter } = require('../middleware/rateLimiters');

router.post('/register', authRateLimiter, registerController);
router.post('/login', authRateLimiter, loginController);
router.post('/logout', logoutController);
router.get('/me', requireAuth, meController);

module.exports = router;
