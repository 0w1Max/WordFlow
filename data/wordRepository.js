const { client, ensureReady } = require('../db/db.js');
const { toIsoDate } = require('./dateMapper');
function mapWordRow(row) {
  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    categoryId: row.category_id,
    text: row.text,
    meaning: row.meaning,
    example: row.example,
    accentIndex: row.accent_index === undefined ? null : row.accent_index,
    createdAt: toIsoDate(row.created_at),
    lastReview: toIsoDate(row.last_review),
    reviewCount: row.review_count,
    nextReviewAt: toIsoDate(row.next_review_at),
    intervalDays: row.interval_days,
    easeFactor: row.ease_factor
  };
}

async function addWord(word) {
  await ensureReady();

  const result = await client.execute({
    sql: `
      INSERT INTO words (user_id, category_id, text, meaning, example, accent_index)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    args: [
      word.userId,
      word.categoryId,
      word.text,
      word.meaning,
      word.example,
      word.accentIndex ?? null
    ]
  });
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
async function getDueWords(userId) {
  await ensureReady();

  const result = await client.execute({
    sql: `
      SELECT * FROM words
      WHERE user_id = ? AND datetime(next_review_at) <= CURRENT_TIMESTAMP
      ORDER BY datetime(next_review_at) ASC
    `,
    args: [userId]
  });

  return result.rows.map(mapWordRow);
}
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

async function updateWord(id, userId, { text, meaning, example, categoryId, accentIndex }) {
  await ensureReady();

  const result = await client.execute({
    sql: `
      UPDATE words
      SET text = ?, meaning = ?, example = ?, category_id = ?, accent_index = ?
      WHERE id = ? AND user_id = ?
    `,
    args: [text, meaning, example, categoryId, accentIndex ?? null, id, userId]
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
