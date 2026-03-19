const express = require('express');
const router = express.Router();

const {
  addWordController,
  getWordsController
} = require('../controllers/wordsController');

router.post('/', addWordController);
router.get('/', getWordsController);

module.exports = router;
