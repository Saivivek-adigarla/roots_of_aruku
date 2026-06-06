import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';

// 1. REQUEST DEDUPLICATION
class RequestDeduplicator {
  private pending: Map<string, Promise<unknown>> = new Map();

  async deduplicate<T>(key: string, fn: () => Promise<T>): Promise<T> {
    if (this.pending.has(key)) {
      return this.pending.get(key) as Promise<T>;
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
export const retryWithBackoff = async <T>(fn: () => Promise<T>, maxRetries: number = 3): Promise<T> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 5000)
        ),
      ]);
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Unreachable');
};

// 3. CACHE MANAGEMENT SYSTEM
export class CacheManager {
  private cache: Map<string, unknown> = new Map();
  private timers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private ttl: number;

  constructor(ttl: number = 300000) {
    this.ttl = ttl;
  }

  get<T>(key: string): T | undefined {
    return this.cache.get(key) as T | undefined;
  }

  set(key: string, value: unknown, customTtl?: number): void {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    this.cache.set(key, value);

    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.timers.delete(key);
    }, customTtl || this.ttl);

    this.timers.set(key, timer);
  }

  clear(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.cache.clear();
    this.timers.clear();
  }
}

export const cache = new CacheManager(300000);

// 4. RATE LIMITER
export class RateLimiter {
  private maxRequests: number;
  private windowMs: number;
  private requests: Map<string, number[]>;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  async checkLimit(identifier: string): Promise<{ remaining: number; resetTime: number }> {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }

    const timestamps = this.requests.get(identifier)!;
    const validTimestamps = timestamps.filter(t => t > windowStart);

    if (validTimestamps.length >= this.maxRequests) {
      throw new Error('Rate limit exceeded');
    }

    validTimestamps.push(now);
    this.requests.set(identifier, validTimestamps);

    return {
      remaining: this.maxRequests - validTimestamps.length,
      resetTime: validTimestamps[0] + this.windowMs,
    };
  }
}

const rateLimiter = new RateLimiter(1000, 60000);

// 5. OPTIMIZED SUPABASE CLIENT
export const createOptimizedSupabaseClient = () => {
  return createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      auth: { persistSession: true, autoRefreshToken: true },
      db: { schema: 'public' },
      global: { headers: { 'X-Client-Info': 'roots-of-araku/2.0' } },
    }
  );
};

// 6. BATCH QUERY OPTIMIZER
export const batchQueries = async <T>(queries: Promise<T>[], batchSize: number = 10): Promise<T[]> => {
  const results: T[] = [];
  for (let i = 0; i < queries.length; i += batchSize) {
    const batch = queries.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
  }
  return results;
};

// 7. QUERY RESULT PAGINATION
export const paginatedQuery = async (
  supabase: ReturnType<typeof createClient>,
  table: string,
  page: number = 1,
  pageSize: number = 20
) => {
  const safePageSize = Math.min(pageSize, 100);
  const offset = (page - 1) * safePageSize;

  const { data, error, count } = await supabase
    .from(table)
    .select('*', { count: 'exact' })
    .range(offset, offset + safePageSize - 1);

  if (error) throw error;

  return {
    data,
    pagination: {
      page,
      pageSize: safePageSize,
      total: count,
      pages: Math.ceil((count || 0) / safePageSize),
    },
  };
};

// 9. OPTIMIZED DATA FETCHING HOOK
export const useFetchOptimized = <T>(fetchFn: () => Promise<T>, deps?: unknown[]) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const dependencies = deps || [];

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const cacheKey = fetchFn.toString();
        const cached = cache.get<T>(cacheKey);
        if (cached) {
          if (isMounted) setData(cached);
          if (isMounted) setLoading(false);
          return;
        }

        const result = await deduplicator.deduplicate(cacheKey, async () => {
          return await retryWithBackoff(fetchFn);
        });

        if (isMounted) {
          setData(result);
          cache.set(cacheKey, result);
        }
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, [dependencies]);

  return { data, error, loading };
};

// 10. MEMOIZED SELECTORS
export const useOptimizedSelector = <T, R>(data: T, selector: (d: T) => R): R => {
  return useMemo(() => selector(data), [data, selector]);
};

// 11. BATCH UPDATE OPTIMIZATION
export const batchUpdate = async (
  supabase: ReturnType<typeof createClient>,
  table: string,
  updates: { id: string; data: Record<string, unknown> }[],
  batchSize: number = 50
) => {
  const results = [];

  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(update =>
        supabase.from(table).update(update.data).eq('id', update.id)
      )
    );

    results.push(...batchResults);
  }

  return results;
};

// 12. COMPRESSION MIDDLEWARE
export const compressResponse = (data: unknown) => {
  const json = JSON.stringify(data);
  if (json.length > 1024) {
    return { _compressed: true, data: json };
  }
  return data;
};

// 13. CIRCUIT BREAKER
export class CircuitBreaker {
  private failureThreshold: number;
  private successThreshold: number;
  private timeout: number;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  private failures: number;
  private successes: number;
  private nextAttempt: number;

  constructor(options: { failureThreshold?: number; successThreshold?: number; timeout?: number } = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 2;
    this.timeout = options.timeout || 60000;
    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
    this.nextAttempt = Date.now();
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    if (this.state === 'HALF_OPEN') {
      this.successes++;
      if (this.successes >= this.successThreshold) {
        this.state = 'CLOSED';
        this.successes = 0;
      }
    }
  }

  private onFailure(): void {
    this.successes = 0;
    this.failures++;
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
    }
  }
}

// 14. LONG POLLING
export const useLongPoll = <T>(fetchFn: () => Promise<T>, interval: number = 5000) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const result = await fetchFn();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
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
  metrics: {} as Record<string, number[]>,

  measureFetch: async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;

      if (!performanceMonitor.metrics[name]) {
        performanceMonitor.metrics[name] = [];
      }
      performanceMonitor.metrics[name].push(duration);

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

  getStats: (name: string) => {
    const measurements = performanceMonitor.metrics[name] || [];
    if (measurements.length === 0) return null;

    measurements.sort((a, b) => a - b);
    const p50 = measurements[Math.floor(measurements.length * 0.5)];
    const p95 = measurements[Math.floor(measurements.length * 0.95)];
    const p99 = measurements[Math.floor(measurements.length * 0.99)];

    return {
      count: measurements.length,
      average: measurements.reduce((a, b) => a + b, 0) / measurements.length,
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
