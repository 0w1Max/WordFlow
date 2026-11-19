const { ValidationError } = require('../errors/AppError');
function validateWordInput({ text, meaning, example, categoryId, accentIndex }) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    throw new ValidationError('Поле "Слово" обязательно', 'text');
  }

  if (!meaning || typeof meaning !== 'string' || meaning.trim() === '') {
    throw new ValidationError('Поле "Значение" обязательно', 'meaning');
  }
  if (text.length > 500 || meaning.length > 10000)
    throw new ValidationError('Слово или значение слишком длинное');
  if (example != null && (typeof example !== 'string' || example.length > 10000))
    throw new ValidationError('Некорректный пример', 'example');
  if (categoryId != null && (!Number.isSafeInteger(categoryId) || categoryId <= 0))
    throw new ValidationError('Некорректная категория', 'categoryId');

  if (accentIndex !== undefined && accentIndex !== null) {
    if (!Number.isInteger(accentIndex) || accentIndex < 0 || accentIndex >= text.length) {
      throw new ValidationError('Некорректная позиция ударения', 'accentIndex');
    }
  }
}

module.exports = { validateWordInput };
