const { runMigrations } = require('./migrations');
const { createClient } = require('@libsql/client');
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

let migrationsPromise = null;

function ensureReady() {
  if (!migrationsPromise) {
    migrationsPromise = runMigrations(client).catch((error) => {
      migrationsPromise = null;
      throw error;
    });
  }

  return migrationsPromise;
}

module.exports = { client, ensureReady };
