const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'expenses.db'));

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id          TEXT    PRIMARY KEY,
    amount      INTEGER NOT NULL,        -- stored in paise to avoid float issues
    category    TEXT    NOT NULL,
    description TEXT    NOT NULL,
    date        TEXT    NOT NULL,        -- YYYY-MM-DD
    created_at  TEXT    NOT NULL
  );

  CREATE TABLE IF NOT EXISTS idempotency_cache (
    key          TEXT    PRIMARY KEY,
    status_code  INTEGER NOT NULL,
    response     TEXT    NOT NULL,       -- JSON string
    created_at   TEXT    NOT NULL
  );
`);

module.exports = db;