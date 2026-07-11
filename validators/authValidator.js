const { ValidationError } = require('../errors/AppError');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateCredentials({ email, password }) {
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    throw new ValidationError('Укажите корректный email');
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    throw new ValidationError('Пароль должен быть не короче 8 символов');
  }
}

module.exports = { validateCredentials };
