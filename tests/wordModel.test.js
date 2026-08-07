const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createWord, normalizeStressIndex } = require('../models/word');

test('normalizeStressIndex: возвращает null, если индекс не передан', () => {
  assert.equal(normalizeStressIndex(null, 'Слово'), null);
  assert.equal(normalizeStressIndex(undefined, 'Слово'), null);
});

test('normalizeStressIndex: без пробелов по краям индекс не меняется', () => {
  // "Слово": С(0)л(1)о(2)в(3)о(4) — индекс 3 указывает на "в"
  assert.equal(normalizeStressIndex(3, 'Слово'), 3);
});

test('normalizeStressIndex: сдвигает индекс на длину обрезанных слева пробелов', () => {
  // "  Слово" — 2 пробела слева, значит индекс 3 ("в" в исходной строке
  // с пробелами) после trim() должен стать 1
  assert.equal(normalizeStressIndex(5, '  Слово'), 3);
});

test('normalizeStressIndex: отбрасывает индекс, вышедший за границы после сдвига', () => {
  // Индекс 0 указывал на первый пробел — после сдвига стал бы -2,
  // это не валидная позиция буквы, значит помечать нечего.
  assert.equal(normalizeStressIndex(0, '  Слово'), null);
});

test('normalizeStressIndex: отбрасывает индекс, вышедший за пределы длины слова', () => {
  assert.equal(normalizeStressIndex(99, 'Слово'), null);
  assert.equal(normalizeStressIndex(-1, 'Слово'), null);
});

test('createWord: сохраняет корректный stressIndex вместе со словом', () => {
  const word = createWord({ text: 'Петрикор', meaning: 'запах земли после дождя', userId: 1, stressIndex: 6 });
  assert.equal(word.stressIndex, 6);
  assert.equal(word.text, 'Петрикор');
});

test('createWord: stressIndex по умолчанию null, если не передан', () => {
  const word = createWord({ text: 'Слово', meaning: 'Значение', userId: 1 });
  assert.equal(word.stressIndex, null);
});
