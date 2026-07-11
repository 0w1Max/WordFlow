const categoryRepository = require('../data/categoryRepository');
const { ValidationError } = require('../errors/AppError');

async function addCategory(name, userId) {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new ValidationError('Поле "Название категории" обязательно');
  }

  return categoryRepository.addCategory({ name: name.trim(), userId });
}

async function getCategories(userId) {
  return categoryRepository.getAllCategories(userId);
}

module.exports = { addCategory, getCategories };
