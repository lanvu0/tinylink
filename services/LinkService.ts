import { getDb } from '../database.js';

// Function to insert short_code and longUrl into links table
export async function saveLink(shortCode: string, longUrl: string, userId: number) {
  const db = await getDb();
  await db.run('INSERT INTO links (short_code, long_url, user_id) VALUES (?, ?, ?)', [shortCode, longUrl, userId]);
}

// Function to return the long_url given a shortCode
export async function getLongUrl(shortCode: string) {
  const db = await getDb();

  // Get longUrl given the short_code
  const row = await db.get('SELECT long_url FROM links WHERE short_code = ?', [shortCode]);
  return row ? row.long_url : null;
}

// Function to increment the click_count corresponding to the shortCode
export async function incrementClickCount(shortCode: string) {
  const db = await getDb();
  // Add 1 to the click_count
  await db.run('UPDATE links SET click_count = click_count + 1 WHERE short_code = ?', [shortCode]);
}

// Function to return longUrl, clicks, createdAt data given a shortCode
export async function getShortCodeData(shortCode: string) {
  const db = await getDb();

  // Fetch data
  const row = await db.get('SELECT long_url, click_count, created_at, user_id FROM links WHERE short_code = ?', [shortCode]);

  return row ? {
    longUrl: row.long_url,
    clickCount: row.click_count,
    createdAt: row.created_at,
    userId: row.user_id
  } : null;
}

// Functino to check if given code does not exist in database
export async function isCodeTaken(shortCode: string): Promise<boolean> {
  const db = await getDb();
  const result = await db.get('SELECT long_url FROM links WHERE short_code = ?', [shortCode]);
  // Cast result to boolean type
  return !!result;
}

// Function to return all links given the userId
export async function getLinksByUserId(userId: number) {
  const db = await getDb();
  // Fetch all relevant columns for the links owned by the user, ordered by most recent first
  const links = await db.all(
    `SELECT short_code, long_url, click_count, created_at 
     FROM links 
     WHERE user_id = ? 
     ORDER BY created_at DESC`,
    [userId]
  );
  return links;
}