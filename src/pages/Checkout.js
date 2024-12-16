// src/pages/Checkout.js

import React, { useState, useEffect } from 'react';
import { useCartStore } from '../store/useCartStore';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { fetchProducts } from '../services/api';

const Checkout = () => {
  const { items, clearCart } = useCartStore();
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    isDefault: false
  });
  const [addresses, setAddresses] = useState([]);
  const [productDetails, setProductDetails] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/api/users/profile');
        const userData = response.data;
        setProductDetails(userData.cartItems);
        setAddresses(userData.addresses);
        // Assuming userData contains profile information
        if (userData.addresses.length > 0) {
          setAddress(userData.addresses[0]); // Set the first address as default
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const loadProductDetails = async () => {
      try {
        const productsData = await fetchProducts();
        console.log('Fetched products:', productsData);
        console.log('Cart items:', items);
        const cartProductDetails = items.map(cartItem => {
          const product = productsData.find(p => p.id === cartItem.productId);
          return {
            ...cartItem,
            image: product.image,
            title: product.title,
            price: product.price
          };
        });
        console.log('Mapped product details:', cartProductDetails);
        setProductDetails(cartProductDetails);
      } catch (error) {
        console.error('Failed to load product details:', error);
      }
    };
    loadProductDetails();
  }, [items]);

  const handlePlaceOrder = async () => {
    try {
      // Save the address to the user's profile
      await api.put('/users/profile/address', { addresses: [...addresses, address] });

      // Create order data
      const orderData = {
        items: productDetails.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          name: item.title
        })),
        totalAmount: productDetails.reduce((total, item) => total + item.price * item.quantity, 0),
        address,
        status: 'Pending',
        trackingNumber: `TRK${Math.floor(Math.random() * 1000000)}` // Example tracking number
      };

      // Send order data to the backend
      const response = await api.post('/api/orders', orderData);
      if (response.status === 201) {
        console.log('Order placed successfully:', response.data);
        clearCart();
        navigate('/order-history');  // Redirect to order history
      } else {
        console.error('Failed to place order:', response);
      }
    } catch (err) {
      console.error('Failed to place order:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6">Checkout</h2>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Order Summary</h3>
        <ul className="space-y-4">
          {productDetails.map(item => (
            <li key={item.id} className="flex justify-between items-center border-b pb-2">
              <img src={item.image} alt={item.title} className="w-20 h-20 object-contain mr-4" />
              <span className="flex-1 text-lg font-medium text-gray-900">{item.title}</span>
              <span className="text-lg font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <p className="text-2xl font-bold text-gray-800 mt-6">Total: ${productDetails.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</p>
      </div>
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Address</label>
        <input
          type="text"
          value={address.street}
          onChange={(e) => setAddress({ ...address, street: e.target.value })}
          className="mt-1 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Street"
        />
        <input
          type="text"
          value={address.city}
          onChange={(e) => setAddress({ ...address, city: e.target.value })}
          className="mt-2 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="City"
        />
        <input
          type="text"
          value={address.state}
          onChange={(e) => setAddress({ ...address, state: e.target.value })}
          className="mt-2 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="State"
        />
        <input
          type="text"
          value={address.zipCode}
          onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
          className="mt-2 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Zip Code"
        />
        <input
          type="text"
          value={address.country}
          onChange={(e) => setAddress({ ...address, country: e.target.value })}
          className="mt-2 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Country"
        />
      </div>
      <button
        className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 mt-6 font-semibold shadow-md transition duration-300 ease-in-out"
        onClick={handlePlaceOrder}
      >
        Place Order
      </button>
    </div>
  );
};

export default Checkout;