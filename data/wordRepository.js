const { client, ensureReady } = require('../db/db.js');

// Раньше POST /words возвращал camelCase (из JS-объекта), а GET /words —
// сырые строки БД в snake_case. Теперь это единственное место, где строка
// БД превращается в объект API — все эндпоинты гарантированно отдают
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
    reviewCount: row.review_count,
    nextReviewAt: row.next_review_at,
    intervalDays: row.interval_days,
    easeFactor: row.ease_factor
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

// Слова, которые пора повторить сегодня (next_review_at в прошлом или
// сейчас) — именно это должна показывать страница "Повторение", в отличие
// от getAllWords, которая используется для страницы управления словами.
async function getDueWords(userId) {
  await ensureReady();

  const result = await client.execute({
    sql: `
      SELECT * FROM words
      WHERE user_id = ? AND next_review_at <= CURRENT_TIMESTAMP
      ORDER BY next_review_at ASC
    `,
    args: [userId]
  });

  return result.rows.map(mapWordRow);
}

// Записывает результат повторения слова: новый интервал/ease-фактор/дату
// следующего показа считает services/spacedRepetition.js — сюда приходят
// уже готовые значения, репозиторий только сохраняет их.
async function markReviewed(id, userId, { intervalDays, easeFactor, nextReviewAt }) {
  await ensureReady();

  const result = await client.execute({
    sql: `
      UPDATE words
      SET review_count = review_count + 1,
          last_review = CURRENT_TIMESTAMP,
          interval_days = ?,
          ease_factor = ?,
          next_review_at = ?
      WHERE id = ? AND user_id = ?
    `,
    args: [intervalDays, easeFactor, nextReviewAt, id, userId]
  });

  if (result.rowsAffected === 0) {
    return null;
  }

  return getWordById(id, userId);
}

async function updateWord(id, userId, { text, meaning, example, categoryId }) {
  await ensureReady();

  const result = await client.execute({
    sql: `
      UPDATE words
      SET text = ?, meaning = ?, example = ?, category_id = ?
      WHERE id = ? AND user_id = ?
    `,
    args: [text, meaning, example, categoryId, id, userId]
  });

  if (result.rowsAffected === 0) {
    return null;
  }

  return getWordById(id, userId);
}

async function deleteWord(id, userId) {
  await ensureReady();

  const result = await client.execute({
    sql: 'DELETE FROM words WHERE id = ? AND user_id = ?',
    args: [id, userId]
  });

  return result.rowsAffected > 0;
}

module.exports = {
  addWord,
  getAllWords,
  getDueWords,
  getWordById,
  markReviewed,
  updateWord,
  deleteWord
};
