import { create } from 'zustand';
import { getProductById } from '../services/products';
import api from '../services/api';

export const useWishlistStore = create((set, get) => ({
  items: [],
  fetchWishlist: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }
    try {
      const response = await api.get('/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('Fetched wishlist API response:', response.data);
      const detailedItems = response.data.items.map(item => ({
        ...item,
        productName:  item.productName,
        productImage:  item.productImage,
        productPrice:  item.productPrice
      }));
      set({ items: detailedItems });
      console.log('State updated with fetched items:', detailedItems);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  },
  addItemToWishlist: async (product) => {
    const productData = typeof product === 'object' ? product : await getProductById(product);
    const token = localStorage.getItem('token');
    if (!productData || !productData.id) {
      console.error('Invalid product data:', productData);
      return;
    }
    try {
      const existingItem = get().items.find((item) => item.productId === productData.id);
      if (existingItem) {
        console.log('Product already in wishlist');
        return;
      }
      const response = await api.post('/api/wishlist', { productId: productData.id }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        console.log('Setting state with items:', [...get().items, { ...productData }]);
        set((state) => ({ items: [...state.items, { ...productData }] }));
        console.log('State after update:', get().items);
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  },
  removeItem: async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }
    try {
      const response = await api.delete('/api/wishlist/remove', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        data: { productId }
      });
      if (response.status === 200) {
        console.log('Setting state with items:', get().items.filter(item => item.productId !== productId));
        set((state) => ({
          items: state.items.filter(item => item.productId !== productId)
        }));
        console.log('State after update:', get().items);
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  }
}));