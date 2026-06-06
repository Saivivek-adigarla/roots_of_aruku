import { retryWithBackoff, cache, rateLimiter, CircuitBreaker } from '../utils/enterpriseOptimization';
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc,
  query, where, orderBy, limit, startAfter,
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Circuit breaker for database operations
const dbCircuitBreaker = new CircuitBreaker({ failureThreshold: 5, timeout: 30000 });

// 1. OPTIMIZED PRODUCT FETCHING
export const productsService = {
  getProductsByCategory: async (category: string, page: number = 1, pageSize: number = 20, userId: string | null = null) => {
    if (userId) await rateLimiter.checkLimit(`products:${userId}`);

    const cacheKey = `products:${category}:${page}:${pageSize}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const result = await dbCircuitBreaker.execute(async () => {
        return await retryWithBackoff(async () => {
          const q = query(
            collection(db, 'products'),
            where('category', '==', category),
            where('status', '==', 'active'),
            orderBy('created_at', 'desc'),
            limit(pageSize)
          );
          const snap = await getDocs(q);
          const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          return { data, pagination: { page, pageSize, total: data.length, pages: Math.ceil(data.length / pageSize) } };
        });
      });
      cache.set(cacheKey, result, 3600000);
      return result;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return { data: [], pagination: { page, pageSize, total: 0, pages: 0 } };
    }
  },

  searchProducts: async (searchQuery: string, page: number = 1, pageSize: number = 20, userId: string | null = null) => {
    if (userId) await rateLimiter.checkLimit(`search:${userId}`);

    const cacheKey = `search:${searchQuery}:${page}:${pageSize}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const result = await dbCircuitBreaker.execute(async () => {
        return await retryWithBackoff(async () => {
          const q = query(collection(db, 'products'), where('status', '==', 'active'), orderBy('created_at', 'desc'), limit(pageSize));
          const snap = await getDocs(q);
          let data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          const lq = searchQuery.toLowerCase();
          data = data.filter((p: Record<string, unknown>) =>
            String(p.name).toLowerCase().includes(lq) || String(p.description).toLowerCase().includes(lq)
          );
          return { data, page, pageSize };
        });
      });
      cache.set(cacheKey, result, 1800000);
      return result;
    } catch (error) {
      console.error('Search failed:', error);
      return { data: [], page, pageSize };
    }
  },

  getProductDetail: async (productId: string, userId: string | null = null) => {
    if (userId) await rateLimiter.checkLimit(`product:${userId}`);

    const cacheKey = `product:${productId}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const result = await dbCircuitBreaker.execute(async () => {
        return await retryWithBackoff(async () => {
          const [productSnap, reviewsSnap] = await Promise.all([
            getDoc(doc(db, 'products', productId)),
            getDocs(query(collection(db, 'reviews'), where('product_id', '==', productId), orderBy('created_at', 'desc'), limit(50))),
          ]);
          if (!productSnap.exists()) throw new Error('Product not found');
          return {
            product: { id: productSnap.id, ...productSnap.data() },
            reviews: reviewsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
          };
        });
      });
      cache.set(cacheKey, result, 1800000);
      return result;
    } catch (error) {
      console.error('Failed to fetch product detail:', error);
      return null;
    }
  },
};

// 2. OPTIMIZED ORDER SERVICE
export const ordersService = {
  createOrder: async (userId: string, orderData: { items: { product_id: string; quantity: number }[]; [key: string]: unknown }) => {
    await rateLimiter.checkLimit(`order:${userId}`);
    try {
      return await dbCircuitBreaker.execute(async () => {
        return await retryWithBackoff(async () => {
          const items = orderData.items;
          const stockChecks = await Promise.all(
            items.map((item: { product_id: string; quantity: number }) => getDoc(doc(db, 'products', item.product_id)))
          );

          for (let i = 0; i < stockChecks.length; i++) {
            if (!stockChecks[i].exists()) throw new Error(`Product ${items[i].product_id} not found`);
            const stock = (stockChecks[i].data().stock_quantity as number) || 0;
            if (stock < items[i].quantity) throw new Error(`Insufficient stock for item ${i + 1}`);
          }

          const { data: insertedData, ...rest } = orderData as { data: unknown };
          const docRef = await addDoc(collection(db, 'orders'), {
            user_id: userId,
            order_number: `ROA-${Date.now()}`,
            ...rest,
            created_at: new Date().toISOString(),
          });

          cache.clear();
          return { id: docRef.id };
        });
      });
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  },

  getUserOrders: async (userId: string, page: number = 1, pageSize: number = 20) => {
    await rateLimiter.checkLimit(`orders:${userId}`);

    const cacheKey = `orders:${userId}:${page}:${pageSize}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const result = await dbCircuitBreaker.execute(async () => {
        return await retryWithBackoff(async () => {
          const q = query(collection(db, 'orders'), where('user_id', '==', userId), orderBy('created_at', 'desc'), limit(pageSize));
          const snap = await getDocs(q);
          const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          return { data, pagination: { page, pageSize, total: data.length, pages: Math.ceil(data.length / pageSize) } };
        });
      });
      cache.set(cacheKey, result, 600000);
      return result;
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      return { data: [], pagination: { page, pageSize, total: 0, pages: 0 } };
    }
  },

  getOrderStatus: async (orderId: string, userId: string | null = null) => {
    if (userId) await rateLimiter.checkLimit(`track:${userId}`);

    const cacheKey = `order:status:${orderId}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const result = await dbCircuitBreaker.execute(async () => {
        return await retryWithBackoff(async () => {
          const snap = await getDoc(doc(db, 'orders', orderId));
          if (!snap.exists()) throw new Error('Order not found');
          return { id: snap.id, ...snap.data() };
        });
      });
      cache.set(cacheKey, result, 300000);
      return result;
    } catch (error) {
      console.error('Failed to fetch order status:', error);
      return null;
    }
  },
};

// 3. OPTIMIZED CUSTOMER SERVICE
export const customersService = {
  getProfile: async (userId: string) => {
    const cacheKey = `profile:${userId}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const result = await dbCircuitBreaker.execute(async () => {
        return await retryWithBackoff(async () => {
          const snap = await getDoc(doc(db, 'users', userId));
          return snap.exists() ? { id: snap.id, ...snap.data() } : null;
        });
      });
      cache.set(cacheKey, result, 3600000);
      return result;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      return null;
    }
  },

  getAddresses: async (userId: string) => {
    const cacheKey = `addresses:${userId}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const result = await dbCircuitBreaker.execute(async () => {
        return await retryWithBackoff(async () => {
          const q = query(collection(db, 'addresses'), where('user_id', '==', userId), orderBy('created_at', 'desc'));
          const snap = await getDocs(q);
          return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        });
      });
      cache.set(cacheKey, result, 1800000);
      return result;
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      return [];
    }
  },
};

// 4. BATCH OPERATIONS FOR ADMIN
export const batchService = {
  updateProducts: async (updates: { id: string; data: Record<string, unknown> }[]) => {
    const batchSize = 50;
    const results: unknown[] = [];

    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((update) => updateDoc(doc(db, 'products', update.id), update.data))
      );
      results.push(...batchResults);
    }

    cache.clear();
    return results;
  },

  createBulkOrders: async (orders: Record<string, unknown>[]) => {
    try {
      return await dbCircuitBreaker.execute(async () => {
        return await retryWithBackoff(async () => {
          const results = [];
          for (const order of orders) {
            const docRef = await addDoc(collection(db, 'orders'), { ...order, created_at: new Date().toISOString() });
            results.push({ id: docRef.id });
          }
          return results;
        });
      });
    } catch (error) {
      console.error('Bulk order creation failed:', error);
      throw error;
    }
  },
};

// 5. ANALYTICS SERVICE
export const analyticsService = {
  trackAction: async (userId: string, action: string, data: Record<string, unknown>) => {
    setTimeout(async () => {
      try {
        await addDoc(collection(db, 'analytics'), {
          user_id: userId,
          action,
          data,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Analytics tracking failed:', err);
      }
    }, 0);
  },

  getDashboardMetrics: async () => {
    const cacheKey = 'metrics:dashboard';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const result = await dbCircuitBreaker.execute(async () => {
        return await retryWithBackoff(async () => {
          const [ordersSnap, productsSnap, customersSnap] = await Promise.all([
            getDocs(collection(db, 'orders')),
            getDocs(query(collection(db, 'products'), where('status', '==', 'active'))),
            getDocs(query(collection(db, 'users'), where('role', '==', 'customer'))),
          ]);

          const orders = ordersSnap.docs.map((d) => d.data());
          return {
            totalOrders: ordersSnap.size,
            totalRevenue: orders.reduce((sum, o) => sum + ((o.total_amount as number) || 0), 0),
            activeProducts: productsSnap.size,
            totalCustomers: customersSnap.size,
          };
        });
      });
      cache.set(cacheKey, result, 600000);
      return result;
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      return null;
    }
  },
};

export default { productsService, ordersService, customersService, batchService, analyticsService };
