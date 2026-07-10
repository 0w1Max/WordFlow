const { createWord } = require('../models/word');
const wordRepository = require('../data/wordRepository');
const { validateWordInput } = require('../validators/wordValidator');
const appEvents = require('../events/emitter');
const { DEFAULT_USER_ID } = require('../config/constants');

async function addWord({ text, meaning, example, categoryId } = {}) {
  // Валидация — только здесь. Репозиторий больше не дублирует эти проверки.
  validateWordInput({ text, meaning });

  const word = createWord({
    text,
    meaning,
    example,
    categoryId: categoryId || null,
    userId: DEFAULT_USER_ID
  });

  const savedWord = await wordRepository.addWord(word);

  // Задел на будущее: когда появится интеграция с KeyStep (начисление XP
  // за новое слово), это можно будет сделать отдельным listener'ом,
  // не трогая этот сервис.
  appEvents.emit('word.created', savedWord);

  return savedWord;
}

module.exports = { addWord };
