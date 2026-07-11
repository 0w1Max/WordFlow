const { client, ensureReady } = require('../db/db.js');

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
  await ensureReady();

  const result = await client.execute({
    sql: `
      INSERT INTO words (user_id, category_id, text, meaning, example)
      VALUES (?, ?, ?, ?, ?)
    `,
    args: [word.userId, word.categoryId, word.text, word.meaning, word.example]
  });

  // lastInsertRowid приходит как BigInt — приводим к Number, id в этом
  // проекте не приближается к пределу безопасного целого JS.
  return getWordById(Number(result.lastInsertRowid), word.userId);
}

async function getWordById(id, userId) {
  await ensureReady();

  const result = await client.execute({
    sql: 'SELECT * FROM words WHERE id = ? AND user_id = ?',
    args: [id, userId]
  });

  return mapWordRow(result.rows[0]);
}

async function getAllWords(userId) {
  await ensureReady();

  const result = await client.execute({
    sql: 'SELECT * FROM words WHERE user_id = ? ORDER BY created_at DESC',
    args: [userId]
  });

  return result.rows.map(mapWordRow);
}

// Отмечает слово как повторённое: +1 к reviewCount и обновление last_review.
// Возвращает null, если слово с таким id не найдено (или принадлежит другому
// пользователю) — вызывающая сторона решает, бросать ли NotFoundError.
async function markReviewed(id, userId) {
  await ensureReady();

  const result = await client.execute({
    sql: `
      UPDATE words
      SET review_count = review_count + 1,
          last_review = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `,
    args: [id, userId]
  });

  if (result.rowsAffected === 0) {
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
