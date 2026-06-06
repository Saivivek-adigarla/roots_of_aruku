// User & Auth Types
export interface User {
  uid: string;
  name: string;
  email: string;
  phone: string;
  photoURL?: string;
  isAdmin: boolean;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'coffee' | 'turmeric' | 'honey' | 'spices' | 'other';
  weight: string;
  mrp: number;
  sellingPrice: number;
  offerPrice: number;
  benefits: string[];
  status: 'active' | 'outofstock';
  showOfferBadge: boolean;
  featured: boolean;
  images: string[];
  emoji: string;
  stockQuantity?: number;
  createdAt?: unknown;
}

// Cart Types
export interface CartItem {
  product: Product;
  qty: number;
}

// Order Types
export interface OrderItem {
  product?: { id: string; name: string; weight: string; images?: string[]; offerPrice: number };
  product_id?: string;
  product_name?: string;
  weight?: string;
  quantity?: number;
  qty?: number;
  unit_price?: number;
  total_price?: number;
}

export interface Order {
  orderId: string;
  order_number?: string;
  items: OrderItem[];
  order_items?: OrderItem[];
  total: number;
  total_amount?: number;
  delivery_charge?: number;
  address: { name: string; address: string; city: string; pincode: string; phone: string };
  address_snapshot?: { name: string; address: string; city: string; pincode: string; phone: string };
  status: string;
  paymentId?: string;
  payment_method?: string;
  payment_status?: string;
  createdAt: string;
  created_at?: string;
}

// Payment Types
export type PaymentMethodType = 'razorpay' | 'cod' | 'upi' | 'card' | 'netbanking';

// Filter Types
export interface Filters {
  priceRange: [number, number];
  categories: string[];
  sortBy: 'price-low' | 'price-high' | 'newest' | 'bestselling' | 'rating';
}
