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
  return snap.docs.map((d) => mapDbAddress(d));
}

export async function saveAddress(userId: string, addr: Address) {
  const payload = {
    user_id: userId,
    name: addr.name,
    phone: addr.phone,
    address: addr.address,
    city: addr.city,
    state: addr.state,
    pincode: addr.pincode,
    landmark: addr.landmark || '',
    is_default: false,
  };

  const existing = addr.id && addr.id.length > 10;
  if (existing) {
    const ref = doc(db, 'addresses', addr.id);
    await updateDoc(ref, payload);
    return addr;
  } else {
    const colRef = collection(db, 'addresses');
    const docRef = await addDoc(colRef, { ...payload, created_at: new Date().toISOString() });
    return { ...addr, id: docRef.id };
  }
}

export async function deleteAddress(id: string) {
  await deleteDoc(doc(db, 'addresses', id));
}

function mapDbAddress(snap: DocumentSnapshot): Address {
  const d = snap.data()!;
  return {
    id: snap.id,
    name: d.name as string,
    phone: d.phone as string,
    address: d.address as string,
    city: d.city as string,
    state: d.state as string,
    pincode: d.pincode as string,
    landmark: (d.landmark as string) || '',
  };
}

// Order helpers
export async function createOrder(order: {
  userId: string;
  orderNumber: string;
  items: { productId: string; productName: string; weight: string; quantity: number; unitPrice: number; totalPrice: number }[];
  totalAmount: number;
  deliveryCharge: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentId?: string;
  address: Address;
  couponCode?: string;
}) {
  const addressSnapshot = {
    name: order.address.name,
    phone: order.address.phone,
    address: order.address.address,
    city: order.address.city,
    state: order.address.state,
    pincode: order.address.pincode,
    landmark: order.address.landmark || '',
  };

  const orderData = {
    order_number: order.orderNumber,
    user_id: order.userId,
    status: order.paymentMethod === 'cod' ? 'confirmed' : 'paid',
    total_amount: order.totalAmount,
    delivery_charge: order.deliveryCharge,
    payment_method: order.paymentMethod,
    payment_status: order.paymentStatus,
    payment_id: order.paymentId || null,
    address_snapshot: addressSnapshot,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const orderRef = await addDoc(collection(db, 'orders'), orderData);

  // Add order items as subcollection
  const orderItems = order.items.map((item) => ({
    order_id: orderRef.id,
    product_id: item.productId,
    product_name: item.productName,
    weight: item.weight,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total_price: item.totalPrice,
  }));

  for (const item of orderItems) {
    await addDoc(collection(db, 'order_items'), item);
  }

  // Increment coupon usage if applicable
  if (order.couponCode) {
    try {
      const couponRef = doc(db, 'coupons', order.couponCode);
      const couponSnap = await getDoc(couponRef);
      if (couponSnap.exists()) {
        const currentCount = (couponSnap.data().used_count as number) || 0;
        await updateDoc(couponRef, { used_count: currentCount + 1 });
      }
    } catch {
      // Best effort
    }
  }

  return { id: orderRef.id, ...orderData };
}

export async function fetchUserOrders(userId: string) {
  const q = query(collection(db, 'orders'), where('user_id', '==', userId), orderBy('created_at', 'desc'));
  const snap = await getDocs(q);

  const orders = [];
  for (const orderDoc of snap.docs) {
    const orderData = orderDoc.data();
    const itemsQ = query(collection(db, 'order_items'), where('order_id', '==', orderDoc.id));
    const itemsSnap = await getDocs(itemsQ);
    const orderItems = itemsSnap.docs.map((d) => d.data());
    orders.push({ id: orderDoc.id, ...orderData, order_items: orderItems });
  }

  return orders;
}

// Re-export profile helpers from authService
export { upsertUserProfile, fetchUserProfile };

export async function updateUserProfile(userId: string, updates: { name?: string; phone?: string }) {
  const ref = doc(db, 'users', userId);
  await updateDoc(ref, updates);
}
