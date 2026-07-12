const { client, ensureReady } = require('../db/db.js');

// passwordHash и reset_token_hash никогда не должны уйти в ответ клиенту —
// mapUserRow отдаёт только безопасное подмножество полей.
function mapUserRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    isGuest: !!row.is_guest,
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

// Гостевой аккаунт — обычная строка в users с is_guest=1 и сгенерированными
// email/паролем, которыми никто никогда не будет входить руками. Дальше он
// ничем не отличается от обычного пользователя: те же слова, категории,
// тот же JWT в cookie — поэтому весь остальной код (words/categories) не
// нужно было переписывать под "гостевой режим" отдельно.
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

// "Привязка" гостевого аккаунта к настоящему email/паролю — id пользователя
// не меняется, поэтому все его слова и категории (которые ссылаются на этот
// id) остаются на месте. Это и есть весь смысл гостевого режима: попробовать,
// а затем не потерять то, что уже собрано.
async function claimGuestUser(userId, { email, passwordHash }) {
  await ensureReady();

  await client.execute({
    sql: 'UPDATE users SET email = ?, password_hash = ?, is_guest = 0 WHERE id = ?',
    args: [email, passwordHash, userId]
  });

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
