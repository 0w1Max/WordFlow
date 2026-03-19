function createWord(text, meaning, example = null) {
  return {
    text,
    meaning,
    example,
    createdAt: new Date().toISOString(),
    lastReview: null,
    reviewCount: 0
  };
}

module.exports = {
  createWord
};
