// src/pages/Cart.js

import React, { useEffect, useState } from "react";
import { useCartStore } from "../store/useCartStore";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Cart = () => {
  const { items = [], fetchCart, removeItem, updateQuantity, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [notification, setNotification] = useState('');

  useEffect(() => {
    fetchCart(); // Fetch cart items on component mount
  }, [fetchCart]); // Ensure fetchCart is called only once when component mounts

  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await axios.post('http://localhost:5000/api/orders', { items }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        console.log('Order placed successfully:', response.data);
        clearCart(); // Clear cart after successful checkout
        navigate('/orders', { state: { orderDetails: response.data } });
      } else {
        console.error('Failed to place order:', response.data);
      }
    } catch (error) {
      console.error('Error during checkout:', error);
    }
  };

  const updateQuantityInCart = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      await removeItemFromCart(productId);
      return;
    }
    const currentQuantity = items.find(item => item.productDetails.id === productId)?.quantity || 0;
    updateQuantity(productId, newQuantity - currentQuantity); // Adjust by the difference
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      const productIdStr = String(productId);
      const response = await axios.post('http://localhost:5000/api/cart/update', { productId: productIdStr, quantity: newQuantity }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status !== 200) {
        console.error('Failed to update quantity:', response.data);
        updateQuantity(productId, currentQuantity); // Revert to previous state on failure
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      updateQuantity(productId, currentQuantity); // Revert to previous state on error
    }
  };

  const removeItemFromCart = async (productId) => {
    try {
      const token = localStorage.getItem('token'); // Retrieve token from local storage
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const productIdStr = String(productId);
      const response = await axios.delete(
        'http://localhost:5000/api/cart/remove',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: { productId: productIdStr }, // Include productId in the request body
        }
      );
      if (response.status === 200) {
        removeItem(productId);
        setNotification('Product removed successfully');
        setTimeout(() => setNotification(''), 3000); // Clear notification after 3 seconds
        fetchCart(); // Refresh cart items after removal
      } else {
        console.error('Failed to remove item from cart:', response.data);
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  const handleCheckoutNavigation = () => {
    navigate('/checkout');
  };

  if (!Array.isArray(items) || items.length === 0) {
    return <div className="text-center py-8">Your cart is empty</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Shopping Cart</h2>
        {notification && <div className="mb-4 text-green-500">{notification}</div>}
        <div className="space-y-4">
          {Array.isArray(items) && items.map((item) => (
            item.productDetails ? (
              <div key={item.productDetails.id} className="flex items-center justify-between p-4 bg-white shadow-md rounded-md">
                <div className="flex items-center space-x-4">
                  <img src={item.productDetails.image} alt={item.productDetails.title} className="w-32 h-32 object-contain cursor-pointer" onClick={() => navigate(`/product/${item.productDetails.id}`)} />
                  <div>
                    <h3 className="text-lg font-semibold cursor-pointer" onClick={() => navigate(`/product/${item.productDetails.id}`)}>{item.productDetails.title}</h3>
                    <p>{item.productDetails.price ? `$${item.productDetails.price}` : 'Price not available'}</p>
                    <p>Quantity: {item.quantity}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <button onClick={() => updateQuantityInCart(item.productDetails.id, item.quantity - 1)} className="px-3 py-1 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">-</button>
                      <span className="px-4 py-1 border rounded-lg bg-gray-100 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantityInCart(item.productDetails.id, item.quantity + 1)} className="px-3 py-1 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">+</button>
                    </div>
                  </div>
                </div>
                <button onClick={() => removeItemFromCart(Number(item.productDetails.id))} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 text-white">Remove</button>
              </div>
            ) : (
              <div key={item.id} className="p-4 bg-white shadow-md rounded-md">
                <p>Loading product details...</p>
              </div>
            )
          ))}
        </div>
        <button onClick={handleCheckoutNavigation} className="mt-6 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Checkout</button>
      </div>
    </div>
  );
};

export default Cart;