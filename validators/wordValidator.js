const { ValidationError } = require('../errors/AppError');

// Единственное место, где проверяются входные данные слова.
// Раньше одна и та же проверка жила и в services/addWord.js, и в
// data/wordRepository.js — при добавлении новых полей (категория,
// сложность и т.д.) это быстро начало бы расходиться.
function validateWordInput({ text, meaning }) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    throw new ValidationError('Поле "Слово" обязательно');
  }

  if (!meaning || typeof meaning !== 'string' || meaning.trim() === '') {
    throw new ValidationError('Поле "Значение" обязательно');
  }
}

module.exports = { validateWordInput };
