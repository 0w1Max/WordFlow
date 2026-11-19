const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createClient } = require('@libsql/client');
const { runMigrations } = require('../db/migrations');

test('migrations preserve legacy data, are repeatable and enforce category ownership', async () => {
  const client = createClient({ url: 'file::memory:' });
  try {
    await client.execute(`CREATE TABLE words (
      id INTEGER PRIMARY KEY, text TEXT NOT NULL, meaning TEXT NOT NULL,
      example TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_review DATETIME, review_count INTEGER DEFAULT 0
    )`);
    await client.execute("INSERT INTO words (id, text, meaning) VALUES (1, 'legacy', 'kept')");
    await runMigrations(client);
    await runMigrations(client);
    const { rows } = await client.execute('SELECT * FROM words WHERE id = 1');
    assert.equal(rows[0].text, 'legacy');
    assert.equal(rows[0].user_id, 0);
    assert.ok(rows[0].next_review_at);
    await client.execute("INSERT INTO categories (id, user_id, name) VALUES (1, 2, 'Private')");
    await assert.rejects(
      client.execute('UPDATE words SET category_id = 1 WHERE id = 1'),
      /ownership/
    );
    await assert.rejects(
      client.execute(
        "INSERT INTO words (text, meaning, user_id, category_id) VALUES ('x', 'y', 3, 1)"
      ),
      /ownership/
    );
  } finally {
    client.close();
  }
});
