const { ValidationError } = require('../errors/AppError');

// Единственное место, где проверяются входные данные слова.
// Раньше одна и та же проверка жила и в services/addWord.js, и в
// data/wordRepository.js — при добавлении новых полей (категория,
// сложность и т.д.) это быстро начало бы расходиться.
function validateWordInput({ text, meaning, stressIndex }) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    throw new ValidationError('Поле "Слово" обязательно', 'text');
  }

  if (!meaning || typeof meaning !== 'string' || meaning.trim() === '') {
    throw new ValidationError('Поле "Значение" обязательно', 'meaning');
  }

  // stressIndex — необязательное поле (см. models/word.js), поэтому
  // отсутствие вообще не проверяем. Но если оно пришло — это индекс
  // конкретного символа в text (считая от исходной, ещё не обрезанной
  // строки — см. normalizeStressIndex), а не производное значение, так
  // что здесь достаточно проверить тип и границы; сам пересчёт после
  // trim() и отбрасывание индекса, "уехавшего" за пределы слова после
  // правок, — забота normalizeStressIndex в models/word.js.
  if (stressIndex !== undefined && stressIndex !== null) {
    if (!Number.isInteger(stressIndex) || stressIndex < 0 || stressIndex >= text.length) {
      throw new ValidationError('Некорректная позиция ударения', 'stressIndex');
    }
  }
}

module.exports = { validateWordInput };
