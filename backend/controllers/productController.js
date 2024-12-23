import axios from 'axios';

// Base URL for the Fake Store API
const BASE_URL = 'https://fakestoreapi.com';

// Fetch all products
export const getAllProducts = async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/products`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching all products:', error.message);
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

// Fetch a single product by ID
export const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const response = await axios.get(`${BASE_URL}/products/${id}`);
        if (response.headers['content-type'].includes('application/json')) {
            res.json(response.data);
        } else {
            throw new Error('Non-JSON response received');
        }
    } catch (error) {
        console.error('Error fetching product by ID:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Failed to fetch product', error: error.message });
    }
};

// Fetch products by category
export const getProductsByCategory = async (req, res) => {
    const { category } = req.params;
    try {
        const response = await axios.get(`${BASE_URL}/products/category/${category}`);
        if (!response.data || response.data.length === 0) {
            throw new Error('No products found for this category');
        }
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching products by category:', error.message);
        res.status(404).json({ message: 'No products found for this category', error: error.message });
    }
};