import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistStore {
  items: string[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  syncWishlist: (userId: string) => Promise<void>;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (productId) => {
        set((state) => {
          if (!state.items.includes(productId)) {
            return { items: [...state.items, productId] };
          }
          return state;
        });
      },
      
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((id) => id !== productId),
        }));
      },
      
      isInWishlist: (productId) => get().items.includes(productId),
      
      clearWishlist: () => set({ items: [] }),
      
      syncWishlist: async (userId: string) => {
        try {
          // In production: POST /api/users/{userId}/wishlist
        } catch (error) {
          console.error('Failed to sync wishlist:', error);
        }
      },
    }),
    {
      name: 'wishlist-store',
    }
  )
);