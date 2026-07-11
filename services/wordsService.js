const wordRepository = require('../data/wordRepository');
const { validateWordInput } = require('../validators/wordValidator');
const { NotFoundError } = require('../errors/AppError');

async function getAllWords(userId) {
  return wordRepository.getAllWords(userId);
}

async function updateWord(id, userId, { text, meaning, example, categoryId }) {
  validateWordInput({ text, meaning });

  const updated = await wordRepository.updateWord(id, userId, {
    text: text.trim(),
    meaning: meaning.trim(),
    example: example ? example.trim() : null,
    categoryId: categoryId || null
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
