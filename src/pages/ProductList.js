import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore'; 
import { useWishlistStore } from '../store/useWishlistStore';
import { FaFilter } from 'react-icons/fa';
import { FaHeart } from 'react-icons/fa';
import { isAuthenticated } from '../lib/auth'; // Import the auth module

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const category = searchParams.get('category');
  const { addItem } = useCartStore(); 
  const { addItemToWishlist, get } = useWishlistStore();
  const [sortOption, setSortOption] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = selectedCategory ? `https://fakestoreapi.com/products/category/${selectedCategory}` : `https://fakestoreapi.com/products`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory]);

  useEffect(() => {
    const fetchWishlist = useWishlistStore.getState().fetchWishlist;
    fetchWishlist((fetchedWishlist) => {
      setWishlist(fetchedWishlist.map(item => item.id));
    });
  }, []);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToWishlist = (product) => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    console.log('Adding to wishlist:', product);
    addItemToWishlist(product);
    setWishlist(prevWishlist => [...prevWishlist, product.id]);
  };

  const handleAddToCartFromWishlist = (product) => {
    const { items, addItem, updateQuantityInCart } = useCartStore();
    const existsInCart = items.some((cartItem) => cartItem.id === product.id);

    if (existsInCart) {
      updateQuantityInCart(product.id, product.quantity + 1);
    } else {
      addItem(product);
    }
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
    let sortedProducts = [...products];
    if (event.target.value === 'priceLowToHigh') {
      sortedProducts.sort((a, b) => a.price - b.price);
    } else if (event.target.value === 'priceHighToLow') {
      sortedProducts.sort((a, b) => b.price - a.price);
    } else if (event.target.value === 'rating') {
      sortedProducts.sort((a, b) => b.rating.rate - a.rating.rate);
    }
    setProducts(sortedProducts);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex">
      <aside className="w-1/4 p-4 bg-white shadow-md rounded-md">
        <h3 className="text-lg font-bold mb-4 flex items-center"><FaFilter className="inline mr-2 text-indigo-500" /> Filter</h3>
        <div className="mb-6">
          <label htmlFor="category" className="block font-medium mb-2 text-gray-700">Category</label>
          <select id="category" className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={selectedCategory} onChange={handleCategoryChange}>
            <option value="">All</option>
            <option value="electronics">Electronics</option>
            <option value="jewelery">Jewelery</option>
            <option value="men's clothing">Men's Clothing</option>
            <option value="women's clothing">Women's Clothing</option>
          </select>
        </div>
        <div className="mb-6">
          <label htmlFor="sort" className="block font-medium mb-2 text-gray-700">Sort By</label>
          <select id="sort" className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={sortOption} onChange={handleSortChange}>
            <option value="">Select</option>
            <option value="priceLowToHigh">Price: Low to High</option>
            <option value="priceHighToLow">Price: High to Low</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </aside>
      <div className="w-3/4 px-4">
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-8">
          {selectedCategory ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Products` : 'All Products'}
        </h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300" onClick={() => handleProductClick(product.id)}>
                <div className="w-full h-32 flex items-center justify-center overflow-hidden mb-2">
                  <img src={product.image} alt={product.title} className="max-h-full" />
                </div>
                <h3 className="text-md font-medium text-indigo-900 truncate">{product.title}</h3>
                <p className="text-lg font-bold text-indigo-600 mt-1">${product.price}</p>
                <div className="flex justify-between mt-2 space-x-2">
                  <button className="flex-1 px-4 py-2 bg-indigo-500 text-white text-xs rounded hover:bg-indigo-600 transition-colors duration-200" onClick={(e) => {
                    e.stopPropagation();
                    addItem(product);
                  }}>Add to Cart</button>
                  <button onClick={(e) => { e.stopPropagation(); handleAddToWishlist(product); }} className={`transition-colors duration-200 flex justify-center items-center ${wishlist.includes(product.id) ? 'text-red-500' : 'text-gray-300'}`}>
                    <FaHeart />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;