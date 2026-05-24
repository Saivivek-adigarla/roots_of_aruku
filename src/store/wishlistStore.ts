import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../data/products';

interface WishlistStore { items: Product[]; toggle: (product: Product) => void; has: (productId: string) => boolean; remove: (productId: string) => void; }

export const useWishlistStore = create<WishlistStore>()(
  persist((set, get) => ({
    items: [],
    toggle: (product) => { const exists = get().items.find(i => i.id === product.id); set({ items: exists ? get().items.filter(i => i.id !== product.id) : [...get().items, product] }); },
    has: (productId) => !!get().items.find(i => i.id === productId),
    remove: (productId) => set({ items: get().items.filter(i => i.id !== productId) }),
  }), { name: 'roa-wishlist' })
);
