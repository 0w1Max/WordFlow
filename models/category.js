function createCategory({ name, userId }) {
  return {
    name: name.trim(),
    userId
  };
}

module.exports = { createCategory };
