const appEvents = require('./emitter');

// Заглушки-обработчики. Когда появится реальная интеграция с экосистемой
// KeyStep, здесь будут вызовы вроде keyStepClient.addXp(userId, ...) —
// без изменения кода в services/addWord.js и services/reviewWords.js.
appEvents.on('word.created', (word) => {
  console.log(`[event] word.created: "${word.text}" (id=${word.id})`);
});

appEvents.on('word.reviewed', (word) => {
  console.log(`[event] word.reviewed: "${word.text}" (повторений: ${word.reviewCount})`);
});

module.exports = appEvents;
