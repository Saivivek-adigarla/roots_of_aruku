import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, Cart } from '../types';

interface CartStore extends Cart {
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  applyCoupon: (code: string, discountPercent: number) => void;
  removeCoupon: () => void;
  clearCart: () => void;
  calculateTotals: () => void;
  syncCart: (userId: string) => Promise<void>;
}

const calculateCartTotals = (items: CartItem[], discount: number = 0) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const discountAmount = Math.round(subtotal * (discount / 100));
  const total = subtotal + tax - discountAmount;
  
  return {
    subtotal: Math.round(subtotal),
    tax,
    discount: discountAmount,
    total,
  };
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      couponCode: undefined,
      lastUpdated: new Date(),
      
      addItem: (product, quantity) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.productId === product.id
          );
          
          let newItems: CartItem[];
          
          if (existingItem) {
            newItems = state.items.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
                : item
            );
          } else {
            newItems = [
              ...state.items,
              {
                productId: product.id,
                product: { ...product },
                quantity: Math.min(quantity, product.stock),
                addedAt: new Date(),
              },
            ];
          }
          
          const totals = calculateCartTotals(newItems, state.discount);
          return {
            items: newItems,
            ...totals,
            lastUpdated: new Date(),
          };
        });
      },
      
      removeItem: (productId) => {
        set((state) => {
          const newItems = state.items.filter(
            (item) => item.productId !== productId
          );
          const totals = calculateCartTotals(newItems, state.discount);
          return {
            items: newItems,
            ...totals,
            lastUpdated: new Date(),
          };
        });
      },
      
      updateQuantity: (productId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            const newItems = state.items.filter((item) => item.productId !== productId);
            const totals = calculateCartTotals(newItems, state.discount);
            return {
              items: newItems,
              ...totals,
              lastUpdated: new Date(),
            };
          }
          
          const newItems = state.items.map((item) =>
            item.productId === productId
              ? { ...item, quantity }
              : item
          );
          
          const totals = calculateCartTotals(newItems, state.discount);
          return {
            items: newItems,
            ...totals,
            lastUpdated: new Date(),
          };
        });
      },
      
      applyCoupon: (code, discountPercent) => {
        set((state) => {
          const totals = calculateCartTotals(state.items, discountPercent);
          return {
            couponCode: code,
            discount: discountPercent,
            ...totals,
            lastUpdated: new Date(),
          };
        });
      },
      
      removeCoupon: () => {
        set((state) => {
          const totals = calculateCartTotals(state.items, 0);
          return {
            couponCode: undefined,
            discount: 0,
            ...totals,
            lastUpdated: new Date(),
          };
        });
      },
      
      clearCart: () => {
        set({
          items: [],
          subtotal: 0,
          tax: 0,
          discount: 0,
          total: 0,
          couponCode: undefined,
          lastUpdated: new Date(),
        });
      },
      
      calculateTotals: () => {
        set((state) => {
          const totals = calculateCartTotals(state.items, state.discount);
          return {
            ...totals,
            lastUpdated: new Date(),
          };
        });
      },
      
      syncCart: async (userId: string) => {
        try {
          const cartData = get();
          // In production: POST /api/users/{userId}/cart
        } catch (error) {
          console.error('Failed to sync cart:', error);
        }
      },
    }),
    {
      name: 'cart-store',
      version: 2,
      serialize: (state) => {
        return JSON.stringify({
          state,
          version: 2,
        });
      },
      deserialize: (str) => {
        const { state } = JSON.parse(str);
        return {
          ...state,
          lastUpdated: new Date(state.lastUpdated),
          items: state.items.map((item: CartItem) => ({
            ...item,
            addedAt: new Date(item.addedAt),
          })),
        };
      },
    }
  )
);