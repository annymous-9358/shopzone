import User from '../models/User.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

// Add item to Wishlist
export const addToWishlist = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  console.log(`Request to add product ${productId} to wishlist for user ${req.user.id}`);
  try {
    console.log(`Finding user with id: ${req.user.id}`);
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log(`User with id ${req.user.id} not found`);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`Querying product with id: ${productId}`);
    const product = await Product.findOne({ id: productId });
    console.log(`Product query result: ${product}`);
    if (!product) {
      console.log(`Product with id ${productId} not found`);
      return res.status(404).json({ error: 'Product not found' });
    }

    console.log('Checking if product is already in wishlist');
    const wishlistItemIndex = user.wishlist.findIndex(item => item.productId === product.id);
    if (wishlistItemIndex > -1) {
      console.log(`Product ${productId} is already in wishlist, updating quantity`);
      user.wishlist[wishlistItemIndex].quantity += quantity;
    } else {
      console.log(`Product ${productId} is not in wishlist, adding new item`);
      user.wishlist.push({
        productId: product.id,
        quantity,
        productName: product.title,
        productImage: product.image,
        productPrice: product.price
      });
      console.log(`Added new product ${productId} to wishlist`);
    }

    console.log('Saving updated user data');
    await user.save();
    console.log(`Product ${productId} added to wishlist successfully for user ${req.user.id}`);
    res.json({ message: 'Product added to wishlist successfully', wishlist: user.wishlist });
  } catch (error) {
    console.error(`Error updating wishlist for user ${req.user.id}: ${error}`);
    res.status(500).json({ error: 'Error updating wishlist' });
  }
};

// Get wishlist items
export const getWishlist = async (req, res) => {
  try {
    console.log(`Fetching wishlist for user ${req.user.id}`);
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log(`User with id ${req.user.id} not found`);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Populating wishlist with product details');
    const populatedWishlist = await Promise.all(user.wishlist.map(async (item) => {
      const productDetails = await Product.findOne({ id: item.productId });
      if (!productDetails) {
        console.log(`Product with id ${item.productId} not found`);
        return { ...item.toObject(), productDetails: { productName: 'Unknown', productImage: 'placeholder.jpg', productPrice: 'N/A' } };
      }
      return { ...item.toObject(), productDetails };
    }));

    console.log(`Wishlist fetched successfully for user ${req.user.id}`);
    res.status(200).json({ items: populatedWishlist });
  } catch (error) {
    console.error(`Failed to fetch wishlist for user ${req.user.id}: ${error}`);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
};

// Remove item from wishlist
export const removeFromWishlist = async (req, res) => {
  const { productId } = req.body;
  console.log(`Request to remove product ${productId} from wishlist for user ${req.user.id}`);
  try {
    console.log(`Finding user with id: ${req.user.id}`);
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log(`User with id ${req.user.id} not found`);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Checking if product is in wishlist');
    const itemIndex = user.wishlist.findIndex(item => item.productId === productId);
    if (itemIndex > -1) {
      console.log(`Product ${productId} found in wishlist, removing item`);
      user.wishlist.splice(itemIndex, 1); // Remove the item from the wishlist
      await user.save();
      console.log(`Product ${productId} removed from wishlist successfully for user ${req.user.id}`);
      res.status(200).json({ message: 'Item removed from wishlist' });
    } else {
      console.log(`Product ${productId} not found in wishlist for user ${req.user.id}`);
      res.status(404).json({ error: 'Item not found in wishlist' });
    }
  } catch (error) {
    console.error(`Failed to remove item from wishlist for user ${req.user.id}: ${error}`);
    res.status(500).json({ error: 'Failed to remove item from wishlist' });
  }
};