const express = require('express');
const router = express.Router();

const {
  addCategoryController,
  getCategoriesController,
  deleteCategoryController
} = require('../controllers/categoriesController');

router.post('/', addCategoryController);
router.get('/', getCategoriesController);
router.delete('/:id', deleteCategoryController);

module.exports = router;
