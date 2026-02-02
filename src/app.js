const { addWord } = require('./services/addWord');
const { getWordsForReview } = require('./services/reviewWords');

async function main() {
  await addWord('focus', 'концентрация');
  await addWord('growth', 'рост');

  const words = await getWordsForReview();
  console.log(words);
}

main();
