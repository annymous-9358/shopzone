import { create } from 'zustand';

export const useUserStore = create((set) => ({
  user: {
    name: localStorage.getItem('name') || '',
    email: localStorage.getItem('email') || '',
  },
  setUser: (userData) => set({ user: userData }),
}));
