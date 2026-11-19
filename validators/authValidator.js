const { ValidationError } = require('../errors/AppError');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 8) {
    throw new ValidationError('Пароль должен быть не короче 8 символов', 'password');
  }
  // bcrypt silently truncates inputs beyond 72 UTF-8 bytes.
  if (Buffer.byteLength(password, 'utf8') > 72) {
    throw new ValidationError('Пароль должен занимать не более 72 байт UTF-8', 'password');
  }
}

function validateCredentials({ email, password }) {
  if (typeof email !== 'string' || email.length > 254 || !EMAIL_RE.test(email.trim())) {
    throw new ValidationError('Укажите корректный email', 'email');
  }
  validatePassword(password);
}

module.exports = { validateCredentials, validatePassword };
