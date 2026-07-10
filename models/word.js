// Модель отвечает только за форму объекта слова. Проверка данных
// (обязательные поля и т.п.) — в validators/wordValidator.js, вызывающая
// сторона (services/addWord.js) обязана вызвать валидацию до createWord.
function createWord({ text, meaning, example = null, userId, categoryId = null }) {
  return {
    text: text.trim(),
    meaning: meaning.trim(),
    example: example ? example.trim() : null,
    userId,
    categoryId,
    lastReview: null,
    reviewCount: 0
  };
}

module.exports = { createWord };
