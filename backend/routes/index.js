import express from 'express';
import userRoutes from './userRoutes.js';
import cartRoutes from './cartRoutes.js';
import authRoutes from './authRoutes.js';
import wishlistRoutes from './wishlistRoutes.js';

const router = express.Router();

router.use('/api/user', userRoutes);
router.use('/api/cart', cartRoutes);
router.use('/api/auth', authRoutes);
router.use('/api/wishlist', wishlistRoutes);
export default router;
    