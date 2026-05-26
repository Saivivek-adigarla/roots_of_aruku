import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types';
import { supabase } from '../lib/supabase';

interface WishlistStore {
  items: Product[];
  loading: boolean;
  toggle: (product: Product) => void;
  has: (productId: string) => boolean;
  remove: (productId: string) => void;
  clearWishlist: () => void;
  syncFromDb: (userId: string) => Promise<void>;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,

      toggle: (product) => {
        const exists = get().items.find((item) => item.id === product.id);
        if (exists) {
          set((state) => ({ items: state.items.filter((item) => item.id !== product.id) }));
          // Remove from DB if user authenticated
          supabase.from('wishlist').delete().eq('product_id', product.id).then(() => {});
        } else {
          set((state) => ({ items: [...state.items, product] }));
          // Add to DB
          const userId = (window as { __userId?: string }).__userId;
          if (userId) {
            supabase.from('wishlist').insert({ user_id: userId, product_id: product.id }).then(() => {});
          }
        }
      },

      has: (productId) => {
        return get().items.some((item) => item.id === productId);
      },

      remove: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
        supabase.from('wishlist').delete().eq('product_id', productId).then(() => {});
      },

      clearWishlist: () => set({ items: [] }),

      syncFromDb: async (userId: string) => {
        set({ loading: true });
        try {
          const { data } = await supabase
            .from('wishlist')
            .select('product_id, products(*)')
            .eq('user_id', userId);
          if (data && data.length > 0) {
            const items = data
              .filter((d: { products: unknown }) => d.products)
              .map((d: { product_id: string; products: Record<string, unknown> }) => {
                const p = d.products;
                return {
                  id: d.product_id,
                  name: p.name as string,
                  description: p.description as string,
                  category: p.category as Product['category'],
                  weight: p.weight as string,
                  mrp: p.mrp as number,
                  sellingPrice: p.selling_price as number,
                  offerPrice: p.offer_price as number,
                  benefits: (p.benefits as string[]) || [],
                  status: p.status as Product['status'],
                  showOfferBadge: (p.mrp as number) > (p.offer_price as number),
                  featured: p.featured as boolean,
                  images: (p.images as string[]) || [],
                  emoji: (p.emoji as string) || '',
                };
              });
            set({ items });
          }
        } catch {
          // Keep local data
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'roa-wishlist',
      version: 1,
    }
  )
);
