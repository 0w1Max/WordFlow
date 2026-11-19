const express = require('express');
const router = express.Router();
router.param('id', require('../middleware/validateId'));

const {
  addWordController,
  getWordsController,
  getDueWordsController,
  reviewWordController,
  updateWordController,
  deleteWordController
} = require('../controllers/wordsController');

router.post('/', addWordController);
router.get('/', getWordsController);
router.get('/due', getDueWordsController);
router.post('/:id/review', reviewWordController);
router.put('/:id', updateWordController);
router.delete('/:id', deleteWordController);

module.exports = router;
