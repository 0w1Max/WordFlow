const { addCategory, getCategories } = require('../services/categoryService');

async function addCategoryController(req, res) {
  const { name } = req.body;
  const category = await addCategory(name, req.user.id);

  res.status(201).json(category);
}

async function getCategoriesController(req, res) {
  const categories = await getCategories(req.user.id);
  res.json(categories);
}

module.exports = { addCategoryController, getCategoriesController };
