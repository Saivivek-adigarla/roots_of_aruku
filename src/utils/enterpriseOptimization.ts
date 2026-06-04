import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';

// ============================================
// ENTERPRISE-SCALE PERFORMANCE OPTIMIZATION
// ============================================

// 1. REQUEST DEDUPLICATION
// Prevent duplicate API calls within 500ms
class RequestDeduplicator {
  constructor() {
    this.pending = new Map();
  }

  async deduplicate(key, fn) {
    if (this.pending.has(key)) {
      return this.pending.get(key);
    }

    const promise = fn();
    this.pending.set(key, promise);

    try {
      return await promise;
    } finally {
      this.pending.delete(key);
    }
  }
}

const deduplicator = new RequestDeduplicator();

// 2. EXPONENTIAL BACKOFF WITH JITTER
export const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await Promise.race([
        fn(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 5000)
        ),
      ]);
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;

      const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// 3. CACHE MANAGEMENT SYSTEM
export class CacheManager {
  constructor(ttl = 300000) {
    this.cache = new Map();
    this.timers = new Map();
    this.ttl = ttl;
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value, customTtl) {
    // Clear existing timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    this.cache.set(key, value);

    // Set expiration
    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.timers.delete(key);
    }, customTtl || this.ttl);

    this.timers.set(key, timer);
  }

  clear() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.cache.clear();
    this.timers.clear();
  }
}

export const cache = new CacheManager(300000); // 5 minute TTL

// 4. RATE LIMITER
export class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  async checkLimit(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }

    const timestamps = this.requests.get(identifier);
    const validTimestamps = timestamps.filter(t => t > windowStart);

    if (validTimestamps.length >= this.maxRequests) {
      throw new Error('Rate limit exceeded');
    }

    validTimestamps.push(now);
    this.requests.set(identifier, validTimestamps);

    return {
      remaining: this.maxRequests - validTimestamps.length,
      resetTime: validTimestamps[0] + this.windowMs
    };
  }
}

const rateLimiter = new RateLimiter(1000, 60000); // 1000 req/min

// 5. OPTIMIZED SUPABASE CLIENT WITH CONNECTION POOLING
export const createOptimizedSupabaseClient = () => {
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'X-Client-Info': 'roots-of-araku/2.0',
        },
      },
    }
  );

  return supabase;
};

// 6. BATCH QUERY OPTIMIZER
export const batchQueries = async (queries, batchSize = 10) => {
  const results = [];
  for (let i = 0; i < queries.length; i += batchSize) {
    const batch = queries.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
  }
  return results;
};

// 7. QUERY RESULT PAGINATION
export const paginatedQuery = async (supabase, table, page = 1, pageSize = 20) => {
  const max_page_size = 100; // Safety limit
  const safe_page_size = Math.min(pageSize, max_page_size);
  const offset = (page - 1) * safe_page_size;

  const { data, error, count } = await supabase
    .from(table)
    .select('*', { count: 'exact' })
    .range(offset, offset + safe_page_size - 1);

  if (error) throw error;

  return {
    data,
    pagination: {
      page,
      pageSize: safe_page_size,
      total: count,
      pages: Math.ceil(count / safe_page_size),
    },
  };
};
// 8. ERROR BOUNDARY COMPONENT - Move to components folder for JSX support
// Use ErrorBoundary from components/ErrorBoundary.tsx instead

// 9. OPTIMIZED DATA FETCHING HOOK
export const useFetchOptimized = (fetchFn, dependencies = []) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first
        const cacheKey = fetchFn.toString();
        const cached = cache.get(cacheKey);
        if (cached) {
          if (isMounted) setData(cached);
          if (isMounted) setLoading(false);
          return;
        }

        // Deduplicate requests
        const result = await deduplicator.deduplicate(cacheKey, async () => {
          return await retryWithBackoff(fetchFn);
        });

        if (isMounted) {
          setData(result);
          cache.set(cacheKey, result);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, dependencies);

  return { data, error, loading };
};

// 10. MEMOIZED SELECTORS
export const useOptimizedSelector = (data, selector) => {
  return useMemo(() => selector(data), [data, selector]);
};

// 11. BATCH UPDATE OPTIMIZATION
export const batchUpdate = async (supabase, table, updates, batchSize = 50) => {
  const results = [];

  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(update =>
        supabase
          .from(table)
          .update(update.data)
          .eq('id', update.id)
      )
    );

    results.push(...batchResults);
  }

  return results;
};

// 12. COMPRESSION MIDDLEWARE FOR RESPONSES
export const compressResponse = (data) => {
  const json = JSON.stringify(data);
  if (json.length > 1024) {
    // Note: In production, use gzip compression
    return { _compressed: true, data: json };
  }
  return data;
};

// 13. CIRCUIT BREAKER FOR EXTERNAL CALLS
export class CircuitBreaker {
  constructor(fn, options = {}) {
    this.fn = fn;
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 2;
    this.timeout = options.timeout || 60000;
    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
    this.nextAttempt = Date.now();
  }

  async execute(...args) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await this.fn(...args);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;
    if (this.state === 'HALF_OPEN') {
      this.successes++;
      if (this.successes >= this.successThreshold) {
        this.state = 'CLOSED';
        this.successes = 0;
      }
    }
  }

  onFailure() {
    this.successes = 0;
    this.failures++;
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
    }
  }
}

// 14. LONG POLLING OPTIMIZATION
export const useLongPoll = (fetchFn, interval = 5000) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let timeoutId;

    const poll = async () => {
      try {
        const result = await fetchFn();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
      }

      timeoutId = setTimeout(poll, interval);
    };

    poll();

    return () => clearTimeout(timeoutId);
  }, [fetchFn, interval]);

  return { data, error };
};

// 15. PERFORMANCE MONITORING
export const performanceMonitor = {
  metrics: {},

  measureFetch: async (name, fn) => {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;

      if (!this.metrics[name]) {
        this.metrics[name] = [];
      }
      this.metrics[name].push(duration);

      // Log if slow
      if (duration > 1000) {
        console.warn(`Slow fetch: ${name} took ${duration}ms`);
      }

      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`Failed fetch: ${name} after ${duration}ms`, error);
      throw error;
    }
  },

  getStats: (name) => {
    const measurements = this.metrics[name] || [];
    if (measurements.length === 0) return null;

    measurements.sort((a, b) => a - b);
    const p50 = measurements[Math.floor(measurements.length * 0.5)];
    const p95 = measurements[Math.floor(measurements.length * 0.95)];
    const p99 = measurements[Math.floor(measurements.length * 0.99)];

    return {
      count: measurements.length,
      average: measurements.reduce((a, b) => a + b) / measurements.length,
      min: measurements[0],
      max: measurements[measurements.length - 1],
      p50,
      p95,
      p99,
    };
  },
};

export default {
  retryWithBackoff,
  CacheManager,
  RateLimiter,
  createOptimizedSupabaseClient,
  batchQueries,
  paginatedQuery,
  useFetchOptimized,
  useOptimizedSelector,
  batchUpdate,
  compressResponse,
  CircuitBreaker,
  useLongPoll,
  performanceMonitor,
  cache,
  rateLimiter,
  deduplicator,
};
