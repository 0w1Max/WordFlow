const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createWord, normalizeAccentIndex } = require('../models/word');

test('normalizeAccentIndex: возвращает null, если индекс не передан', () => {
  assert.equal(normalizeAccentIndex(null, 'Слово'), null);
  assert.equal(normalizeAccentIndex(undefined, 'Слово'), null);
});

test('normalizeAccentIndex: без пробелов по краям индекс не меняется', () => {
  // "Слово": С(0)л(1)о(2)в(3)о(4) — индекс 3 указывает на "в"
  assert.equal(normalizeAccentIndex(3, 'Слово'), 3);
});

test('normalizeAccentIndex: сдвигает индекс на длину обрезанных слева пробелов', () => {
  // "  Слово" — 2 пробела слева, значит индекс 3 ("в" в исходной строке
  // с пробелами) после trim() должен стать 1
  assert.equal(normalizeAccentIndex(5, '  Слово'), 3);
});

test('normalizeAccentIndex: отбрасывает индекс, вышедший за границы после сдвига', () => {
  // Индекс 0 указывал на первый пробел — после сдвига стал бы -2,
  // это не валидная позиция буквы, значит помечать нечего.
  assert.equal(normalizeAccentIndex(0, '  Слово'), null);
});

test('normalizeAccentIndex: отбрасывает индекс, вышедший за пределы длины слова', () => {
  assert.equal(normalizeAccentIndex(99, 'Слово'), null);
  assert.equal(normalizeAccentIndex(-1, 'Слово'), null);
});

test('createWord: сохраняет корректный accentIndex вместе со словом', () => {
  const word = createWord({ text: 'Петрикор', meaning: 'запах земли после дождя', userId: 1, accentIndex: 6 });
  assert.equal(word.accentIndex, 6);
  assert.equal(word.text, 'Петрикор');
});

test('createWord: accentIndex по умолчанию null, если не передан', () => {
  const word = createWord({ text: 'Слово', meaning: 'Значение', userId: 1 });
  assert.equal(word.accentIndex, null);
});
