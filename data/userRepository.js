const { client, ensureReady } = require('../db/db.js');
const { toIsoDate } = require('./dateMapper');
function mapUserRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    isGuest: !!row.is_guest,
    tokenVersion: row.token_version,
    createdAt: toIsoDate(row.created_at)
  };
}

async function addUser(user) {
  await ensureReady();

  const result = await client.execute({
    sql: 'INSERT INTO users (email, password_hash) VALUES (?, ?)',
    args: [user.email, user.passwordHash]
  });

  return getUserById(Number(result.lastInsertRowid));
}
async function addGuestUser(email, passwordHash) {
  await ensureReady();

  const result = await client.execute({
    sql: 'INSERT INTO users (email, password_hash, is_guest) VALUES (?, ?, 1)',
    args: [email, passwordHash]
  });

  return getUserById(Number(result.lastInsertRowid));
}

async function getUserById(id) {
  await ensureReady();

  const result = await client.execute({
    sql: 'SELECT * FROM users WHERE id = ?',
    args: [id]
  });

  return mapUserRow(result.rows[0]);
}
async function getUserRowByEmail(email) {
  await ensureReady();

  const result = await client.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email]
  });

  return result.rows[0] || null;
}

async function setResetToken(userId, tokenHash, expiresAt) {
  await ensureReady();

  await client.execute({
    sql: 'UPDATE users SET reset_token_hash = ?, reset_token_expires_at = ? WHERE id = ?',
    args: [tokenHash, expiresAt, userId]
  });
}
async function getUserRowByResetTokenHash(tokenHash) {
  await ensureReady();

  const result = await client.execute({
    sql: `
      SELECT * FROM users
      WHERE reset_token_hash = ? AND datetime(reset_token_expires_at) > CURRENT_TIMESTAMP
    `,
    args: [tokenHash]
  });

  return result.rows[0] || null;
}

async function updatePassword(userId, passwordHash, tokenHash) {
  await ensureReady();
  const result = await client.execute({
    sql: `
      UPDATE users
      SET password_hash = ?, token_version = token_version + 1, reset_token_hash = NULL, reset_token_expires_at = NULL
      WHERE id = ? AND reset_token_hash = ? AND datetime(reset_token_expires_at) > CURRENT_TIMESTAMP
    `,
    args: [passwordHash, userId, tokenHash]
  });
  return result.rowsAffected > 0;
}
async function claimGuestUser(userId, { email, passwordHash }) {
  await ensureReady();

  const result = await client.execute({
    sql: 'UPDATE users SET email = ?, password_hash = ?, is_guest = 0, token_version = token_version + 1 WHERE id = ? AND is_guest = 1',
    args: [email, passwordHash, userId]
  });
  if (!result.rowsAffected) return null;

  return getUserById(userId);
}

module.exports = {
  addUser,
  addGuestUser,
  getUserById,
  getUserRowByEmail,
  setResetToken,
  getUserRowByResetTokenHash,
  updatePassword,
  claimGuestUser,
  mapUserRow
};
