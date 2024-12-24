import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Product from '../models/Product.js';

const formatUserData = (user) => ({
  username: user.username,
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  addresses: user.addresses || [],
});

export const getUserProfile = asyncHandler(async (req, res) => {
  try {
    console.log(`Fetching profile for user ID: ${req.user.id}`);

    const userId = new mongoose.Types.ObjectId(req.user.id);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const productIds = user.cart.map(item => item.productId);
    console.log(`Product IDs in cart:`, productIds);
    const products = await Product.find({ id: { $in: productIds } });
    console.log(`Products retrieved:`, products);

    const userData = formatUserData(user);

    if (user.cart && user.cart.length) {
      userData.cart = user.cart.map(item => {
        const product = products.find(p => p.id === item.productId);
        console.log(`Mapping cart item:`, item, `with product:`, product);
        return {
          productId: product.id,
          name: product.title,
          price: product.price,
          quantity: item.quantity,
          image: product.image,
        };
      });
    } else {
      userData.cart = [];
    }
    res.json(userData);
  } catch (error) {
    console.error(`Error fetching user profile: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch user profile', details: error.message });
  }
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.addresses = req.body.addresses || user.addresses;

    const updatedUser = await user.save();

    res.json(formatUserData(updatedUser));
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export const getUserAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user.addresses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch addresses', details: error.message });
  }
};

export const addUserAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.addresses.push(req.body.address);
    await user.save();
    res.status(201).json(user.addresses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add address', details: error.message });
  }
};

export const addAddress = asyncHandler(async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user.id },
      { $push: { addresses: req.body } },
      { new: true, useFindAndModify: false }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ addresses: updatedUser.addresses });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add address', details: error.message });
  }
});
