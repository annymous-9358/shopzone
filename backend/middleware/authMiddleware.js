import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token received:', token);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        console.log('User not found for ID:', decoded.id);
        return res.status(404).json({ error: 'User not found' });
      }
      console.log('User authenticated:', req.user);
      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  } else {
    console.log('Authorization header missing or malformed');
    res.status(401).json({ error: 'Not authorized, no token' });
  }
});

export { protect };