const { addWord } = require('../services/addWord');
const { getWordsForReview } = require('../services/reviewWords');

async function addWordController(req, res) {
  const { text, meaning, example } = req.body;
  const word = await addWord(text, meaning, example);

  res.json(word);
}

async function getWordsController(req, res) {
  const words = await getWordsForReview();

  res.json(words);
}

module.exports = {
  addWordController,
  getWordsController
};
