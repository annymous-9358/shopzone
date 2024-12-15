import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

const formatUserData = (user) => ({
  username: user.username,
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  addresses: user.addresses || [],
});

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate({
    path: 'cart.productId',
    model: 'Product',
    select: 'title price image id',
  });
  if (user) {
    const userData = formatUserData(user);
    userData.cart = user.cart.items.map(item => ({
      productId: item.product.id,
      name: item.product.title,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.image,
    }));
    res.json(userData);
  } else {
    res.status(404);
    throw new Error('User not found');
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
  const user = await User.findById(req.user.id);

  if (user) {
    user.addresses = user.addresses || [];
    user.addresses.push(req.body);
    const updatedUser = await user.save();

    res.json({
      addresses: updatedUser.addresses,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});
