// Упрощённая версия алгоритма SM-2 (используется в Anki и похожих системах).
// Настоящий SM-2 оценивает качество ответа по шкале 0-5, но у нас в UI
// сейчас только бинарный выбор "вспомнил/не вспомнил" — этого достаточно
// для рабочей версии, полную шкалу можно добавить позже, не трогая
// остальной код (вся логика инкапсулирована в этой одной функции).
//
// Правила:
// - "не вспомнил": интервал сбрасывается на 1 день, ease-фактор немного
//   снижается (но не ниже 1.3) — слово будет попадаться чаще.
// - "вспомнил" в первый раз: следующий показ через 1 день.
// - "вспомнил" второй раз подряд: через 6 дней (стандартные для SM-2
//   стартовые интервалы).
// - дальше интервал умножается на ease-фактор и слегка растёт сам
//   ease-фактор (но не выше 2.5) — чем увереннее пользователь помнит
//   слово, тем реже оно показывается.
const MIN_EASE_FACTOR = 1.3;
const MAX_EASE_FACTOR = 2.5;
const DAY_MS = 24 * 60 * 60 * 1000;

function computeNextReview({ intervalDays, easeFactor }, remembered) {
  let nextInterval;
  let nextEase = easeFactor;

  if (!remembered) {
    nextInterval = 1;
    nextEase = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);
  } else if (intervalDays === 0) {
    nextInterval = 1;
  } else if (intervalDays === 1) {
    nextInterval = 6;
  } else {
    nextInterval = Math.round(intervalDays * easeFactor);
    nextEase = Math.min(MAX_EASE_FACTOR, easeFactor + 0.05);
  }

  const nextReviewAt = new Date(Date.now() + nextInterval * DAY_MS);

  return {
    intervalDays: nextInterval,
    easeFactor: nextEase,
    nextReviewAt: nextReviewAt.toISOString()
  };
}

module.exports = { computeNextReview };
