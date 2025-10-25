import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET'];
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`Error: ${varName} is not defined in .env file`);
    process.exit(1);
  }
});

export const JWT_SECRET = process.env.JWT_SECRET;
export const PORT = process.env.PORT || 3000;