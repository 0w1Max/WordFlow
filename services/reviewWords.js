const wordRepository = require('../data/wordRepository');
const { NotFoundError } = require('../errors/AppError');
const appEvents = require('../events/emitter');
const { computeNextReview } = require('./spacedRepetition');

// Страница "Повторение" показывает только слова, которые пора повторить
// сегодня — раньше здесь возвращались вообще все слова без учёта
// расписания. Управление всей базой слов теперь отдельная функция,
// см. services/wordsService.js -> getAllWords.
async function getWordsForReview(userId) {
  return wordRepository.getDueWords(userId);
}

async function markWordReviewed(id, userId, remembered) {
  const word = await wordRepository.getWordById(id, userId);

  if (!word) {
    throw new NotFoundError(`Слово с id=${id} не найдено`);
  }

  const next = computeNextReview(
    { intervalDays: word.intervalDays, easeFactor: word.easeFactor },
    remembered
  );

  const updated = await wordRepository.markReviewed(id, userId, next);

  appEvents.emit('word.reviewed', { ...updated, remembered });

  return updated;
}

module.exports = { getWordsForReview, markWordReviewed };
