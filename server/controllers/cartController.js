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
      const productDetails = await Product.findOne({ id: productId });
      user.cart.push({
        productId: productDetails.id,
        quantity: quantity,
        productName: productDetails.title,
        productImage: productDetails.image,
        productPrice: productDetails.price
      });
    }

    await user.save();
    console.log(`Product with ID: ${productId} added to cart for user ID: ${req.user.id}`);
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
  const { productId } = req.params;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const itemIndex = user.cart.findIndex(item => item.productId === parseInt(productId));
    if (itemIndex > -1) {
      user.cart.splice(itemIndex, 1); // Remove the item from the cart
      await user.save();
      console.log(`Product with ID: ${productId} removed from cart for user ID: ${req.user.id}`);
      res.status(200).json({ message: 'Item removed from cart' });
    } else {
      res.status(404).json({ error: 'Item not found in cart' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
};

// Update cart quantity
export const updateCartQuantity = async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const item = user.cart.find(item => item.productId === parseInt(productId));
    if (item) {
      item.quantity = quantity;
      await user.save();
      console.log(`Quantity for product ID: ${productId} updated to ${quantity} for user ID: ${req.user.id}`);
      res.status(200).json({ message: 'Cart quantity updated' });
    } else {
      res.status(404).json({ error: 'Item not found in cart' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cart quantity' });
  }
};