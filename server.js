import express from 'express';
import { createDatabase, saveLink } from './database';
import validUrl from 'valid-url';
import { nanoid } from 'nanoid';

const app = express();
const PORT = process.env.PORT || 3000;


// Add middlewares
app.use(express.json());

// Endpoints

// POST /shorten: Send a url to be shortened
app.post('/shorten', async (req, res) => {
  // Get the url from req.body
  const { longUrl } = req.body;

  // Validate the url using valid-url package
  if (!validUrl.isUri(longUrl)) {
    return res.status(400).json({ error: 'Invalid URL provided' });
  }

  // Generate short code via nanoid
  const shortCode = nanoid(7);

  try {
    // Save the code and url to the database
    await saveLink(shortCode, longUrl);
    res.status(201).json({ shortUrl: `http://localhost:${PORT}/${shortCode}` });
  } catch (error) {
    // Catch error raised from saveLink
    res.status(500).json({ error: 'Server issue: Could not save link to database' });
  }
});



// Create database inside an async IIFE
(async () => {
  await createDatabase();
})();

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});