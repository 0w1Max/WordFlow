// Модель отвечает только за форму объекта слова. Проверка данных
// (обязательные поля и т.п.) — в validators/wordValidator.js, вызывающая
// сторона (services/addWord.js, services/wordsService.js) обязана вызвать
// валидацию до createWord/normalizeStressIndex.
function createWord({ text, meaning, example = null, userId, categoryId = null, stressIndex = null }) {
  return {
    text: text.trim(),
    meaning: meaning.trim(),
    example: example ? example.trim() : null,
    userId,
    categoryId,
    stressIndex: normalizeStressIndex(stressIndex, text),
    lastReview: null,
    reviewCount: 0
  };
}

// Человек отмечает ударение, кликая по букве в поле ввода — индекс
// приходит с фронтенда посчитанным от исходной, ещё НЕ обрезанной строки
// (см. stressPickerHtml в public/app/core/dom.js). Если по краям слова
// были пробелы, text.trim() их уберёт, и без пересчёта индекс "уехал" бы
// на другую букву. Здесь сдвигаем индекс на длину обрезанных слева
// пробелов и на всякий случай перепроверяем, что он всё ещё попадает в
// границы уже обрезанного слова — если нет (например, стёрли часть слова
// после того, как отметили ударение), молча отбрасываем метку, а не
// ломаем сохранение самого слова.
function normalizeStressIndex(stressIndex, rawText) {
  if (stressIndex === null || stressIndex === undefined) return null;

  const trimmedText = rawText.trim();
  const leadingTrimmedCount = rawText.length - rawText.trimStart().length;
  const shifted = stressIndex - leadingTrimmedCount;

  if (!Number.isInteger(shifted) || shifted < 0 || shifted >= trimmedText.length) {
    return null;
  }

  return shifted;
}

module.exports = { createWord, normalizeStressIndex };
