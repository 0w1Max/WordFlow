const wordRepository = require('../data/wordRepository');
const { validateWordInput } = require('../validators/wordValidator');
const { normalizeAccentIndex } = require('../models/word');
const { NotFoundError } = require('../errors/AppError');

async function getAllWords(userId) {
  return wordRepository.getAllWords(userId);
}

async function updateWord(id, userId, { text, meaning, example, categoryId, accentIndex }) {
  validateWordInput({ text, meaning, accentIndex });

  const updated = await wordRepository.updateWord(id, userId, {
    text: text.trim(),
    meaning: meaning.trim(),
    example: example ? example.trim() : null,
    categoryId: categoryId || null,
    // См. подробный комментарий в models/word.js: индекс приходит от
    // фронтенда посчитанным по ещё не обрезанной строке, здесь та же
    // логика пересчёта/отбрасывания, что и при создании слова.
    accentIndex: normalizeAccentIndex(accentIndex, text)
  });

  if (!updated) {
    throw new NotFoundError(`Слово с id=${id} не найдено`);
  }

  return updated;
}

async function deleteWord(id, userId) {
  const deleted = await wordRepository.deleteWord(id, userId);

  if (!deleted) {
    throw new NotFoundError(`Слово с id=${id} не найдено`);
  }
}

module.exports = { getAllWords, updateWord, deleteWord };
