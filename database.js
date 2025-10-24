import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';

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
    
    // Enable foreign key support
    await db.run('PRAGMA foreign_keys = ON;');

    // Create users table first because links has foreign key to users
    await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await db.run(`
      CREATE TABLE IF NOT EXISTS links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        short_code TEXT UNIQUE NOT NULL,
        long_url TEXT NOT NULL,
        click_count INTEGER DEFAULT 0 NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
  } catch (error) {
    console.error('Error creating database:', error);
  }
}


// Function to insert short_code and longUrl into links table
export async function saveLink(shortCode, longUrl, userId) {
  try {
    const db = await getDb();
    // Insert shortCode, longUrl into database
    await db.run('INSERT INTO links (short_code, long_url, user_id) VALUES (?, ?, ?)', [shortCode, longUrl, userId]);
  } catch (error) {
    console.error('Error saving link to the database:', error);
  }
}

// Function to insert a new user into users table
export async function saveUser(username, password) {
  try {
    const db = await getDb();

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user data
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);

    // Return user object
    return db.get('SELECT id, username FROM users WHERE username = ?', [username]);
  } catch (error) {
    console.error('Error saving user to the database:', error);
  }
}

// Function to return the user by username
export async function findUserByUsername(username) {
  const db = await getDb();
  return db.get('SELECT * FROM users WHERE username = ?', [username]);
}

// Function to return the long_url given a shortCode
export async function getLongUrl(shortCode) {
  try {
    const db = await getDb();

    // Get longUrl given the short_code
    const row = await db.get('SELECT long_url FROM links WHERE short_code = ?', [shortCode]);
    if (row) {
      return row.long_url;
    }
    return null;
  } catch (error) {
    console.error('Error fetching the longUrl from the database:', error);
  }
}

// Function to increment the click_count corresponding to the shortCode
export async function incrementClickCount(shortCode) {
  try {
    const db = await getDb();

    // Add 1 to the click_count
    await db.run('UPDATE links SET click_count = click_count + 1 WHERE short_code = ?', [shortCode]);
  } catch (error) {
    console.error('Error fetching the longUrl from the database:', error);
  }
}

// Functino to return longUrl, clicks, createdAt data given a shortCode
export async function getShortCodeData(shortCode) {
  try {
    const db = await getDb();

    // Fetch data'
    const {
      long_url: longUrl,
      click_count: clickCount,
      created_at: createdAt,
      user_id: userId
    } = await db.get('SELECT long_url, click_count, created_at, user_id FROM links WHERE short_code = ?', [shortCode]);

    // Data has long_url, click_count, created_at
    return {longUrl, clickCount, createdAt, userId};
  } catch (error) {
    console.error('Error fetching the longUrl from the database:', error);
  }
}