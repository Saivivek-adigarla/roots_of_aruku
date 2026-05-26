import { supabase } from '../lib/supabase';
import type { Address, Product } from '../types';

// Product helpers
export async function fetchProducts(filters?: { category?: string; featured?: boolean; status?: string }) {
  let query = supabase.from('products').select('*').order('created_at', { ascending: false });
  if (filters?.category) query = query.eq('category', filters.category);
  if (filters?.featured) query = query.eq('featured', true);
  if (filters?.status) query = query.eq('status', filters.status);
  else query = query.neq('status', 'discontinued');

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(mapDbProduct);
}

export async function fetchProductById(id: string) {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapDbProduct(data) : null;
}

export async function searchProducts(query: string, category?: string, sortBy?: string, priceRange?: [number, number]) {
  let q = supabase.from('products').select('*').neq('status', 'discontinued');
  if (category) q = q.eq('category', category);
  if (priceRange) {
    q = q.gte('offer_price', priceRange[0]).lte('offer_price', priceRange[1]);
  }

  switch (sortBy) {
    case 'price-low': q = q.order('offer_price', { ascending: true }); break;
    case 'price-high': q = q.order('offer_price', { ascending: false }); break;
    case 'newest': q = q.order('created_at', { ascending: false }); break;
    default: q = q.order('created_at', { ascending: false });
  }

  const { data, error } = await q;
  if (error) throw error;

  let results = (data || []).map(mapDbProduct);
  if (query) {
    const lq = query.toLowerCase();
    results = results.filter((p) =>
      p.name.toLowerCase().includes(lq) || p.description.toLowerCase().includes(lq)
    );
  }
  return results;
}

function mapDbProduct(db: Record<string, unknown>): Product {
  return {
    id: db.id as string,
    name: db.name as string,
    description: db.description as string,
    category: db.category as Product['category'],
    weight: db.weight as string,
    mrp: db.mrp as number,
    sellingPrice: db.selling_price as number,
    offerPrice: db.offer_price as number,
    benefits: (db.benefits as string[]) || [],
    status: db.status as Product['status'],
    showOfferBadge: (db.mrp as number) > (db.offer_price as number),
    featured: db.featured as boolean,
    images: (db.images as string[]) || [],
    emoji: (db.emoji as string) || '',
    stockQuantity: db.stock_quantity as number,
    createdAt: db.created_at,
  };
}

// Address helpers
export async function fetchAddresses(userId: string) {
  const { data, error } = await supabase.from('addresses').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapDbAddress);
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

  const existing = addr.id && addr.id.length > 10; // UUID format = real DB record
  if (existing) {
    const { data, error } = await supabase.from('addresses').update(payload).eq('id', addr.id).select().maybeSingle();
    if (error) throw error;
    return data ? mapDbAddress(data) : addr;
  } else {
    const { data, error } = await supabase.from('addresses').insert(payload).select().maybeSingle();
    if (error) throw error;
    return data ? mapDbAddress(data) : addr;
  }
}

export async function deleteAddress(id: string) {
  const { error } = await supabase.from('addresses').delete().eq('id', id);
  if (error) throw error;
}

function mapDbAddress(db: Record<string, unknown>): Address {
  return {
    id: db.id as string,
    name: db.name as string,
    phone: db.phone as string,
    address: db.address as string,
    city: db.city as string,
    state: db.state as string,
    pincode: db.pincode as string,
    landmark: (db.landmark as string) || '',
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

  const { data: orderData, error: orderError } = await supabase.from('orders').insert({
    order_number: order.orderNumber,
    user_id: order.userId,
    status: order.paymentMethod === 'cod' ? 'confirmed' : 'paid',
    total_amount: order.totalAmount,
    delivery_charge: order.deliveryCharge,
    payment_method: order.paymentMethod,
    payment_status: order.paymentStatus,
    payment_id: order.paymentId || null,
    address_snapshot: addressSnapshot,
  }).select().maybeSingle();

  if (orderError) throw orderError;
  if (!orderData) throw new Error('Failed to create order');

  const orderItems = order.items.map((item) => ({
    order_id: orderData.id,
    product_id: item.productId,
    product_name: item.productName,
    weight: item.weight,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total_price: item.totalPrice,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) throw itemsError;

  // Increment coupon usage if applicable
  if (order.couponCode) {
    await supabase.rpc('increment_coupon_usage', { coupon_code: order.couponCode }).catch(() => {
      // Fallback: manual increment
      supabase.from('coupons').update({ used_count: supabase.rpc('increment_coupon_usage', { coupon_code: order.couponCode }) }).eq('code', order.couponCode);
    });
  }

  return orderData;
}

export async function fetchUserOrders(userId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// User profile helpers
export async function upsertUserProfile(userId: string, email: string, name: string, phone: string, role: string = 'customer') {
  const { data, error } = await supabase.from('users').upsert({
    id: userId,
    name,
    email,
    phone,
    role,
  }, { onConflict: 'id' }).select().maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchUserProfile(userId: string) {
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateUserProfile(userId: string, updates: { name?: string; phone?: string }) {
  const { error } = await supabase.from('users').update(updates).eq('id', userId);
  if (error) throw error;
}
