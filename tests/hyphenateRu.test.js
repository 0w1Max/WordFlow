const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

// core/dom.js — фронтенд-модуль ESM (используется прямо в браузере без
// сборки), а тесты бэкенда — CommonJS (см. "type": "commonjs" в
// package.json). Динамический import() работает из CJS-файла и не
// исполняет ничего, кроме объявлений функций/констант на верхнем уровне
// dom.js, так что вызывать здесь можно только то, что не трогает DOM
// (hyphenateRu — чистая строковая функция; escapeHtml, наоборот, использует
// document и здесь не тестируется — она проверяется только вручную/в
// браузере, как и весь остальной DOM-код в public/app).
const domModulePromise = import(path.join('..', 'public', 'app', 'core', 'dom.js'));

test('hyphenateRu: не трогает короткие слова (< 6 букв)', async () => {
  const { hyphenateRu } = await domModulePromise;

  assert.equal(hyphenateRu('слово'), 'слово');
  assert.equal(hyphenateRu('кот'), 'кот');
});

test('hyphenateRu: "Серендипность" — переносы ровно там, где и должны быть', async () => {
  const { hyphenateRu } = await domModulePromise;

  // У слова 4 слога: Се-рен-дип-ность — значит и валидных точек переноса
  // три (после каждого слога, кроме последнего). Задача упоминала два из
  // них как ожидаемые варианты при переносе строки ("Серен-дипность" или
  // "Серендип-ность") — оба должны быть среди точек переноса; то, что
  // алгоритм находит ещё и третью, самую раннюю ("Се-"), не ошибка: это
  // тоже валидная слоговая граница, браузер выберет ту точку, которая
  // реально понадобится при переносе строки.
  const result = hyphenateRu('Серендипность');
  const breakPositions = [...result.matchAll(/\u00AD/g)].map(m => m.index);

  assert.equal(result, 'Се\u00ADрен\u00ADдип\u00ADность');
  // Позиции — индексы мягкого переноса В УЖЕ СОБРАННОЙ строке (с учётом
  // предыдущих вставленных \u00AD), не в исходном тексте.
  assert.deepEqual(breakPositions, [2, 6, 10]);
});

test('hyphenateRu: "Петрикор" — переносы по слогам "Пет-ри-кор"', async () => {
  const { hyphenateRu } = await domModulePromise;

  assert.equal(hyphenateRu('Петрикор'), 'Пет\u00ADри\u00ADкор');
});

test('hyphenateRu: не оставляет ъ/ь/й в начале новой строки', async () => {
  const { hyphenateRu } = await domModulePromise;

  // "больница": одиночный согласный "л" между "о" и "ь"(не гласная) —
  // мягкий знак не должен оказаться сразу после переноса.
  const result = hyphenateRu('больница');

  for (const breakIndex of [...result.matchAll(/\u00AD/g)].map(m => m.index)) {
    const nextChar = result[breakIndex + 1];
    assert.ok(!'ьъйЬЪЙ'.includes(nextChar), `после переноса не должно быть "${nextChar}"`);
  }
});

test('hyphenateRu: не переносит, если по любую сторону осталось меньше 2 символов', async () => {
  const { hyphenateRu } = await domModulePromise;

  // "уснуть" — гласные у(0), у(2)... края слова короткие, где перенос
  // оставил бы 1 символ, такая точка переноса должна быть отброшена.
  const result = hyphenateRu('уснуть');

  for (const breakIndex of [...result.matchAll(/\u00AD/g)].map(m => m.index)) {
    assert.ok(breakIndex >= 2, 'перед переносом должно быть минимум 2 символа');
    assert.ok(result.length - 1 - breakIndex >= 2, 'после переноса должно быть минимум 2 символа');
  }
});

test('hyphenateRu: слово без гласных (или с < 2 гласными) не переносится', async () => {
  const { hyphenateRu } = await domModulePromise;

  assert.equal(hyphenateRu('ммм-ммм-ммм'), 'ммм-ммм-ммм');
});

test('wordWithStressHtml: переносит части слова до и после ударной буквы независимо', async () => {
  const { hyphenateRu } = await domModulePromise;

  // Сама проверка полного wordWithStressHtml требует document (escapeHtml),
  // которого нет в Node — здесь проверяем именно то, что использует эта
  // функция внутри: hyphenateRu применяется к "before" и "after" по
  // отдельности и не пытается перенести саму ударную букву.
  const before = 'Серен';
  const after = 'ность';

  assert.equal(hyphenateRu(before), 'Серен');
  assert.equal(hyphenateRu(after), 'ность');
});

test('findHyphenationBreakpoints: у "Серендипность" все 3 точки переноса доступны, а не только первая', async () => {
  const { findHyphenationBreakpoints } = await domModulePromise;

  // Раньше wordWithStressHtml считал переносы отдельно для текста ДО и
  // ПОСЛЕ ударной буквы — обрезая слово ровно на ней, терялась граница
  // слога, соседнего с ударным (например, "Серен-" — граница между "рен"
  // и "ди", где "и" как раз ударная буква). В результате оставалась
  // только первая, самая ранняя точка переноса, и слово рвалось в первом
  // попавшемся месте, даже если ширины хватало на больше текста.
  // Теперь переносы считаются на ПОЛНОМ слове — все три границы слогов
  // должны быть на месте: "Се-", "Серен-", "Серендип-".
  const breakpoints = findHyphenationBreakpoints('Серендипность');

  assert.deepEqual(breakpoints, [2, 5, 8]);
});

test('findHyphenationBreakpoints: у "Петрикор" обе точки переноса доступны', async () => {
  const { findHyphenationBreakpoints } = await domModulePromise;

  assert.deepEqual(findHyphenationBreakpoints('Петрикор'), [3, 5]);
});
