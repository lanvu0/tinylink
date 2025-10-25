import express from 'express';
import { createDatabase } from './database.js';
import authRouter from './routes/authRoutes.js';
import linkRouter from './routes/linkRoutes.js';
import { PORT } from './config.js';

const app = express();

// Add middlewares
// Parse JSON request bodies
app.use(express.json());
// Serve static files from 'public' directory
app.use(express.static('public'));

// Mount routes
app.use(authRouter);
app.use(linkRouter);

// Create database inside an async IIFE
(async () => {
  await createDatabase();
})();

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});