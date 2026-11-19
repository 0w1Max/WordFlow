const crypto = require('node:crypto');
const isProduction = process.env.NODE_ENV === 'production';
const configuredSecret = process.env.JWT_SECRET;
if (
  isProduction &&
  (!configuredSecret ||
    configuredSecret.length < 32 ||
    configuredSecret.startsWith('replace-with-'))
) {
  throw new Error('Production requires a random JWT_SECRET of at least 32 characters');
}
const origin = process.env.APP_ORIGIN || (!isProduction ? 'http://localhost:3000' : '');
let parsedOrigin;
try {
  parsedOrigin = new URL(origin);
} catch {
  throw new Error('APP_ORIGIN must be an absolute application URL');
}
if (
  !['http:', 'https:'].includes(parsedOrigin.protocol) ||
  parsedOrigin.username ||
  parsedOrigin.password ||
  (isProduction && parsedOrigin.protocol !== 'https:')
) {
  throw new Error('APP_ORIGIN must use HTTPS in production and contain no credentials');
}

module.exports = {
  API_PREFIX: '/api/v1',
  PORT: process.env.PORT || 3000,
  APP_ORIGIN: parsedOrigin.origin,
  TRUST_PROXY: process.env.TRUST_PROXY === '1' ? 1 : false,
  // Development tokens cannot be forged with a shared default secret.
  JWT_SECRET: configuredSecret || crypto.randomBytes(32).toString('hex'),
  JWT_EXPIRES_IN: '30d',
  AUTH_COOKIE_NAME: 'wordflow_token'
};
