import express from 'express';
import validUrl from 'valid-url';
import { nanoid } from 'nanoid';
import { saveLink, getLongUrl, incrementClickCount, getShortCodeData, isCodeTaken } from '../services/LinkService.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const PORT = process.env.PORT || 3000;


// POST /shorten: Send a url to be shortened
router.post('/shorten', authMiddleware, async (req, res) => {
  // Get the url from req.body
  const { longUrl, customCode } = req.body;
  
  // Verified via authMiddleware
  const userId = parseInt(req.user!.userId); // From JWT

  // Validate the url using valid-url package
  if (!validUrl.isUri(longUrl)) {
    return res.status(400).json({ error: 'Invalid URL provided' });
  }

  try {
    // Generate short code via nanoid
    let shortCode = nanoid(7);

    // Check if customCode was provided
    if (customCode) {
      // Validation: alphanumeric and max length
      const codeRegex = /^[a-zA-Z0-9_-]{1,20}$/;
      if (!codeRegex.test(customCode)) {
        return res.status(400).json({ error: 'Custom code must be alphanumeric and up to 20 characters' });
      }

      // Validation: type must be string
      if (typeof customCode !== 'string') {
        return res.status(400).json({ error: 'Custom code must be a string' });
      }

      // Validation: code is not taken
      if (await isCodeTaken(customCode)) {
        // Throw error: customCode is taken
        return res.status(400).json({ error: 'Custom code is already taken' });
      }

      // Passes all validation, save new customCode
      shortCode = customCode;
    } else {
      // Generate again if nanoid is still taken
      while (await isCodeTaken(shortCode)) {
        // Generate codes until unique
        shortCode = nanoid(7); 
      }
    }

    // Save the code and url to the database
    await saveLink(shortCode, longUrl, userId);
    res.status(201).json({
      shortUrl: `http://localhost:${PORT}/${shortCode}`,
      shortCode,
      longUrl
    });
  } catch (error) {
    // Catch error raised from saveLink
    res.status(500).json({ error: 'Server issue: Could not save link to database' });
  }
});

// GET /:shortCode: Redirect shortUrl to longUrl
router.get('/:shortCode', authMiddleware, async (req, res) => {
  // Get shortCode
  const shortCode = req.params.shortCode;

  // Look up long_url in database matching shortCode
  try {
    const longUrl = await getLongUrl(shortCode);
    if (longUrl) {
      // Increment click_count
      await incrementClickCount(shortCode);

      res.redirect(longUrl);
    } else {
      // If longUrl is null, it means not found
      return res.status(404).json({ error: 'Short link not found' });
    }
  } catch (error) {
    // Database or server errors
    console.error('Error in redirect route:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /stats/:shortCode: Allow user to see how many times their link has been clicked
router.get('/stats/:shortCode', async (req, res) => {
  const shortCode = req.params.shortCode;
  const userId = parseInt(req.user!.userId); // From JWT

  // Get data for longUrl, clicks, createdAt given shortCode
  try {
    const data = await getShortCodeData(shortCode);
    if (!data || data.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorised: You do not own this link' });
    }
    res.json(data);
  } catch (error) {
    // Catch error raised from getLongUrl
    res.status(404).json({ error: 'Could not fetch data for the short code' });
  }
});

export default router;