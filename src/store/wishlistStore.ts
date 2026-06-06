import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types';
import { db } from '../firebase/config';
import { collection, doc, getDocs, addDoc, deleteDoc, query, where } from 'firebase/firestore';

interface WishlistStore {
  items: Product[];
  loading: boolean;
  toggle: (product: Product, userId?: string) => void;
  has: (productId: string) => boolean;
  remove: (productId: string, userId?: string) => void;
  clearWishlist: () => void;
  syncFromDb: (userId: string) => Promise<void>;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,

      toggle: (product, userId) => {
        const exists = get().items.find((item) => item.id === product.id);
        if (exists) {
          set((state) => ({ items: state.items.filter((item) => item.id !== product.id) }));
          // Remove from DB if user authenticated
          if (userId) {
            (async () => {
              try {
                const q = query(collection(db, 'wishlist'), where('user_id', '==', userId), where('product_id', '==', product.id));
                const snap = await getDocs(q);
                for (const d of snap.docs) {
                  await deleteDoc(doc(db, 'wishlist', d.id));
                }
              } catch { /* ignore */ }
            })();
          }
        } else {
          set((state) => ({ items: [...state.items, product] }));
          // Add to DB
          if (userId) {
            addDoc(collection(db, 'wishlist'), { user_id: userId, product_id: product.id }).catch(() => {});
          }
        }
      },

      has: (productId) => {
        return get().items.some((item) => item.id === productId);
      },

      remove: (productId, userId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
        if (userId) {
          (async () => {
            try {
              const q = query(collection(db, 'wishlist'), where('user_id', '==', userId), where('product_id', '==', productId));
              const snap = await getDocs(q);
              for (const d of snap.docs) {
                await deleteDoc(doc(db, 'wishlist', d.id));
              }
            } catch { /* ignore */ }
          })();
        }
      },

      clearWishlist: () => set({ items: [] }),

      syncFromDb: async (userId: string) => {
        set({ loading: true });
        try {
          const q = query(collection(db, 'wishlist'), where('user_id', '==', userId));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const items: Product[] = [];
            for (const d of snap.docs) {
              const data = d.data();
              const productId = data.product_id as string;
              try {
                const productSnap = await getDocs(query(collection(db, 'products'), where('__name__', '==', productId)));
                if (!productSnap.empty) {
                  const p = productSnap.docs[0].data();
                  items.push({
                    id: productId,
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
                  });
                }
              } catch { /* skip product */ }
            }
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
