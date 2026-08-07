// Тесты для services/spacedRepetition.js — упрощённого SM-2.
// Запуск: npm test (использует встроенный в Node test runner, без
// дополнительных зависимостей — см. package.json).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { computeNextReview } = require('../services/spacedRepetition');

const DAY_MS = 24 * 60 * 60 * 1000;

function daysBetween(fromIso) {
  return Math.round((new Date(fromIso).getTime() - Date.now()) / DAY_MS);
}

test('новое слово, "вспомнил" в первый раз → интервал 1 день', () => {
  const result = computeNextReview({ intervalDays: 0, easeFactor: 2.5 }, true);

  assert.equal(result.intervalDays, 1);
  assert.equal(result.easeFactor, 2.5, 'ease-фактор не должен меняться на первом шаге');
  assert.equal(daysBetween(result.nextReviewAt), 1);
});

test('"вспомнил" второй раз подряд (после интервала 1) → интервал 6 дней', () => {
  const result = computeNextReview({ intervalDays: 1, easeFactor: 2.5 }, true);

  assert.equal(result.intervalDays, 6);
  assert.equal(result.easeFactor, 2.5);
});

test('"вспомнил" на зрелом интервале → интервал растёт на ease-фактор, ease чуть увеличивается', () => {
  const result = computeNextReview({ intervalDays: 6, easeFactor: 2.3 }, true);

  // Math.round(6 * 2.3) = 14
  assert.equal(result.intervalDays, 14);
  // 2.3 + 0.05 не равно 2.35 ровно из-за бинарного представления float
  // (даёт 2.3499999999999996) — сравниваем с допуском, а не строгим equal.
  assert.ok(Math.abs(result.easeFactor - 2.35) < 1e-9, `ожидали ~2.35, получили ${result.easeFactor}`);
});

test('ease-фактор не растёт выше потолка 2.5', () => {
  const result = computeNextReview({ intervalDays: 10, easeFactor: 2.5 }, true);

  assert.equal(result.easeFactor, 2.5, 'MAX_EASE_FACTOR = 2.5 не должен превышаться');
});

test('"не вспомнил" → интервал всегда сбрасывается на 1 день, независимо от прошлого интервала', () => {
  const result = computeNextReview({ intervalDays: 30, easeFactor: 2.3 }, false);

  assert.equal(result.intervalDays, 1);
  assert.equal(daysBetween(result.nextReviewAt), 1);
});

test('"не вспомнил" → ease-фактор снижается на 0.2', () => {
  const result = computeNextReview({ intervalDays: 30, easeFactor: 2.0 }, false);

  assert.equal(result.easeFactor, 1.8);
});

test('ease-фактор не падает ниже пола 1.3', () => {
  const result = computeNextReview({ intervalDays: 5, easeFactor: 1.35 }, false);

  assert.equal(result.easeFactor, 1.3, 'MIN_EASE_FACTOR = 1.3 не должен пробиваться вниз');
});

test('nextReviewAt всегда валидная ISO-дата в будущем', () => {
  const result = computeNextReview({ intervalDays: 0, easeFactor: 2.5 }, true);
  const parsed = new Date(result.nextReviewAt);

  assert.equal(Number.isNaN(parsed.getTime()), false);
  assert.ok(parsed.getTime() > Date.now());
});
