const categoryRepository = require('../data/categoryRepository');
const { ValidationError } = require('../errors/AppError');
const { DEFAULT_USER_ID } = require('../config/constants');

async function addCategory(name) {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new ValidationError('Поле "Название категории" обязательно');
  }

  return categoryRepository.addCategory({ name: name.trim(), userId: DEFAULT_USER_ID });
}

async function getCategories() {
  return categoryRepository.getAllCategories(DEFAULT_USER_ID);
}

module.exports = { addCategory, getCategories };
