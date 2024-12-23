import mongoose from 'mongoose';
import Product from '../models/Product.js';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const { data: products } = await axios.get('https://fakestoreapi.com/products');

    const formattedProducts = products.map(product => ({
      id: product.id,
      title: product.title,
      image: product.image,
      brand: 'Default Brand', 
      category: product.category,
      description: product.description,
      price: product.price,
      countInStock: 10, 
      rating: product.rating.rate || 0, 
      numReviews: product.rating.count || 0,
    }));

    await Product.deleteMany(); 
    await Product.insertMany(formattedProducts); 

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
