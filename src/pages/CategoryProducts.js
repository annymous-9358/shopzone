import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore'; 
import { useWishlistStore } from '../store/useWishlistStore'; // Assuming this is where useWishlistStore is defined

const CategoryProducts = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addItem, updateQuantityInCart } = useCartStore(); 
  const { addItemToWishlist } = useWishlistStore();

  useEffect(() => {
    const apiCategory = category === 'men clothing' ? "men's clothing" :
                      category === 'women clothing' ? "women's clothing" :
                      category;

    const fetchProducts = async () => {
      try {
        const response = await fetch(`https://fakestoreapi.com/products/category/${apiCategory}`);
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
  }, [category]);

  

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const addToCart = (product) => {
    addItem(product);
    
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-8">
        Products in {category}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.length > 0 ? (
          products.map(product => (
            <div key={product.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300" onClick={() => handleProductClick(product.id)}>
              <div className="w-full h-40 flex items-center justify-center overflow-hidden mb-4">
                <img src={product.image} alt={product.title} className="max-h-full object-contain" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 truncate">{product.title}</h3>
              <p className="text-sm font-bold text-gray-800 mt-2">${product.price}</p>
              <div className="flex justify-between mt-4 space-x-1">
                <button className="flex-1 px-2 py-1 bg-[#4338ca] text-white text-xs rounded-md hover:bg-blue-500 transition-colors duration-200" onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product);
                }}>Add to Cart</button>
                <button className="flex-1 px-2 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-indigo-600 transition-colors duration-200" onClick={(e) => {
                  e.stopPropagation();
                  handleAddToWishlist(product);
                }}>Wishlist</button>
              </div>
            </div>
          ))
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;