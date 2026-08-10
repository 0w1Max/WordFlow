const { ValidationError } = require('../errors/AppError');

// Единственное место, где проверяются входные данные слова.
// Раньше одна и та же проверка жила и в services/addWord.js, и в
// data/wordRepository.js — при добавлении новых полей (категория,
// сложность и т.д.) это быстро начало бы расходиться.
function validateWordInput({ text, meaning, accentIndex }) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    throw new ValidationError('Поле "Слово" обязательно', 'text');
  }

  if (!meaning || typeof meaning !== 'string' || meaning.trim() === '') {
    throw new ValidationError('Поле "Значение" обязательно', 'meaning');
  }

  // accentIndex — необязательное поле (см. models/word.js), поэтому
  // отсутствие вообще не проверяем. Но если оно пришло — это индекс
  // конкретного символа в text (считая от исходной, ещё не обрезанной
  // строки — см. normalizeAccentIndex), а не производное значение, так
  // что здесь достаточно проверить тип и границы; сам пересчёт после
  // trim() и отбрасывание индекса, "уехавшего" за пределы слова после
  // правок, — забота normalizeAccentIndex в models/word.js.
  if (accentIndex !== undefined && accentIndex !== null) {
    if (!Number.isInteger(accentIndex) || accentIndex < 0 || accentIndex >= text.length) {
      throw new ValidationError('Некорректная позиция ударения', 'accentIndex');
    }
  }
}

module.exports = { validateWordInput };
