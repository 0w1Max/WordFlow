const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'words.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log('Подключено к SQLite базе words.db');

  db.run('PRAGMA foreign_keys = ON');

  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL DEFAULT 1,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, err => {
    if (err) console.error('Ошибка при создании таблицы categories:', err.message);
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL DEFAULT 1,
      category_id INTEGER,
      text TEXT NOT NULL,
      meaning TEXT NOT NULL,
      example TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_review DATETIME,
      review_count INTEGER DEFAULT 0,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `, err => {
    if (err) {
      console.error('Ошибка при создании таблицы words:', err.message);
    } else {
      console.log('Таблица words готова');
    }
  });

  // Мягкие миграции — на случай, если words.db уже существует со старой схемой
  // (без user_id/category_id). SQLite не умеет "ADD COLUMN IF NOT EXISTS",
  // поэтому просто игнорируем ошибку "duplicate column name".
  const softMigrations = [
    'ALTER TABLE words ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1',
    'ALTER TABLE words ADD COLUMN category_id INTEGER'
  ];

  softMigrations.forEach(sql => {
    db.run(sql, err => {
      if (err && !/duplicate column/i.test(err.message)) {
        console.error('Ошибка миграции:', err.message);
      }
    });
  });
});

module.exports = db;
