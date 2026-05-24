import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../data/products';

export interface CartItem { product: Product; qty: number; }

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  total: () => number;
  discount: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist((set, get) => ({
    items: [],
    addItem: (product, qty = 1) => {
      const existing = get().items.find(i => i.product.id === product.id);
      if (existing) {
        set({ items: get().items.map(i => i.product.id === product.id ? { ...i, qty: i.qty + qty } : i) });
      } else {
        set({ items: [...get().items, { product, qty }] });
      }
    },
    removeItem: (productId) => set({ items: get().items.filter(i => i.product.id !== productId) }),
    updateQty: (productId, qty) => qty <= 0 ? get().removeItem(productId) : set({ items: get().items.map(i => i.product.id === productId ? { ...i, qty } : i) }),
    clearCart: () => set({ items: [] }),
    total: () => get().items.reduce((sum, i) => sum + i.product.offerPrice * i.qty, 0),
    discount: () => get().items.reduce((sum, i) => sum + (i.product.mrp - i.product.offerPrice) * i.qty, 0),
    itemCount: () => get().items.reduce((sum, i) => sum + i.qty, 0),
  }), { name: 'roa-cart' })
);
