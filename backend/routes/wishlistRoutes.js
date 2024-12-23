import express from 'express';
import { addToWishlist, getWishlist, removeFromWishlist } from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();


router.route('/remove').delete(protect, removeFromWishlist);
router.route('/').post(protect, addToWishlist).get(protect, getWishlist);

export default router;