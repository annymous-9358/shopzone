import React, { useEffect } from 'react';
import { useOrderStore } from '../store/useOrderStore';
import { useCartStore } from '../store/useCartStore';

const Orders = () => {
  const { orders, fetchOrders } = useOrderStore();
  const { items: cartItems } = useCartStore();

  useEffect(() => {
    fetchOrders(); // Fetch orders on component mount
  }, [fetchOrders]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Your Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order, index) => (
          <div key={index} className="p-6 bg-white shadow-lg rounded-lg mb-6">
            <h3 className="text-xl font-semibold mb-2">Order #{index + 1}</h3>
            <p className="text-gray-600 mb-2">Total: ${order.totalAmount}</p>
            <p className="text-gray-600 mb-2">Status: {order.status}</p>
            <p className="text-gray-600 mb-2">Tracking Number: {order.trackingNumber}</p>
            {order.address ? (
              <p className="text-gray-600 mb-4">Address: {order.address.street}, {order.address.city}, {order.address.state}, {order.address.zipCode}, {order.address.country}</p>
            ) : (
              <p className="text-gray-600 mb-4">Address information not available</p>
            )}
            <ul className="space-y-4">
              {order.items.map(item => (
                <li key={item.productId} className="flex items-center space-x-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-contain rounded-md" />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-gray-500">{item.quantity} x ${item.price}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;