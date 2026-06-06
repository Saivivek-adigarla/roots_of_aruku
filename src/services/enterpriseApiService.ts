import { retryWithBackoff, cache, rateLimiter, CircuitBreaker } from '../utils/enterpriseOptimization';
import { supabase } from '../lib/supabase';

// ============================================
// ENTERPRISE API SERVICE LAYER
// ============================================

// Circuit breaker for database operations
const dbCircuitBreaker = new CircuitBreaker(
  { failureThreshold: 5, timeout: 30000 }
);

// 1. OPTIMIZED PRODUCT FETCHING
export const productsService = {
  // Cached product list
  getProductsByCategory: async (category: string, page: number = 1, pageSize: number = 20, userId: string | null = null) => {
    // Rate limit check
    if (userId) {
      await rateLimiter.checkLimit(`products:${userId}`);
    }

    const cacheKey = `products:${category}:${page}:${pageSize}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const result = await dbCircuitBreaker.execute(async () => {
        return await retryWithBackoff(async () => {
          // Use connection pooling and pagination
          const { data, error, count } = await supabase
            .from('products')
            .select('id, name, offer_price, mrp, category, images, emoji, stock_quantity', {
              count: 'exact',
            })
            .eq('category', category)
            .eq('status', 'active')
            .range((page - 1) * pageSize, page * pageSize - 1)
            .order('created_at', { ascending: false });

          if (error) throw error;

          return {
            data: data || [],
            pagination: {
              page,
              pageSize,
              total: count,
              pages: Math.ceil((count || 0) / pageSize),
            },
          };
        });
      });

      // Cache for 1 hour
      cache.set(cacheKey, result, 3600000);
      return result;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      // Return empty instead of crashing
      return { data: [], pagination: { page, pageSize, total: 0, pages: 0 } };
    }
  },

  // Search products with full-text search
  searchProducts: async (query: string, page: number = 1, pageSize: number = 20, userId: string | null = null) => {
    if (userId) {
      await rateLimiter.checkLimit(`search:${userId}`);
    }

    const cacheKey = `search:${query}:${page}:${pageSize}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const result = await dbCircuitBreaker.execute(async () => {
        return await retryWithBackoff(async () => {
          const { data, error } = await supabase
            .rpc('search_products', {
              search_query: query,
              page_num: page,
              page_size: pageSize,
            });

          if (error) throw error;

          return {
            data: data || [],
            page,
            pageSize,
          };
        });
      });

      cache.set(cacheKey, result, 1800000); // 30 minutes
      return result;
    } catch (error) {
      console.error('Search failed:', error);
      return { data: [], page, pageSize };
    }
  },

  // Get single product with reviews
  getProductDetail: async (productId: string, userId: string | null = null) => {
    if (userId) {
      await rateLimiter.checkLimit(`product:${userId}`);
    }

    const cacheKey = `product:${productId}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const result = await dbCircuitBreaker.execute(async () => {
        return await retryWithBackoff(async () => {
          // Batch fetch product and reviews
          const [productRes, reviewsRes] = await Promise.all([
            supabase.from('products').select('*').eq('id', productId).single(),
            supabase
              .from('reviews')
              .select('*')
              .eq('product_id', productId)
              .order('created_at', { ascending: false })
              .limit(50),
          ]);

          if (productRes.error) throw productRes.error;

          return {
            product: productRes.data,
            reviews: reviewsRes.data || [],
          };
        });
      });

      cache.set(cacheKey, result, 1800000); // 30 minutes
      return result;
    } catch (error) {
      console.error('Failed to fetch product detail:', error);
      return null;
    }
  },
};

// 2. OPTIMIZED ORDER SERVICE
export const ordersService = {
  // Create order with transaction handling
  createOrder: async (userId: string, orderData: { items: { product_id: string; quantity: number }[]; [key: string]: unknown }) => {
    await rateLimiter.checkLimit(`order:${userId}`);

    try {
      return await dbCircuitBreaker.execute(async () => {
        return await retryWithBackoff(async () => {
          // Validate inventory first
          const items = orderData.items;
          const stockChecks = await Promise.all(
            items.map((item: { product_id: string; quantity: number }) =>
              supabase
                .from('products')
                .select('stock_quantity')
                .eq('id', item.product_id)
                .single()
            )
          );

          // Check if all items are in stock
          for (let i = 0; i < stockChecks.length; i++) {
            if (stockChecks[i].error) throw stockChecks[i].error;
            if ((stockChecks[i].data as { stock_quantity: number }).stock_quantity < items[i].quantity) {
              throw new Error(`Insufficient stock for item ${i + 1}`);
            }
          }

          // Create order
          const { data, error } = await supabase
            .from('orders')
            .insert([
              {
                user_id: userId,
                order_number: `ROA-${Date.now()}`,
                ...orderData,
              },
            ])
            .select();

          if (error) throw error;

          // Invalidate user's order cache
          cache.clear();

          return (data as Record<string, unknown>[])[0];
        });
      });
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  },

  // Get user orders with pagination
  getUserOrders: async (userId: string, page: number = 1, pageSize: number = 20) => {
    await rateLimiter.checkLimit(`orders:${userId}`);

    const cacheKey = `orders:${userId}:${page}:${pageSize}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const result = await dbCircuitBreaker.execute(async () => {
        return await retryWithBackoff(async () => {
          const { data, error, count } = await supabase
            .from('orders')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range((page - 1) * pageSize, page * pageSize - 1);

          if (error) throw error;

          return {
            data: data || [],
            pagination: {
              page,
              pageSize,
              total: count,
              pages: Math.ceil((count || 0) / pageSize),
            },
          };
        });
      });

      cache.set(cacheKey, result, 600000); // 10 minutes
      return result;
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      return { data: [], pagination: { page, pageSize, total: 0, pages: 0 } };
    }
  },

  // Track order status (shorter cache)
  getOrderStatus: async (orderId: string, userId: string | null = null) => {
    if (userId) {
      await rateLimiter.checkLimit(`track:${userId}`);
    }

    const cacheKey = `order:status:${orderId}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const result = await dbCircuitBreaker.execute(async () => {
        return await retryWithBackoff(async () => {
          const { data, error } = await supabase
            .from('orders')
            .select('id, status, updated_at')
            .eq('id', orderId)
            .single();

          if (error) throw error;
          return data;
        });
      });

      cache.set(cacheKey, result, 300000); // 5 minutes (short for real-time updates)
      return result;
    } catch (error) {
      console.error('Failed to fetch order status:', error);
      return null;
    }
  },
};

// 3. OPTIMIZED CUSTOMER SERVICE
export const customersService = {
  // Get customer profile
  getProfile: async (userId: string) => {
    const cacheKey = `profile:${userId}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const result = await dbCircuitBreaker.execute(async () => {
        return await retryWithBackoff(async () => {
          const { data, error } = await supabase
            .from('users')
            .select('id, name, email, phone, created_at')
            .eq('id', userId)
            .single();

          if (error) throw error;
          return data;
        });
      });

      cache.set(cacheKey, result, 3600000); // 1 hour
      return result;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      return null;
    }
  },

  // Get customer addresses
  getAddresses: async (userId: string) => {
    const cacheKey = `addresses:${userId}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const result = await dbCircuitBreaker.execute(async () => {
        return await retryWithBackoff(async () => {
          const { data, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (error) throw error;
          return data || [];
        });
      });

      cache.set(cacheKey, result, 1800000); // 30 minutes
      return result;
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      return [];
    }
  },
};

// 4. BATCH OPERATIONS FOR ADMIN
export const batchService = {
  // Update multiple products
  updateProducts: async (updates: { id: string; data: Record<string, unknown> }[]) => {
    const batchSize = 50;
    const results: { id: string; data: Record<string, unknown> }[] = [];

    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);

      const batchResults = await Promise.all(
        batch.map((update: { id: string; data: Record<string, unknown> }) =>
          supabase
            .from('products')
            .update(update.data)
            .eq('id', update.id)
        )
      );

      results.push(...batchResults);
    }

    // Invalidate product cache
    cache.clear();

    return results;
  },

  // Bulk create orders (admin)
  createBulkOrders: async (orders: Record<string, unknown>[]) => {
    try {
      return await dbCircuitBreaker.execute(async () => {
        return await retryWithBackoff(async () => {
          const { data, error } = await supabase
            .from('orders')
            .insert(orders)
            .select();

          if (error) throw error;
          return data;
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
  // Track user action (non-blocking)
  trackAction: async (userId: string, action: string, data: Record<string, unknown>) => {
    // Fire and forget - don't block user experience
    setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('analytics')
          .insert([
            {
              user_id: userId,
              action,
              data,
              timestamp: new Date(),
            },
          ]);
        if (error) console.error('Analytics tracking failed:', error);
      } catch (err) {
        console.error('Analytics tracking failed:', err);
      }
    }, 0);
  },

  // Get dashboard metrics (cached)
  getDashboardMetrics: async () => {
    const cacheKey = 'metrics:dashboard';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const result = await dbCircuitBreaker.execute(async () => {
        return await retryWithBackoff(async () => {
          const [ordersRes, productsRes, customersRes] = await Promise.all([
            supabase.from('orders').select('id, total_amount', { count: 'exact' }),
            supabase.from('products').select('id, stock_quantity', { count: 'exact' }).eq('status', 'active'),
            supabase.from('users').select('id', { count: 'exact' }).eq('role', 'customer'),
          ]);

          return {
            totalOrders: ordersRes.count,
            totalRevenue: ordersRes.data?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
            activeProducts: productsRes.count,
            totalCustomers: customersRes.count,
          };
        });
      });

      cache.set(cacheKey, result, 600000); // 10 minutes
      return result;
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      return null;
    }
  },
};

export default {
  productsService,
  ordersService,
  customersService,
  batchService,
  analyticsService,
};
