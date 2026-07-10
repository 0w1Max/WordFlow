const { EventEmitter } = require('events');

// Единый инстанс событийной шины на всё приложение.
// Идея: сервисы не должны знать, кто и зачем реагирует на "слово добавлено"
// или "слово повторено" — они просто эмитят событие. Когда появится
// интеграция с KeyStep (начисление XP, обновление общего прогресса),
// достаточно будет добавить ещё один listener, не трогая services/*.
class AppEventEmitter extends EventEmitter {}

const appEvents = new AppEventEmitter();

module.exports = appEvents;
