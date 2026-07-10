const express = require('express');
const router = express.Router();

const {
  addWordController,
  getWordsController,
  reviewWordController
} = require('../controllers/wordsController');

router.post('/', addWordController);
router.get('/', getWordsController);
router.post('/:id/review', reviewWordController);

module.exports = router;
