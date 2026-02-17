const { createWord } = require('../models/word');
const wordRepository = require('../data/wordRepository');

async function addWord(text, meaning, example) {
  if (!text || !meaning) {
    throw new Error('Слово и значение обязательны');
  }

  const word = createWord(text, meaning, example);
  const savedWord = await wordRepository.addWord(word);

  return savedWord;
}

module.exports = {
  addWord
};
