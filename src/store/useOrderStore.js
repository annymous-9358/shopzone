import { create } from 'zustand';
import api from '../services/api';

export const useOrderStore = create((set) => ({
  orders: [],
  fetchOrders: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }
    try {
      const response = await api.get('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('Fetched orders:', response.data);
      const detailedOrders = response.data.map(order => ({
        ...order,
        items: order.items.map(item => ({
          ...item,
          productDetails: {
            name: item.productName,
            image: item.productImage,
            price: item.productPrice,
          }
        }))
      }));
      set({ orders: detailedOrders });
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  },
}));
