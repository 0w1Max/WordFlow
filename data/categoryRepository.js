const { client, ensureReady } = require('../db/db.js');
const { toIsoDate } = require('./dateMapper');

function mapCategoryRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    createdAt: toIsoDate(row.created_at)
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
async function deleteCategory(id, userId) {
  await ensureReady();

  const results = await client.batch(
    [
      {
        sql: 'UPDATE words SET category_id = NULL WHERE category_id = ? AND user_id = ?',
        args: [id, userId]
      },
      {
        sql: 'DELETE FROM categories WHERE id = ? AND user_id = ?',
        args: [id, userId]
      }
    ],
    'write'
  );

  return results[1].rowsAffected > 0;
}

async function getCategoryById(id, userId) {
  await ensureReady();
  const result = await client.execute({
    sql: 'SELECT * FROM categories WHERE id = ? AND user_id = ?',
    args: [id, userId]
  });
  return mapCategoryRow(result.rows[0]);
}

module.exports = { getCategoryById, addCategory, getAllCategories, deleteCategory };
