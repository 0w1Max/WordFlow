const express = require('express');
const router = express.Router();

const {
  addCategoryController,
  getCategoriesController
} = require('../controllers/categoriesController');

router.post('/', addCategoryController);
router.get('/', getCategoriesController);

module.exports = router;
