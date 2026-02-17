const wordRepository = require('../data/wordRepository');

async function getWordsForReview() {
  const allWords = await wordRepository.getAllWords();
  return allWords;
}

module.exports = {
  getWordsForReview
};
