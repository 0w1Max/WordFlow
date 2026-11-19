const { requireOwnedCategory } = require('./categoryService');
const { createWord } = require('../models/word');
const wordRepository = require('../data/wordRepository');
const { validateWordInput } = require('../validators/wordValidator');
const appEvents = require('../events/emitter');

async function addWord({ text, meaning, example, categoryId, accentIndex } = {}, userId) {
  validateWordInput({ text, meaning, example, categoryId, accentIndex });
  await requireOwnedCategory(categoryId, userId);

  const word = createWord({
    text,
    meaning,
    example,
    categoryId: categoryId || null,
    accentIndex,
    userId
  });

  const savedWord = await wordRepository.addWord(word);
  appEvents.emit('word.created', savedWord);

  return savedWord;
}

module.exports = { addWord };
