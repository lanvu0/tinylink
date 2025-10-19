import express from 'express';
import { createDatabase } from './database';

const app = express();
const PORT = process.env.PORT || 3000;


// Add middlewares
app.use(express.json());


// Create database inside an async IIFE
(async () => {
  await createDatabase();
})();

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});