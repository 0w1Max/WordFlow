const { createWord } = require('../models/word');
const words = require('../data/words');

async function addWord(text, meaning, example) {
  if (!text || !meaning) {
    throw new Error('Слово и значение обязательны');
  }

  const word = createWord(text, meaning, example);
  const savedWord = await words.addWord(word);

  return savedWord;
}

module.exports = {
  addWord
};
