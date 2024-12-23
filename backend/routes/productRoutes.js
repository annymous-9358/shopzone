import express from 'express';
import asyncHandler from 'express-async-handler';
import { 
  getAllProducts, 
  getProductById, 
  getProductsByCategory 
} from '../controllers/productController.js';

const router = express.Router();

// Get all products
router.get('/products', asyncHandler(getAllProducts));

// Get single product
router.get('/products/:id', asyncHandler(getProductById));

// Route to fetch products by category
router.get('/products/category/:category', asyncHandler(getProductsByCategory));

export default router;