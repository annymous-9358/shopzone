import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  console.log('Registration attempt with email:', req.body.email);
  const { name, email, password, address } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      console.error('User already exists:', email);
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const user = await User.create({
      name,
      email,
      password,
      address,
    });

    if (user) {
      console.log('User registered successfully:', user.email);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        token: generateToken(user._id),
      });
    } else {
      console.error('Invalid user data for:', email);
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
export const authUser = asyncHandler(async (req, res) => {
  console.log('Login attempt with email:', req.body.email);
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.error('User not found:', email);
      res.status(401).json({ message: 'User not found' });
    } else if (!(await user.matchPassword(password))) {
      console.error('Invalid password for:', email);
      res.status(401).json({ message: 'Invalid password' });
    } else {
      console.log('User authenticated:', user.email);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});
