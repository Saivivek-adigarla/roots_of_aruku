// User & Auth Types
export interface User {
  id: string;
  email: string;
  phoneNumber?: string;
  displayName?: string;
  photoURL?: string;
  addresses: Address[];
  createdAt: Date;
  updatedAt: Date;
  isAdmin?: boolean;
}

export interface Address {
  id: string;
  userId: string;
  type: 'home' | 'work' | 'other';
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  phoneNumber: string;
  isDefault: boolean;
  createdAt: Date;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  images: string[];
  stock: number;
  weight?: string;
  specifications?: Record<string, string>;
  badge?: 'flash-sale' | 'trending' | 'new' | 'bestseller';
  deliveryDays?: number;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Cart Types - CRITICAL FIX: Store complete product object
export interface CartItem {
  productId: string;
  product: Product; // STORE COMPLETE PRODUCT OBJECT
  quantity: number;
  addedAt: Date;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  couponCode?: string;
  lastUpdated: Date;
}

// Order Types
export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  shippingCharges: number;
  total: number;
  deliveryAddress: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderId: string;
  transactionId?: string;
  qrCode?: string;
  createdAt: Date;
  updatedAt: Date;
  expectedDelivery?: Date;
  trackingNumber?: string;
}

// Payment Types
export interface PaymentMethod {
  type: 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod';
  upiId?: string;
  cardLastFour?: string;
  bankName?: string;
}

export interface PaymentQR {
  orderId: string;
  merchantName: string;
  upiId: string;
  amount: number;
  transactionRef: string;
  expiresAt: Date;
}

// Coupon Types
export interface Coupon {
  code: string;
  discount: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiryDate: Date;
  active: boolean;
}

// Filter Types
export interface Filters {
  priceRange: [number, number];
  rating: number;
  categories: string[];
  sortBy: 'price-low' | 'price-high' | 'newest' | 'bestselling' | 'rating';
}