const { client, ensureReady } = require('../db/db.js');

// passwordHash никогда не должен уйти в ответ клиенту — mapUserRow отдаёт
// только безопасное подмножество полей. Если нужен хеш (при проверке
// пароля на логине), берём его из сырой строки БД напрямую, а не отсюда.
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

module.exports = { addUser, getUserById, getUserRowByEmail, mapUserRow };
