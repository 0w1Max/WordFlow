const { addWord } = require('../services/addWord');
const { getWordsForReview, markWordReviewed } = require('../services/reviewWords');

async function addWordController(req, res) {
  const { text, meaning, example, categoryId } = req.body;
  const word = await addWord({ text, meaning, example, categoryId });

  res.status(201).json(word);
}

async function getWordsController(req, res) {
  const words = await getWordsForReview();
  res.json(words);
}

async function reviewWordController(req, res) {
  const { id } = req.params;
  const word = await markWordReviewed(Number(id));

  res.json(word);
}

module.exports = {
  addWordController,
  getWordsController,
  reviewWordController
};
