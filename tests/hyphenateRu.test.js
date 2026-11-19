const { test } = require('node:test');
const assert = require('node:assert/strict');
const domModulePromise = import('../public/app/core/typography.js');

test('hyphenateRu: не трогает короткие слова (< 6 букв)', async () => {
  const { hyphenateRu } = await domModulePromise;

  assert.equal(hyphenateRu('слово'), 'слово');
  assert.equal(hyphenateRu('кот'), 'кот');
});

test('hyphenateRu: "Серендипность" — переносы ровно там, где и должны быть', async () => {
  const { hyphenateRu } = await domModulePromise;
  const result = hyphenateRu('Серендипность');
  const breakPositions = [...result.matchAll(/\u00AD/g)].map((m) => m.index);

  assert.equal(result, 'Се\u00ADрен\u00ADдип\u00ADность');
  assert.deepEqual(breakPositions, [2, 6, 10]);
});

test('hyphenateRu: "Петрикор" — переносы по слогам "Пет-ри-кор"', async () => {
  const { hyphenateRu } = await domModulePromise;

  assert.equal(hyphenateRu('Петрикор'), 'Пет\u00ADри\u00ADкор');
});

test('hyphenateRu: не оставляет ъ/ь/й в начале новой строки', async () => {
  const { hyphenateRu } = await domModulePromise;
  const result = hyphenateRu('больница');

  for (const breakIndex of [...result.matchAll(/\u00AD/g)].map((m) => m.index)) {
    const nextChar = result[breakIndex + 1];
    assert.ok(!'ьъйЬЪЙ'.includes(nextChar), `после переноса не должно быть "${nextChar}"`);
  }
});

test('hyphenateRu: не переносит, если по любую сторону осталось меньше 2 символов', async () => {
  const { hyphenateRu } = await domModulePromise;
  const result = hyphenateRu('уснуть');

  for (const breakIndex of [...result.matchAll(/\u00AD/g)].map((m) => m.index)) {
    assert.ok(breakIndex >= 2, 'перед переносом должно быть минимум 2 символа');
    assert.ok(result.length - 1 - breakIndex >= 2, 'после переноса должно быть минимум 2 символа');
  }
});

test('hyphenateRu: слово без гласных (или с < 2 гласными) не переносится', async () => {
  const { hyphenateRu } = await domModulePromise;

  assert.equal(hyphenateRu('ммм-ммм-ммм'), 'ммм-ммм-ммм');
});

test('wordWithAccentHtml: переносит части слова до и после ударной буквы независимо', async () => {
  const { hyphenateRu } = await domModulePromise;
  const before = 'Серен';
  const after = 'ность';

  assert.equal(hyphenateRu(before), 'Серен');
  assert.equal(hyphenateRu(after), 'ность');
});

test('findHyphenationBreakpoints: у "Серендипность" все 3 точки переноса доступны, а не только первая', async () => {
  const { findHyphenationBreakpoints } = await domModulePromise;
  const breakpoints = findHyphenationBreakpoints('Серендипность');

  assert.deepEqual(breakpoints, [2, 5, 8]);
});

test('findHyphenationBreakpoints: у "Петрикор" обе точки переноса доступны', async () => {
  const { findHyphenationBreakpoints } = await domModulePromise;

  assert.deepEqual(findHyphenationBreakpoints('Петрикор'), [3, 5]);
});
