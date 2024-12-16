import express from 'express';
import userRoutes from './userRoutes.js';
import cartRoutes from './cartRoutes.js';
import authRoutes from './authRoutes.js';

const router = express.Router();

router.use('/api/user', userRoutes);
router.use('/api/cart', cartRoutes);
router.use('/api/auth', authRoutes);

export default router;
