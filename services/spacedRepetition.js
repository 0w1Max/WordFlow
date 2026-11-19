const MIN_EASE_FACTOR = 1.3;
const MAX_EASE_FACTOR = 2.5;
const DAY_MS = 24 * 60 * 60 * 1000;

function computeNextReview({ intervalDays, easeFactor }, remembered) {
  let nextInterval;
  let nextEase = easeFactor;

  if (!remembered) {
    nextInterval = 1;
    nextEase = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);
  } else if (intervalDays === 0) {
    nextInterval = 1;
  } else if (intervalDays === 1) {
    nextInterval = 6;
  } else {
    nextInterval = Math.round(intervalDays * easeFactor);
    nextEase = Math.min(MAX_EASE_FACTOR, easeFactor + 0.05);
  }

  const nextReviewAt = new Date(Date.now() + nextInterval * DAY_MS);

  return {
    intervalDays: nextInterval,
    easeFactor: nextEase,
    nextReviewAt: nextReviewAt.toISOString()
  };
}

module.exports = { computeNextReview };
