const wordRepository = require('../data/wordRepository');
const { NotFoundError } = require('../errors/AppError');
const appEvents = require('../events/emitter');
const { DEFAULT_USER_ID } = require('../config/constants');

async function getWordsForReview() {
  return wordRepository.getAllWords(DEFAULT_USER_ID);
}

// Полноценного алгоритма интервального повторения (SM-2 и т.п.) здесь пока
// нет — это осознанно оставлено на следующий этап по роадмапу. Но базовая
// механика "отметить слово повторённым" нужна уже сейчас, чтобы review_count
// и last_review вообще начали накапливать данные для будущего алгоритма.
async function markWordReviewed(id) {
  const updated = await wordRepository.markReviewed(id, DEFAULT_USER_ID);

  if (!updated) {
    throw new NotFoundError(`Слово с id=${id} не найдено`);
  }

  appEvents.emit('word.reviewed', updated);

  return updated;
}

module.exports = { getWordsForReview, markWordReviewed };
