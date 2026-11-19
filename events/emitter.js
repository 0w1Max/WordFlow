const { EventEmitter } = require('events');
class AppEventEmitter extends EventEmitter {}

const appEvents = new AppEventEmitter();

module.exports = appEvents;
