const words = require('../data/words');

async function getWordsForReview() {
  const allWords = await words.getAllWords();
  return allWords;
}

module.exports = {
  getWordsForReview
};
