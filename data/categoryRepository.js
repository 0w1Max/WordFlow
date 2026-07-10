const db = require('../db/db.js');

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (error) {
      if (error) reject(error);
      else resolve(this);
    });
  });
}

function getAllQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) reject(error);
      else resolve(rows);
    });
  });
}

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
  const sql = 'INSERT INTO categories (user_id, name) VALUES (?, ?)';
  const result = await runQuery(sql, [category.userId, category.name]);

  return {
    id: result.lastID,
    userId: category.userId,
    name: category.name
  };
}

async function getAllCategories(userId) {
  const sql = 'SELECT * FROM categories WHERE user_id = ? ORDER BY name';
  const rows = await getAllQuery(sql, [userId]);
  return rows.map(mapCategoryRow);
}

module.exports = { addCategory, getAllCategories };
