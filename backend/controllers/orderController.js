import Order from '../models/Order.js';
import User from '../models/User.js';

// Create a new order
export const createOrder = async (req, res) => {
  const { items, totalAmount, address, trackingNumber } = req.body;
  if (!items || !totalAmount || !address || !trackingNumber) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const order = {
      items,
      totalAmount,
      address,
      trackingNumber,
      status: 'Pending',
      createdAt: new Date(),
    };

    user.orders.push(order);
    await user.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: 'Error creating order', error });
  }
};

// Get user orders
export const getUserOrders = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('orders');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.orders);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching orders', error });
  }
};