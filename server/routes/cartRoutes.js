import express from 'express';
import { addToCart, getCart, removeFromCart, updateCartQuantity } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/remove').delete(protect, removeFromCart);
router.route('/').post(protect, addToCart).get(protect, getCart);
router.route('/update').post(protect, updateCartQuantity);

export default router;
