import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useCartStore } from '../store/useCartStore'; 
import { useWishlistStore } from '../store/useWishlistStore'; // Assuming this is where useWishlistStore is defined

const ProductDetail = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { addItem, updateQuantityInCart } = useCartStore();
  const { addItemToWishlist } = useWishlistStore();

  const handleAddToWishlist = async (product) => {
    const { wishlist = [] } = useWishlistStore.getState(); 
    const existsInWishlist = wishlist.some((item) => item.id === product.id);

    if (!existsInWishlist) {
      try {
        await addItemToWishlist(product);
        console.log('Product added to wishlist:', product);
      } catch (error) {
        console.error('Error adding to wishlist:', error);
      }
    } else {
      console.log('Product already in wishlist');
    }
  };

  const handleBuyNow = () => {
    addItem(product);
    navigate('/checkout');
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log(`Fetching product with ID: ${productId}`);
        const response = await fetch(`https://fakestoreapi.com/products/${productId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
        }
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Received non-JSON response');
        }
        const data = await response.json();
        console.log('Fetched product data:', data);
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const addToCart = () => {
    addItem(product);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-red-500">Product not found</p>
      </div>
    );
  }

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-5 w-5 ${i <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const descriptionPreview = product.description.split(' ').slice(0, 20).join(' ');

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/2">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-auto max-h-80 object-contain transform transition-transform duration-300 hover:scale-110"
          />
        </div>
        <div className="md:w-1/2 md:pl-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{product.title}</h1>
          <div className="text-lg text-gray-700 mb-4">
            {showFullDescription ? product.description : `${descriptionPreview}...`}
            <span className="text-blue-500 cursor-pointer" onClick={toggleDescription}>
              {showFullDescription ? ' Show less' : ' Show more'}
            </span>
          </div>
          <div className="flex items-center mb-4">
            {renderStars(product.rating.rate)}
            <span className="ml-2 text-sm text-gray-600">({product.rating.count} reviews)</span>
          </div>
          <p className="text-xl font-bold text-gray-900 mb-4">${product.price}</p>
          <div className="flex space-x-4">
            <button onClick={addToCart} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Add to Cart</button>
            <button onClick={() => handleAddToWishlist(product)} className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-blue-800">Wishlist</button>
            <button onClick={handleBuyNow} className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Buy Now</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;