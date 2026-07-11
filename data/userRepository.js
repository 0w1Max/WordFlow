const { client, ensureReady } = require('../db/db.js');

// passwordHash и reset_token_hash никогда не должны уйти в ответ клиенту —
// mapUserRow отдаёт только безопасное подмножество полей.
function mapUserRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    createdAt: row.created_at
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

async function getUserById(id) {
  await ensureReady();

  const result = await client.execute({
    sql: 'SELECT * FROM users WHERE id = ?',
    args: [id]
  });

  return mapUserRow(result.rows[0]);
}

// Возвращает "сырую" строку (с password_hash) — используется только
// сервисом логина для сверки пароля, наружу это уходить не должно.
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

// Ищет пользователя по хэшу токена сброса пароля — в БД никогда не хранится
// "сырой" токен, только его sha256, чтобы утечка базы не давала возможность
// напрямую сбросить чей-то пароль.
async function getUserRowByResetTokenHash(tokenHash) {
  await ensureReady();

  const result = await client.execute({
    sql: `
      SELECT * FROM users
      WHERE reset_token_hash = ? AND reset_token_expires_at > CURRENT_TIMESTAMP
    `,
    args: [tokenHash]
  });

  return result.rows[0] || null;
}

async function updatePassword(userId, passwordHash) {
  await ensureReady();

  // Токен одноразовый — сразу гасим его вместе со сменой пароля, чтобы
  // ссылкой из письма нельзя было воспользоваться повторно.
  await client.execute({
    sql: `
      UPDATE users
      SET password_hash = ?, reset_token_hash = NULL, reset_token_expires_at = NULL
      WHERE id = ?
    `,
    args: [passwordHash, userId]
  });
}

module.exports = {
  addUser,
  getUserById,
  getUserRowByEmail,
  setResetToken,
  getUserRowByResetTokenHash,
  updatePassword,
  mapUserRow
};
