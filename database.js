import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function getDb() {

  const db = await open({
    filename: './database.db',
    driver: sqlite3.Database
  });
}

// Function to create and initialise the database
export async function createDatabase() {
  const db = await getDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        short_code TEXT UNIQUE NOT NULL,
        long_url TEXT NOT NULL,
        click_count INTEGER DEFAULT 0 NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}


// Function to insert short_code and longUrl into links table
export async function saveLink(shortCode, longUrl) {
  const db = await getDb();

  const stmt = await db.prepare('INSERT INTO links (short_code, long_url) VALUES (?, ?)');
  await stmt.run(shortCode, longUrl);
  await stmt.finalize();
}