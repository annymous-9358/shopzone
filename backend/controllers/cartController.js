import User from '../models/User.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

// Add item to cart
export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if product is already in cart
    const cartItemIndex = user.cart.findIndex(item => item.productId === product.id);
    if (cartItemIndex > -1) {
      // Update quantity if product is already in cart
      user.cart[cartItemIndex].quantity += quantity;
    } else {
      // Save additional product details in the cart
      user.cart.push({
        productId: product.id,
        quantity,
        productName: product.title,
        productImage: product.image,
        productPrice: product.price
      });
    }

    await user.save();
    res.json({ message: 'Product added to cart successfully', cart: user.cart });
  } catch (error) {
    res.status(500).json({ error: 'Error updating cart' });
  }
};

// Get cart items
export const getCart = async (req, res) => {
  try {
    const allProducts = await Product.find();

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const populatedCart = await Promise.all(user.cart.map(async (item) => {
      const productDetails = await Product.findOne({ id: item.productId });
      return { ...item.toObject(), productDetails };
    }));

    res.status(200).json({ items: populatedCart });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  const { productId } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log(`Failed to remove product: User ${req.user.id} not found`);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`User's cart before removal:`, user.cart);
    console.log(`Product ID to remove: ${productId}`);

    const itemIndex = user.cart.findIndex(item => item.productId === parseInt(productId));
    if (itemIndex > -1) {
      user.cart.splice(itemIndex, 1); // Remove the item from the cart
      await user.save();
      console.log(`Removed product ${productId} from user ${req.user.id}'s cart`);
      res.status(200).json({ message: 'Item removed from cart' });
    } else {
      console.log(`Product ${productId} not found in user ${req.user.id}'s cart`);
      res.status(404).json({ error: 'Item not found in cart' });
    }
  } catch (error) {
    console.log(`Error removing product from cart: ${error.message}`);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
};

// Update cart quantity
export const updateCartQuantity = async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log(`Failed to update quantity: User ${req.user.id} not found`);
      return res.status(404).json({ error: 'User not found' });
    }

    const item = user.cart.find(item => item.productId === parseInt(productId));
    if (item) {
      item.quantity = quantity;
      await user.save();
      console.log(`Updated quantity for product ${productId} to ${quantity} in user ${req.user.id}'s cart`);
      res.status(200).json({ message: 'Cart quantity updated' });
    } else {
      console.log(`Product ${productId} not found in user ${req.user.id}'s cart`);
      res.status(404).json({ error: 'Item not found in cart' });
    }
  } catch (error) {
    console.log(`Error updating cart quantity: ${error.message}`);
    res.status(500).json({ error: 'Failed to update cart quantity' });
  }
};
// Drop all items from cart
export const dropCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Clear the cart
    user.cart = [];
    await user.save();

    res.json({ message: 'Cart cleared successfully', cart: user.cart });
  } catch (error) {
    res.status(500).json({ error: 'Error clearing cart' });
  }
};