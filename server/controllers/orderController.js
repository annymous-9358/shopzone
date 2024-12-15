import Order from '../models/Order.js';
import User from '../models/User.js';

export const createOrder = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { items, address } = req.body;
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = new Order({
      user: req.user.id,
      items,
      address,
      total,
      date: new Date(),
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
  }
};
