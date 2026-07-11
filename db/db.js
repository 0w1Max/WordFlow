const { createClient } = require('@libsql/client');

// SQLite-файл на диске не пережил бы деплой на Vercel: файловая система
// serverless-функций read-only (кроме /tmp, который не сохраняется между
// вызовами), так что база бы создавалась заново на каждый холодный старт.
// Turso — облачная база, SQL-совместимая с SQLite, доступная по HTTP,
// поэтому весь остальной код (запросы, плейсхолдеры "?") остался прежним.
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

const CREATE_CATEGORIES_TABLE = `
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

const CREATE_WORDS_TABLE = `
  CREATE TABLE IF NOT EXISTS words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category_id INTEGER,
    text TEXT NOT NULL,
    meaning TEXT NOT NULL,
    example TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_review DATETIME,
    review_count INTEGER DEFAULT 0,
    next_review_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    interval_days INTEGER DEFAULT 0,
    ease_factor REAL DEFAULT 2.5,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
  )
`;

// Мягкие миграции — на случай, если база уже существует со старой схемой.
// SQLite/libSQL не умеет "ADD COLUMN IF NOT EXISTS", поэтому просто
// игнорируем ошибку "duplicate column name", если колонка уже есть.
const SOFT_MIGRATIONS = [
  'ALTER TABLE words ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1',
  'ALTER TABLE words ADD COLUMN category_id INTEGER',
  'ALTER TABLE words ADD COLUMN next_review_at DATETIME DEFAULT CURRENT_TIMESTAMP',
  'ALTER TABLE words ADD COLUMN interval_days INTEGER DEFAULT 0',
  'ALTER TABLE words ADD COLUMN ease_factor REAL DEFAULT 2.5',
  // Раньше не было пользователей, все слова "жили" под условным user_id=1.
  // Как только зарегистрируется настоящий первый пользователь, старые
  // записи можно будет вручную перепривязать по email — это осознанно
  // не автоматизируем, чтобы не привязать чужие данные не к тому аккаунту.
];

async function runMigrations() {
  await client.execute('PRAGMA foreign_keys = ON');
  await client.execute(CREATE_USERS_TABLE);
  await client.execute(CREATE_CATEGORIES_TABLE);
  await client.execute(CREATE_WORDS_TABLE);

  for (const sql of SOFT_MIGRATIONS) {
    try {
      await client.execute(sql);
    } catch (error) {
      if (!/duplicate column/i.test(error.message)) {
        throw error;
      }
    }
  }
}

// В serverless-окружении модуль может переиспользоваться между "тёплыми"
// вызовами одного и того же инстанса функции, но это не гарантировано —
// кешируем промис миграции, чтобы не гонять CREATE TABLE на каждый запрос,
// и сбрасываем кеш при ошибке, чтобы следующий запрос мог попробовать снова.
let migrationsPromise = null;

function ensureReady() {
  if (!migrationsPromise) {
    migrationsPromise = runMigrations().catch(error => {
      migrationsPromise = null;
      throw error;
    });
  }

  return migrationsPromise;
}

module.exports = { client, ensureReady };
