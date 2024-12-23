import React, { useEffect } from 'react';
import { useWishlistStore } from '../store/useWishlistStore';
import { useCartStore } from '../store/useCartStore';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../lib/auth';

const Wishlist = () => {
  const { items: wishlist, fetchWishlist, removeItem } = useWishlistStore();
  const { addItem } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleAddToCart = (product) => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    const { productId, productDetails } = product;
    const completeProduct = {
      id: productId,
      quantity: 1,
      title: productDetails.title,
      price: productDetails.price,
      image: productDetails.image,
      _id: productDetails._id,
    };

    console.log('Attempting to add product to cart:', completeProduct);
    addItem(completeProduct);
    console.log('Product added to cart successfully:', completeProduct);
    removeItem(productId);
  };

  if (!Array.isArray(wishlist) || wishlist.length === 0) {
    return <div className="text-center py-8">Your wishlist is empty</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Your Wishlist</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map(item => {
          const { productDetails } = item;
          if (!productDetails) {
            return null;
          }
          return (
            <div key={item.productId} className="bg-white shadow-lg rounded-lg overflow-hidden" style={{ width: '250px', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div className="w-full h-48 flex items-center justify-center overflow-hidden">
                <img src={productDetails.image} alt={productDetails.title} className="object-contain h-full" />
              </div>
              <div className="p-4 flex-grow">
                <h3 className="text-lg font-semibold cursor-pointer" onClick={() => navigate(`/product/${item.productId}`)}>{productDetails.title}</h3>
                <p className="text-gray-600">{productDetails.price ? `$${productDetails.price}` : 'Price not available'}</p>
              </div>
              <div className="p-4 flex justify-between items-center">
                <button onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(item);
                }} className="px-3 py-1 text-sm bg-blue-600 rounded hover:bg-blue-700 text-white">
                  Add to Cart
                </button>
                <button onClick={() => removeItem(item.productId)} className="px-3 py-1 text-sm bg-red-600 rounded hover:bg-red-700 text-white">
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;