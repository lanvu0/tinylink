import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function getDb() {
  return await open({
    filename: './database.db',
    driver: sqlite3.Database
  });
}

// Function to create and initialise the database
export async function createDatabase() {
  try {
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
  } catch (error) {
    console.error('Error creating database:', error);
  }
}


// Function to insert short_code and longUrl into links table
export async function saveLink(shortCode, longUrl) {
  try {
    const db = await getDb();
    // Insert shortCode, longUrl into database
    await db.run('INSERT INTO links (short_code, long_url) VALUES (?, ?)', [shortCode, longUrl]);
  } catch (error) {
    console.error('Error creating database:', error);
  }
}