import { getDb } from '../database.js';
import bcrypt from 'bcryptjs';

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