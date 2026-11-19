const wordRepository = require('../data/wordRepository');
const { NotFoundError, ValidationError } = require('../errors/AppError');
const appEvents = require('../events/emitter');
const { computeNextReview } = require('./spacedRepetition');
async function getWordsForReview(userId) {
  return wordRepository.getDueWords(userId);
}

async function markWordReviewed(id, userId, remembered) {
  if (typeof remembered !== 'boolean')
    throw new ValidationError('Некорректный результат повторения', 'remembered');
  const word = await wordRepository.getWordById(id, userId);

  if (!word) {
    throw new NotFoundError(`Слово с id=${id} не найдено`);
  }

  const next = computeNextReview(
    { intervalDays: word.intervalDays, easeFactor: word.easeFactor },
    remembered
  );

  const updated = await wordRepository.markReviewed(id, userId, next);

  if (!updated) throw new NotFoundError('Слово не найдено');
  appEvents.emit('word.reviewed', { ...updated, remembered });

  return updated;
}

module.exports = { getWordsForReview, markWordReviewed };
