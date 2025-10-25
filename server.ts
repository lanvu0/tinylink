import express from 'express';
import cors from 'cors';
import { createDatabase } from './database.ts';
import authRouter from './routes/authRoutes.ts';
import linkRouter from './routes/linkRoutes.ts';
import { PORT } from './config.ts';

const app = express();

// Add middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('frontend/public'));

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