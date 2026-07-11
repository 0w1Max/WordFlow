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

module.exports = { addCategory, getAllCategories };
