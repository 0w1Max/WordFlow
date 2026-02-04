const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'words.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log('Подключено к SQLite базе words.db');

  db.run(`
    CREATE TABLE IF NOT EXISTS words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      meaning TEXT NOT NULL,
      example TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_review DATETIME,
      review_count INTEGER DEFAULT 0
    )
  `, err => {
    if (err) {
      console.error('Ошибка при создании таблицы:', err.message);
    } else {
      console.log('Таблица words готова');
    }
  });
});

module.exports = db;
