function createWord({
  text,
  meaning,
  example = null,
  userId,
  categoryId = null,
  accentIndex = null
}) {
  return {
    text: text.trim(),
    meaning: meaning.trim(),
    example: example ? example.trim() : null,
    userId,
    categoryId,
    accentIndex: normalizeAccentIndex(accentIndex, text),
    lastReview: null,
    reviewCount: 0
  };
}
function normalizeAccentIndex(accentIndex, rawText) {
  // The picker sends a UTF-16 offset into the untrimmed input.
  if (accentIndex === null || accentIndex === undefined) return null;

  const trimmedText = rawText.trim();
  const leadingTrimmedCount = rawText.length - rawText.trimStart().length;
  const shifted = accentIndex - leadingTrimmedCount;

  if (!Number.isInteger(shifted) || shifted < 0 || shifted >= trimmedText.length) {
    return null;
  }

  return shifted;
}

module.exports = { createWord, normalizeAccentIndex };
