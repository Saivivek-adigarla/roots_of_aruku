import { apiClient, endpoints, ApiResponse } from '../config/api.js';
import type { Address, Product } from '../types';

// =====================
// PRODUCTS
// =====================

export async function fetchProducts(filters?: {
  category?: string;
  featured?: boolean;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.append('category', filters.category);
  if (filters?.featured) params.append('featured', String(filters.featured));
  if (filters?.status) params.append('status', filters.status);
  if (filters?.page) params.append('page', String(filters.page));
  if (filters?.limit) params.append('limit', String(filters.limit));

  const response = await apiClient<{
    products: Product[];
    pagination: { page: number; total: number; pages: number };
  }>(`${endpoints.products.list}?${params.toString()}`);

  if (response.status === 'error') {
    throw new Error(response.error || 'Failed to fetch products');
  }

  return response.data?.products || [];
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const response = await apiClient<{ product: Product }>(endpoints.products.detail(id));

  if (response.status === 'error') {
    return null;
  }

  return response.data?.product || null;
}

export async function searchProducts(
  searchQuery: string,
  category?: string,
  sortBy?: string,
  priceRange?: [number, number]
): Promise<Product[]> {
  const params = new URLSearchParams();
  if (searchQuery) params.append('search', searchQuery);
  if (category) params.append('category', category);
  if (sortBy) params.append('sortBy', sortBy);

  const response = await apiClient<{
    products: Product[];
  }>(`${endpoints.products.list}?${params.toString()}`);

  if (response.status === 'error') {
    return [];
  }

  let results = response.data?.products || [];

  if (priceRange) {
    results = results.filter(
      (p) => p.offerPrice >= priceRange[0] && p.offerPrice <= priceRange[1]
    );
  }

  return results;
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  const response = await apiClient<{ products: Product[] }>(endpoints.products.featured);

  if (response.status === 'error') {
    return [];
  }

  return response.data?.products || [];
}

// =====================
// ADDRESSES
// =====================

export async function fetchAddresses(userId: string): Promise<Address[]> {
  const response = await apiClient<{ addresses: Address[] }>(endpoints.users.addresses, {
    method: 'GET',
  });

  if (response.status === 'error') {
    return [];
  }

  return response.data?.addresses || [];
}

export async function createAddress(address: Omit<Address, 'id' | 'createdAt'>): Promise<Address> {
  const response = await apiClient<{ address: Address }>(endpoints.users.addresses, {
    method: 'POST',
    body: JSON.stringify(address),
  });

  if (response.status === 'error') {
    throw new Error(response.error || 'Failed to create address');
  }

  return response.data!.address;
}

export async function updateAddress(
  id: string,
  updates: Partial<Address>
): Promise<Address> {
  const response = await apiClient<{ address: Address }>(
    endpoints.users.addressDetail(id),
    {
      method: 'PUT',
      body: JSON.stringify(updates),
    }
  );

  if (response.status === 'error') {
    throw new Error(response.error || 'Failed to update address');
  }

  return response.data!.address;
}

export async function deleteAddress(id: string): Promise<void> {
  const response = await apiClient(endpoints.users.addressDetail(id), {
    method: 'DELETE',
  });

  if (response.status === 'error') {
    throw new Error(response.error || 'Failed to delete address');
  }
}

// Alias for backward compatibility
export const saveAddress = createAddress;

// =====================
// ORDERS
// =====================

export interface CreateOrderPayload {
  items: Array<{
    productId: string;
    name: string;
    weight: string;
    qty: number;
    offerPrice: number;
  }>;
  total: number;
  address: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: 'cod' | 'upi' | 'razorpay';
}

export async function createOrder(payload: CreateOrderPayload): Promise<{
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
}> {
  const response = await apiClient<{
    order: { id: string; order_number: string; total_amount: number; status: string };
  }>(endpoints.orders.create, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (response.status === 'error') {
    throw new Error(response.error || 'Failed to create order');
  }

  return response.data!.order;
}

export async function fetchOrders(page = 1, limit = 10): Promise<{
  orders: any[];
  pagination: { page: number; total: number; pages: number };
}> {
  const response = await apiClient<{
    orders: any[];
    pagination: { page: number; total: number; pages: number };
  }>(`${endpoints.orders.list}?page=${page}&limit=${limit}`, {
    method: 'GET',
  });

  if (response.status === 'error') {
    return { orders: [], pagination: { page, total: 0, pages: 0 } };
  }

  return {
    orders: response.data?.orders || [],
    pagination: response.data?.pagination || { page, total: 0, pages: 0 },
  };
}

export async function fetchOrderById(id: string): Promise<any | null> {
  const response = await apiClient<{ order: any }>(endpoints.orders.detail(id), {
    method: 'GET',
  });

  if (response.status === 'error') {
    return null;
  }

  return response.data?.order || null;
}

// Alias for backward compatibility
export const fetchUserOrders = fetchOrders;

export async function cancelOrder(id: string): Promise<void> {
  const response = await apiClient(endpoints.orders.cancel(id), {
    method: 'POST',
  });

  if (response.status === 'error') {
    throw new Error(response.error || 'Failed to cancel order');
  }
}

// =====================
// USER PROFILE
// =====================

export async function fetchUserProfile(): Promise<{
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
} | null> {
  const response = await apiClient<{
    user: { id: string; name: string; email: string; phone: string; role: string };
  }>(endpoints.users.profile, {
    method: 'GET',
  });

  if (response.status === 'error') {
    return null;
  }

  return response.data?.user || null;
}

export async function updateUserProfile(updates: {
  name?: string;
  phone?: string;
}): Promise<void> {
  const response = await apiClient(endpoints.users.profile, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });

  if (response.status === 'error') {
    throw new Error(response.error || 'Failed to update profile');
  }
}
