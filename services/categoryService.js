const categoryRepository = require('../data/categoryRepository');
const { createCategory: buildCategory } = require('../models/category');
const { ValidationError, NotFoundError } = require('../errors/AppError');

async function addCategory(name, userId) {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new ValidationError('Поле "Название категории" обязательно', 'name');
  }

  return categoryRepository.addCategory(buildCategory({ name, userId }));
}

async function getCategories(userId) {
  return categoryRepository.getAllCategories(userId);
}

async function deleteCategory(id, userId) {
  const deleted = await categoryRepository.deleteCategory(id, userId);

  if (!deleted) {
    throw new NotFoundError(`Категория с id=${id} не найдена`);
  }
}

module.exports = { addCategory, getCategories, deleteCategory };
