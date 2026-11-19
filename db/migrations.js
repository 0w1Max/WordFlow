const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_guest INTEGER NOT NULL DEFAULT 0,
    reset_token_hash TEXT,
    reset_token_expires_at DATETIME,
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
    accent_index INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_review DATETIME,
    review_count INTEGER DEFAULT 0,
    next_review_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    interval_days INTEGER DEFAULT 0,
    ease_factor REAL DEFAULT 2.5,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
  )
`;
const SOFT_MIGRATIONS = [
  'ALTER TABLE words ADD COLUMN user_id INTEGER NOT NULL DEFAULT 0',
  'ALTER TABLE words ADD COLUMN category_id INTEGER',
  'ALTER TABLE words ADD COLUMN next_review_at DATETIME',
  'ALTER TABLE words ADD COLUMN interval_days INTEGER DEFAULT 0',
  'ALTER TABLE words ADD COLUMN ease_factor REAL DEFAULT 2.5',
  'ALTER TABLE users ADD COLUMN reset_token_hash TEXT',
  'ALTER TABLE users ADD COLUMN reset_token_expires_at DATETIME',
  'ALTER TABLE users ADD COLUMN token_version INTEGER NOT NULL DEFAULT 0',
  'ALTER TABLE users ADD COLUMN is_guest INTEGER NOT NULL DEFAULT 0',
  'ALTER TABLE words ADD COLUMN accent_index INTEGER'
];
const BACKFILLS = [
  'UPDATE words SET next_review_at = CURRENT_TIMESTAMP WHERE next_review_at IS NULL'
];

async function runMigrations(client) {
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

  await client.execute(
    'CREATE INDEX IF NOT EXISTS words_user_due ON words(user_id, datetime(next_review_at))'
  );
  await client.execute('CREATE INDEX IF NOT EXISTS categories_user ON categories(user_id)');
  await client.execute('CREATE INDEX IF NOT EXISTS users_reset ON users(reset_token_hash)');

  for (const sql of BACKFILLS) {
    await client.execute(sql);
  }

  // Validate ownership at write time as well as in services, including concurrent requests.
  for (const operation of ['INSERT', 'UPDATE OF category_id, user_id']) {
    const name = operation === 'INSERT' ? 'insert' : 'update';
    await client.execute(`CREATE TRIGGER IF NOT EXISTS words_category_owner_${name}
      BEFORE ${operation} ON words
      WHEN NEW.category_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM categories WHERE id = NEW.category_id AND user_id = NEW.user_id
      ) BEGIN SELECT RAISE(ABORT, 'category ownership violation'); END`);
  }
}

module.exports = { runMigrations };
