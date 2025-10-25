import express from 'express';
import { createDatabase, findUserByUsername, getLongUrl, getShortCodeData, incrementClickCount, saveLink, saveUser, isCodeTaken } from './database.js';
import validUrl from 'valid-url';
import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
const PORT = process.env.PORT || 3000;

// Add middlewares
// Parse JSON request bodies
app.use(express.json());

// Serve static files from 'public' directory
app.use(express.static('public'));

// Verify JWTs for protected routes
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  console.log('Received token:', token);

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    // Attach user data (userId, username) to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Endpoints

// POST /register:
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    // Check if username already exists
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Save user with hashed password
    const user = await saveUser(username, password);

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, username: user.name },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    res.status(201).json({ token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// POST /login:
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    // Find user
    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// POST /shorten: Send a url to be shortened
app.post('/shorten', authMiddleware, async (req, res) => {
  // Get the url from req.body
  const { longUrl, customCode } = req.body;

  const userId = req.user.userId; // From JWT

  // Validate the url using valid-url package
  if (!validUrl.isUri(longUrl)) {
    return res.status(400).json({ error: 'Invalid URL provided' });
  }

  try {
    let shortCode;
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
      // Generate short code via nanoid
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
app.get('/:shortCode', async (req, res) => {
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
app.get('/stats/:shortCode', async (req, res) => {
  const shortCode = req.params.shortCode;
  const userId = req.user.userId; // From JWT

  // Get data for longUrl, clicks, createdAt given shortCode
  try {
    const data = await getShortCodeData(shortCode);
    if (data.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorised: You do not own this link' });
    }
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
  console.log(`Server running at http://localhost:${PORT}`);
});