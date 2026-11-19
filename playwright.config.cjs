const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/browser',
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:3107',
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'node server.js',
    url: 'http://127.0.0.1:3107/api/v1/health',
    reuseExistingServer: false,
    env: {
      PORT: '3107',
      NODE_ENV: 'test',
      TURSO_DATABASE_URL: 'file::memory:',
      TURSO_AUTH_TOKEN: '',
      APP_ORIGIN: 'http://127.0.0.1:3107',
      JWT_SECRET: 'browser-test-secret-at-least-32-characters',
      SENTRY_DSN: ''
    }
  }
});
