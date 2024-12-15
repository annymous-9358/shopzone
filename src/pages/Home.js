import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../lib/auth';
import { useCartStore } from '../store/useCartStore'; // Correct import path

const Home = () => {
  const navigate = useNavigate();
  const { addItem, fetchCart } = useCartStore(); // Destructure addItem and fetchCart from useCartStore
  const [products, setProducts] = useState([]); 
  const [selectedProduct, setSelectedProduct] = useState(null);
  useEffect(() => {
    if (isAuthenticated()) {
      fetchCart(); // Fetch cart items from the server when the user is authenticated
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://fakestoreapi.com/products'); 
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data.slice(0, 8)); 
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleCategoryClick = (category) => {
    navigate(`/category/${category}`);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    console.log('Adding to cart:', product);
    addItem(product);
  };

  const handleWishlist = (product) => {
    if (!isAuthenticated()) {
      navigate('/login');
    } else {
      navigate('/profile');
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
            alt="Shopping"
          />
          <div className="absolute inset-0 bg-gray-600 mix-blend-multiply" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Welcome to ShopZone
          </h1>
          <p className="mt-6 text-xl text-white max-w-3xl">
            Discover our curated collection of premium products at unbeatable prices.
          </p>
          <div className="mt-10">
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Shop Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
          Shop by Category
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
          {["electronics", "jewelery", "men clothing", "women clothing"].map((category) => (
            <div
              key={category}
              className="group relative rounded-lg overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              onClick={() => handleCategoryClick(category)}
            >
              <img
                className="w-full h-60 object-cover"
                src={`https://source.unsplash.com/featured/?${category}`}
                alt={category}
              />
              <div className="absolute inset-0 bg-black opacity-25 group-hover:opacity-50 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 p-4">
                <h3 className="text-lg font-medium text-white">{category}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-8">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="w-full h-32 flex items-center justify-center overflow-hidden mb-2" onClick={() => handleProductClick(product.id)}>
                <img src={product.image} alt={product.title} className="max-h-full" />
              </div>
              <h3 className="text-md font-medium text-gray-900 truncate" onClick={() => handleProductClick(product.id)}>{product.title}</h3>
              <p className="text-lg font-bold text-gray-900 mt-1">${product.price}</p>
              <div className="flex justify-between mt-2">
                <button className="px-4 py-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors duration-200" onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product);
                }}>Add to Cart</button>
                <button className="px-4 py-2 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors duration-200" onClick={() => handleWishlist(product)}>Wishlist</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;