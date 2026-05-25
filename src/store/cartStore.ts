import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '../types';
import { getDeliveryCharge } from '../utils/helpers';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  total: () => number;
  discount: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, qty = 1) => {
        set((state) => {
          const existing = state.items.find((item) => item.product.id === product.id);

          let newItems: CartItem[];
          if (existing) {
            newItems = state.items.map((item) =>
              item.product.id === product.id
                ? { ...item, qty: item.qty + qty }
                : item
            );
          } else {
            newItems = [...state.items, { product, qty }];
          }

          return { items: newItems };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId, qty) => {
        if (qty <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, qty } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      total: () => {
        const items = get().items;
        const subtotal = items.reduce((sum, item) => sum + item.product.offerPrice * item.qty, 0);
        const delivery = getDeliveryCharge(subtotal);
        return subtotal + delivery;
      },

      discount: () => {
        const items = get().items;
        return items.reduce(
          (sum, item) => sum + (item.product.mrp - item.product.offerPrice) * item.qty,
          0
        );
      },

      itemCount: () => {
        return get().items.reduce((count, item) => count + item.qty, 0);
      },
    }),
    {
      name: 'roa-cart',
      version: 1,
    }
  )
);
