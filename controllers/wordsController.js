const { addWord } = require('../services/addWord');
const { getWordsForReview, markWordReviewed } = require('../services/reviewWords');
const wordsService = require('../services/wordsService');

async function addWordController(req, res) {
  const { text, meaning, example, categoryId, accentIndex } = req.body;
  const word = await addWord({ text, meaning, example, categoryId, accentIndex }, req.user.id);

  res.status(201).json(word);
}

// Все слова пользователя — для страницы управления словами ("Мои слова").
async function getWordsController(req, res) {
  const words = await wordsService.getAllWords(req.user.id);
  res.json(words);
}

// Только слова, которые пора повторить — для страницы "Повторение".
async function getDueWordsController(req, res) {
  const words = await getWordsForReview(req.user.id);
  res.json(words);
}

async function reviewWordController(req, res) {
  const { id } = req.params;
  const remembered = req.body?.remembered !== false; // по умолчанию true (обратная совместимость)
  const word = await markWordReviewed(Number(id), req.user.id, remembered);

  res.json(word);
}

async function updateWordController(req, res) {
  const { id } = req.params;
  const { text, meaning, example, categoryId, accentIndex } = req.body;
  const word = await wordsService.updateWord(Number(id), req.user.id, {
    text, meaning, example, categoryId, accentIndex
  });

  res.json(word);
}

async function deleteWordController(req, res) {
  const { id } = req.params;
  await wordsService.deleteWord(Number(id), req.user.id);

  res.status(204).end();
}

module.exports = {
  addWordController,
  getWordsController,
  getDueWordsController,
  reviewWordController,
  updateWordController,
  deleteWordController
};
