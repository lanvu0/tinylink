import express from 'express';
import { createDatabase, getLongUrl, getShortCodeData, incrementClickCount, saveLink } from './database.js';
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

// GET /:shortCode: Redirect shortUrl to longUrl
app.get('/:shortCode', async (req, res) => {
  // Get shortCode
  const shortCode = req.params.shortCode;

  // Look up long_url in database matching shortCode
  try {
    const longUrl = await getLongUrl(shortCode);

    // Increment click_count
    await incrementClickCount(shortCode);

    res.redirect(longUrl);
  } catch (error) {
    // Catch error raised from getLongUrl
    res.status(404).json({ error: 'Long url corresponding to short code could not be found' });
  }
});

// GET /stats/:shortCode: Allow user to see how many times their link has been clicked
app.get('/stats/:shortCode', async (req, res) => {
  const shortCode = req.params.shortCode;
  // Get data for longUrl, clicks, createdAt given shortCode
  try {
    const data = await getShortCodeData(shortCode);
    res.json(data);
  } catch (error) {
    // Catch error raised from getLongUrl
    res.status(404).json({ error: 'Could not fetch data for the short code' });
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