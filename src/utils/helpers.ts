import { sanitizeHtml, generateSecureId } from './security';

/**
 * Calculate discount percentage
 */
export const discountPct = (mrp: number, offer: number): number => {
  if (mrp <= 0 || offer < 0 || offer > mrp) return 0;
  return Math.round(((mrp - offer) / mrp) * 100);
};

/**
 * Format currency in Indian notation
 */
export const formatCurrency = (amount: number): string => {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
};

/**
 * Generate a unique order ID
 * Uses secure ID generation with timestamp and random components
 */
export const generateOrderId = (): string => {
  return generateSecureId('ROA');
};

/**
 * Free delivery threshold
 */
export const DELIVERY_FREE_THRESHOLD = 499;

/**
 * Standard delivery charge
 */
export const DELIVERY_CHARGE = 49;

/**
 * Calculate delivery charge based on order total
 */
export const getDeliveryCharge = (total: number): number => {
  if (typeof total !== 'number' || !Number.isFinite(total) || total < 0) return DELIVERY_CHARGE;
  return total >= DELIVERY_FREE_THRESHOLD ? 0 : DELIVERY_CHARGE;
};

/**
 * Product categories with emoji
 */
export const CATEGORIES = [
  { value: 'coffee', label: 'Coffee', emoji: '☕' },
  { value: 'turmeric', label: 'Turmeric', emoji: '🌿' },
  { value: 'honey', label: 'Honey', emoji: '🍯' },
];

/**
 * Validate category value
 */
export const isValidCategory = (category: string): boolean => {
  return CATEGORIES.some((c) => c.value === category);
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (typeof text !== 'string') return '';
  const sanitized = sanitizeHtml(text);
  if (sanitized.length <= maxLength) return sanitized;
  return sanitized.slice(0, maxLength - 3) + '...';
};

/**
 * Format date for display
 */
export const formatDate = (date: string | Date): string => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid date';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
};

/**
 * Format time for display
 */
export const formatTime = (date: string | Date): string => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

/**
 * Delay helper for async operations
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Parse JSON safely
 */
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
};

/**
 * Validate and sanitize URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

/**
 * Extract error message from error object
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
};
