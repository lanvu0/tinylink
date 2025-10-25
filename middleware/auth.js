import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';

// Authentication middleware: Verify JWTs for protected routes
export const authMiddleware = async (req, res, next) => {
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
};