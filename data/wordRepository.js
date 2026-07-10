const db = require('../db/db.js');

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (error) {
      if (error) reject(error);
      else resolve(this);
    });
  });
}

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) reject(error);
      else resolve(row);
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

// Раньше POST /words возвращал camelCase (из JS-объекта), а GET /words —
// сырые строки БД в snake_case. Теперь это единственное место, где строка
// БД превращается в объект API — оба эндпоинта гарантированно отдают
// одинаковую форму данных.
function mapWordRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    categoryId: row.category_id,
    text: row.text,
    meaning: row.meaning,
    example: row.example,
    createdAt: row.created_at,
    lastReview: row.last_review,
    reviewCount: row.review_count
  };
}

async function addWord(word) {
  const sql = `
    INSERT INTO words (user_id, category_id, text, meaning, example)
    VALUES (?, ?, ?, ?, ?)
  `;

  const result = await runQuery(sql, [
    word.userId,
    word.categoryId,
    word.text,
    word.meaning,
    word.example
  ]);

  return getWordById(result.lastID, word.userId);
}

async function getWordById(id, userId) {
  const sql = 'SELECT * FROM words WHERE id = ? AND user_id = ?';
  const row = await getQuery(sql, [id, userId]);
  return mapWordRow(row);
}

async function getAllWords(userId) {
  const sql = 'SELECT * FROM words WHERE user_id = ? ORDER BY created_at DESC';
  const rows = await getAllQuery(sql, [userId]);
  return rows.map(mapWordRow);
}

// Отмечает слово как повторённое: +1 к reviewCount и обновление last_review.
// Возвращает null, если слово с таким id не найдено (или принадлежит другому
// пользователю) — вызывающая сторона решает, бросать ли NotFoundError.
async function markReviewed(id, userId) {
  const sql = `
    UPDATE words
    SET review_count = review_count + 1,
        last_review = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `;

  const result = await runQuery(sql, [id, userId]);

  if (result.changes === 0) {
    return null;
  }

  return getWordById(id, userId);
}

module.exports = {
  addWord,
  getAllWords,
  getWordById,
  markReviewed
};
