const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
process.env.TURSO_DATABASE_URL = 'file::memory:';
delete process.env.TURSO_AUTH_TOKEN;
process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters';
process.env.APP_ORIGIN = 'http://localhost:3000';
process.env.NODE_ENV = 'test';
delete process.env.SENTRY_DSN;
const app = require('../app');
const { client, ensureReady } = require('../db/db');
const auth = require('../services/authService');
const users = require('../data/userRepository');
let server, base, owner, other;

before(async () => {
  await ensureReady();
  owner = await auth.register({ email: 'owner@example.com', password: 'password123' });
  other = await auth.register({ email: 'other@example.com', password: 'password123' });
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}/api/v1`;
});
after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  client.close();
});

async function request(path, { method = 'GET', body, token = owner.token, headers = {} } = {}) {
  const response = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', Cookie: `wordflow_token=${token}`, ...headers },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const data = response.status === 204 ? null : await response.json();
  return { status: response.status, data, headers: response.headers };
}

test('API rejects unauthenticated, malformed, cross-origin and invalid-type requests', async () => {
  assert.equal((await request('/words', { token: '' })).status, 401);
  assert.equal(
    (await request('/auth/login', { method: 'POST', body: { email: {}, password: [] } })).status,
    400
  );
  assert.equal((await request('/auth/register', { method: 'POST' })).status, 400);
  assert.equal((await request('/words', { method: 'POST', body: [] })).status, 400);
  assert.equal(
    (await request('/auth/logout', { method: 'POST', headers: { Origin: 'https://evil.example' } }))
      .status,
    403
  );
  assert.equal((await request('/words/1oops', { method: 'DELETE' })).status, 400);
  const malformed = await fetch(base + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{'
  });
  assert.equal(malformed.status, 400);
  assert.equal((await request('/auth/me')).headers.get('cache-control'), 'no-store');
});

test('word CRUD preserves accents, isolates users and prevents foreign categories', async () => {
  const category = await request('/categories', { method: 'POST', body: { name: 'Category' } });
  assert.equal(category.status, 201);
  const body = {
    text: '  слово  ',
    meaning: 'Meaning',
    accentIndex: 4,
    categoryId: category.data.id
  };
  assert.equal((await request('/words', { method: 'POST', body, token: other.token })).status, 400);
  assert.equal(
    (await request('/words', { method: 'POST', body: { ...body, example: {} } })).status,
    400
  );
  const word = await request('/words', { method: 'POST', body });
  assert.equal(word.status, 201);
  assert.equal(word.data.text, 'слово');
  assert.equal(word.data.accentIndex, 2);
  const id = word.data.id;
  assert.equal(
    (await request(`/words/${id}`, { method: 'PUT', body, token: other.token })).status,
    400
  );
  assert.equal(
    (await request(`/words/${id}`, { method: 'DELETE', token: other.token })).status,
    404
  );
  assert.equal((await request('/words', { token: other.token })).data.length, 0);
  assert.equal(
    (await request(`/words/${id}/review`, { method: 'POST', body: { remembered: 'false' } }))
      .status,
    400
  );
  assert.equal(
    (await request(`/words/${id}/review`, { method: 'POST', body: { remembered: false } })).status,
    200
  );
  assert.equal(
    (await request('/words/due')).data.some((w) => w.id === id),
    false
  );
  await client.execute({
    sql: 'UPDATE words SET next_review_at = ? WHERE id = ?',
    args: [new Date(Date.now() - 60000).toISOString(), id]
  });
  assert.equal(
    (await request('/words/due')).data.some((w) => w.id === id),
    true
  );
  assert.equal(
    (await request(`/categories/${category.data.id}`, { method: 'DELETE' })).status,
    204
  );
  assert.equal((await request('/words')).data.find((w) => w.id === id).categoryId, null);
  assert.equal((await request(`/words/${id}`, { method: 'DELETE' })).status, 204);
});

test('only a guest can claim an account, retaining words and revoking the guest token', async () => {
  const body = { email: 'claimed@example.com', password: 'password123' };
  assert.equal((await request('/auth/claim', { method: 'POST', body })).status, 409);
  const guest = await auth.createGuestSession();
  await request('/words', {
    method: 'POST',
    token: guest.token,
    body: { text: 'Guest', meaning: 'Kept' }
  });
  const claimed = await auth.claimAccount(guest.user.id, body);
  assert.equal(claimed.user.id, guest.user.id);
  assert.equal(claimed.user.isGuest, false);
  assert.equal((await request('/words', { token: claimed.token })).data.length, 1);
  assert.equal((await request('/auth/me', { token: guest.token })).status, 401);
  await assert.rejects(auth.claimAccount(guest.user.id, body));
});

test('password reset expiry, atomic consumption and session revocation', async () => {
  const account = await auth.register({ email: 'reset@example.com', password: 'password123' });
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  await users.setResetToken(account.user.id, hash, new Date(Date.now() - 60000).toISOString());
  await assert.rejects(auth.resetPassword(token, 'new-password123'));
  await users.setResetToken(account.user.id, hash, new Date(Date.now() + 60000).toISOString());
  const results = await Promise.allSettled([
    auth.resetPassword(token, 'new-password123'),
    auth.resetPassword(token, 'new-password123')
  ]);
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
  assert.equal((await request('/auth/me', { token: account.token })).status, 401);
  const login = await auth.login({ email: 'reset@example.com', password: 'new-password123' });
  assert.equal((await request('/auth/me', { token: login.token })).status, 200);
});
