const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { validatePassword } = require('../validators/authValidator');

test('HTML escaping protects text and quoted attribute contexts', async () => {
  const { escapeHtml } = await import('../public/app/core/html.js');
  assert.equal(
    escapeHtml('" autofocus onfocus="alert(1)<>&\''),
    '&quot; autofocus onfocus=&quot;alert(1)&lt;&gt;&amp;&#39;'
  );
});

test('password validation checks UTF-8 byte length', () => {
  assert.doesNotThrow(() => validatePassword('я'.repeat(36)));
  assert.throws(() => validatePassword('я'.repeat(37)));
});

test('accent picker uses the same UTF-16 offsets as the server', async () => {
  const { accentPickerHtml } = await import('../public/app/core/typography.js');
  assert.match(accentPickerHtml('😀а', 2), /data-index="2"/);
});

test('SQLite timestamps are exposed with an explicit UTC timezone', () => {
  const { toIsoDate } = require('../data/dateMapper');
  assert.equal(toIsoDate('2026-11-06 12:00:00'), '2026-11-06T12:00:00Z');
  assert.equal(toIsoDate(null), null);
});

test('production fails closed without a strong JWT secret and trusted origin', () => {
  for (const overrides of [
    { JWT_SECRET: '' },
    { JWT_SECRET: 'short' },
    { APP_ORIGIN: '' },
    { APP_ORIGIN: 'http://example.com' }
  ]) {
    const result = spawnSync(process.execPath, ['-e', "require('./config/constants')"], {
      env: {
        ...process.env,
        NODE_ENV: 'production',
        JWT_SECRET: 'x'.repeat(64),
        APP_ORIGIN: 'https://example.com',
        ...overrides
      }
    });
    assert.notEqual(result.status, 0);
  }
});
