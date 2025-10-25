import { getDb } from '../database.js';

// Function to insert short_code and longUrl into links table
export async function saveLink(shortCode: string, longUrl: string, userId: number) {
  try {
    const db = await getDb();
    // Insert shortCode, longUrl into database
    await db.run('INSERT INTO links (short_code, long_url, user_id) VALUES (?, ?, ?)', [shortCode, longUrl, userId]);
  } catch (error) {
    console.error('Error saving link to the database:', error);
  }
}

// Function to return the long_url given a shortCode
export async function getLongUrl(shortCode: string) {
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
export async function incrementClickCount(shortCode: string) {
  try {
    const db = await getDb();

    // Add 1 to the click_count
    await db.run('UPDATE links SET click_count = click_count + 1 WHERE short_code = ?', [shortCode]);
  } catch (error) {
    console.error('Error fetching the longUrl from the database:', error);
  }
}

// Function to return longUrl, clicks, createdAt data given a shortCode
export async function getShortCodeData(shortCode: string) {
  try {
    const db = await getDb();

    // Fetch data
    const row = await db.get('SELECT long_url, click_count, created_at, user_id FROM links WHERE short_code = ?', [shortCode]);

    if (!row) {
      // Return null if not found
      return null;
    }

    return {
      longUrl: row.long_url,
      clickCount: row.click_count,
      createdAt: row.created_at,
      userId: row.user_id
    };
  } catch (error) {
    console.error('Error fetching the longUrl from the database:', error);
  }
}

// Functino to check if given code does not exist in database
export async function isCodeTaken(shortCode: string): Promise<boolean> {
  try {
    const db = await getDb();
    const result = await db.get('SELECT long_url FROM links WHERE short_code = ?', [shortCode]);
    // Cast result to boolean type
    return !!result;

  } catch (error) {
    console.error('Error fetching the longUrl from the database:', error);
    throw new Error('Database error while checking code availability');
  }
}