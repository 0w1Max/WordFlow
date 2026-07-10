const { addCategory, getCategories } = require('../services/categoryService');

async function addCategoryController(req, res) {
  const { name } = req.body;
  const category = await addCategory(name);

  res.status(201).json(category);
}

async function getCategoriesController(req, res) {
  const categories = await getCategories();
  res.json(categories);
}

module.exports = { addCategoryController, getCategoriesController };
