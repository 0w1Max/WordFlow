const { client, ensureReady } = require('../db/db.js');

function mapCategoryRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    createdAt: row.created_at
  };
}

async function addCategory(category) {
  await ensureReady();

  const result = await client.execute({
    sql: 'INSERT INTO categories (user_id, name) VALUES (?, ?)',
    args: [category.userId, category.name]
  });

  return {
    id: Number(result.lastInsertRowid),
    userId: category.userId,
    name: category.name
  };
}

async function getAllCategories(userId) {
  await ensureReady();

  const result = await client.execute({
    sql: 'SELECT * FROM categories WHERE user_id = ? ORDER BY name',
    args: [userId]
  });

  return result.rows.map(mapCategoryRow);
}

// Схема объявляет FOREIGN KEY ... ON DELETE SET NULL, но PRAGMA foreign_keys
// — настройка уровня соединения, а @libsql/client работает поверх HTTP, где
// нет гарантии, что она сохранится к моменту этого запроса. Поэтому не
// полагаемся на автоматический каскад, а явно отвязываем слова от категории
// перед её удалением — так безопаснее вне зависимости от поведения драйвера.
async function deleteCategory(id, userId) {
  await ensureReady();

  await client.execute({
    sql: 'UPDATE words SET category_id = NULL WHERE category_id = ? AND user_id = ?',
    args: [id, userId]
  });

  const result = await client.execute({
    sql: 'DELETE FROM categories WHERE id = ? AND user_id = ?',
    args: [id, userId]
  });

  return result.rowsAffected > 0;
}

module.exports = { addCategory, getAllCategories, deleteCategory };
