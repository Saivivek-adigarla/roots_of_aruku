import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  type DocumentSnapshot,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Address, Product } from '../types';
import { fetchUserProfile, upsertUserProfile } from './authService';

// Product helpers
export async function fetchProducts(filters?: { category?: string; featured?: boolean; status?: string }) {
  const constraints: QueryConstraint[] = [];
  if (filters?.category) constraints.push(where('category', '==', filters.category));
  if (filters?.featured) constraints.push(where('featured', '==', true));
  if (filters?.status) constraints.push(where('status', '==', filters.status));
  else constraints.push(where('status', '!=', 'discontinued'));

  constraints.push(orderBy('created_at', 'desc'));

  const q = query(collection(db, 'products'), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDbProduct(d));
}

export async function fetchProductById(id: string) {
  const ref = doc(db, 'products', id);
  const snap = await getDoc(ref);
  return snap.exists() ? mapDbProduct(snap) : null;
}

export async function searchProducts(searchQuery: string, category?: string, sortBy?: string, priceRange?: [number, number]) {
  const constraints: QueryConstraint[] = [];
  constraints.push(where('status', '!=', 'discontinued'));
  if (category) constraints.push(where('category', '==', category));

  constraints.push(orderBy('created_at', 'desc'));

  const q = query(collection(db, 'products'), ...constraints);
  const snap = await getDocs(q);
  let results = snap.docs.map((d) => mapDbProduct(d));

  if (priceRange) {
    results = results.filter((p) => p.offerPrice >= priceRange[0] && p.offerPrice <= priceRange[1]);
  }

  if (searchQuery) {
    const lq = searchQuery.toLowerCase();
    results = results.filter((p) =>
      p.name.toLowerCase().includes(lq) || p.description.toLowerCase().includes(lq)
    );
  }

  switch (sortBy) {
    case 'price-low': results.sort((a, b) => a.offerPrice - b.offerPrice); break;
    case 'price-high': results.sort((a, b) => b.offerPrice - a.offerPrice); break;
    case 'newest': break; // already sorted by created_at desc
    default: break;
  }

  return results;
}

function mapDbProduct(snap: DocumentSnapshot): Product {
  const d = snap.data()!;
  return {
    id: snap.id,
    name: d.name as string,
    description: d.description as string,
    category: d.category as Product['category'],
    weight: d.weight as string,
    mrp: d.mrp as number,
    sellingPrice: d.selling_price as number,
    offerPrice: d.offer_price as number,
    benefits: (d.benefits as string[]) || [],
    status: d.status as Product['status'],
    showOfferBadge: (d.mrp as number) > (d.offer_price as number),
    featured: d.featured as boolean,
    images: (d.images as string[]) || [],
    emoji: (d.emoji as string) || '',
    stockQuantity: d.stock_quantity as number,
    createdAt: d.created_at,
  };
}

// Address helpers
export async function fetchAddresses(userId: string) {
  const q = query(collection(db, 'addresses'), where('user_id', '==', userId), orderBy('created_at', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Address));
}

export async function saveAddress(userId: string, address: Omit<Address, 'id' | 'createdAt'>) {
  const ref = await addDoc(collection(db, 'addresses'), {
    user_id: userId,
    ...address,
    created_at: new Date(),
  });
  return { id: ref.id, ...address } as Address;
}

export async function updateAddress(id: string, updates: Partial<Address>) {
  const ref = doc(db, 'addresses', id);
  await updateDoc(ref, updates as any);
}

export async function deleteAddress(id: string) {
  await deleteDoc(doc(db, 'addresses', id));
}

// Order helpers
export async function fetchUserOrders(userId: string) {
  const q = query(
    collection(db, 'orders'),
    where('user_id', '==', userId),
    orderBy('created_at', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createOrder(orderData: any) {
  const ref = await addDoc(collection(db, 'orders'), {
    ...orderData,
    created_at: new Date(),
  });
  return { id: ref.id, ...orderData };
}

export async function fetchOrderById(orderId: string) {
  const ref = doc(db, 'orders', orderId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const orderData = { id: snap.id, ...snap.data() };

  // Fetch order items
  const itemsSnap = await getDocs(query(collection(db, 'order_items'), where('order_id', '==', orderId)));
  const items = itemsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return { ...orderData, items };
}

export async function updateOrderStatus(orderId: string, status: string) {
  const ref = doc(db, 'orders', orderId);
  await updateDoc(ref, { status, updated_at: new Date() });
}

// User profile
export { fetchUserProfile, upsertUserProfile };

export async function updateUserProfile(uid: string, updates: { name?: string; phone?: string }) {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, { ...updates, updatedAt: new Date() });
}
