/**
 * Security Utilities for Roots of Araku
 * Provides input validation, sanitization, and security helpers
 */

// HTML entity encoding map
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Sanitize HTML to prevent XSS attacks
 * Escapes all potentially dangerous HTML characters
 */
export function sanitizeHtml(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Sanitize input for display (removes HTML tags)
 */
export function stripHtml(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate Indian phone number (10 digits, optionally with +91)
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 12;
}

/**
 * Validate Indian pincode (6 digits)
 */
export function isValidPincode(pincode: string): boolean {
  if (!pincode || typeof pincode !== 'string') return false;
  return /^\d{6}$/.test(pincode);
}

/**
 * Validate name (letters, spaces, and basic punctuation only)
 */
export function isValidName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 100 && /^[a-zA-Z\s\-'.]+$/.test(trimmed);
}

/**
 * Validate password strength
 * Returns object with valid status and requirements
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
} {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (password && !/[A-Z]/.test(password)) {
    errors.push('Include at least one uppercase letter');
  }
  if (password && !/[a-z]/.test(password)) {
    errors.push('Include at least one lowercase letter');
  }
  if (password && !/[0-9]/.test(password)) {
    errors.push('Include at least one number');
  }

  // Calculate strength
  if (password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    if (score >= 5) strength = 'strong';
    else if (score >= 3) strength = 'medium';
  }

  return {
    valid: errors.length === 0,
    errors,
    strength,
  };
}

/**
 * Validate price (positive number, reasonable range)
 */
export function isValidPrice(price: number): boolean {
  return typeof price === 'number' && price >= 0 && price <= 1000000 && Number.isFinite(price);
}

/**
 * Validate quantity (positive integer)
 */
export function isValidQuantity(qty: number): boolean {
  return typeof qty === 'number' && Number.isInteger(qty) && qty > 0 && qty <= 100;
}

/**
 * Generate a secure random ID
 */
export function generateSecureId(prefix: string = 'ID'): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.getRandomValues(new Uint32Array(2))
    .reduce((acc, val) => acc + val.toString(36), '');
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
}

/**
 * Create a hash of a string (for non-sensitive data like addresses)
 * Uses SubtleCrypto API
 */
export async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Simple encryption for localStorage data (XOR-based for obsfuscation)
 * Note: This is NOT cryptographically secure, just adds a layer of obsfuscation
 */
const ENCRYPTION_KEY = 'ROA_SECURE_KEY_2024';

export function encryptData(data: string): string {
  let result = '';
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
    result += charCode.toString(16).padStart(4, '0');
  }
  return result;
}

export function decryptData(encrypted: string): string {
  let result = '';
  for (let i = 0; i < encrypted.length; i += 4) {
    const charCode = parseInt(encrypted.substr(i, 4), 16) ^ ENCRYPTION_KEY.charCodeAt((i / 4) % ENCRYPTION_KEY.length);
    result += String.fromCharCode(charCode);
  }
  return result;
}

/**
 * Rate limiting helper
 */
const rateLimits: Map<string, { count: number; resetAt: number }> = new Map();

export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const current = rateLimits.get(key);

  if (!current || now > current.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (current.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count++;
  return { allowed: true, remaining: maxRequests - current.count, resetAt: current.resetAt };
}

/**
 * Generate CSRF token
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate CSRF token (comparing stored vs provided)
 */
export function validateCsrfToken(provided: string | null, stored: string): boolean {
  if (!provided || !stored) return false;
  // Constant-time comparison to prevent timing attacks
  if (provided.length !== stored.length) return false;
  let result = 0;
  for (let i = 0; i < provided.length; i++) {
    result |= provided.charCodeAt(i) ^ stored.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Content Security Policy nonce generator
 */
export function generateCspNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

/**
 * Sanitize URL to prevent javascript: protocol attacks
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';

  const trimmed = url.trim();

  // Only allow http, https, mailto, tel protocols
  const safeProtocols = ['http://', 'https://', 'mailto:', 'tel:', '/', '#'];
  const isSafe = safeProtocols.some(p => trimmed.toLowerCase().startsWith(p));

  if (!isSafe) {
    return ''; // Reject potentially dangerous URLs
  }

  // Sanitize the URL
  try {
    const parsed = new URL(trimmed, window.location.origin);
    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * Validate and sanitize form input object
 */
export function sanitizeFormData<T extends Record<string, unknown>>(
  data: T,
  schema: Partial<Record<keyof T, 'string' | 'email' | 'phone' | 'pincode' | 'number' | 'boolean'>>
): { valid: boolean; data: T; errors: Partial<Record<keyof T, string>> } {
  const errors: Partial<Record<keyof T, string>> = {} as Partial<Record<keyof T, string>>;
  const sanitized = { ...data };

  for (const [key, type] of Object.entries(schema) as [keyof T, string][]) {
    const value = data[key];

    switch (type) {
      case 'string':
        if (typeof value === 'string') {
          sanitized[key] = sanitizeHtml(value) as T[keyof T];
        }
        break;
      case 'email':
        if (typeof value === 'string') {
          const email = value.toLowerCase().trim();
          if (!isValidEmail(email)) {
            errors[key] = 'Invalid email format';
          }
          sanitized[key] = email as T[keyof T];
        }
        break;
      case 'phone':
        if (typeof value === 'string') {
          const phone = value.replace(/\D/g, '');
          if (!isValidPhone(phone)) {
            errors[key] = 'Invalid phone number';
          }
          sanitized[key] = phone as T[keyof T];
        }
        break;
      case 'pincode':
        if (typeof value === 'string') {
          const pincode = value.trim();
          if (!isValidPincode(pincode)) {
            errors[key] = 'Invalid pincode';
          }
          sanitized[key] = pincode as T[keyof T];
        }
        break;
      case 'number':
        if (typeof value === 'string') {
          const num = parseFloat(value);
          if (isNaN(num)) {
            errors[key] = 'Invalid number';
          }
          sanitized[key] = num as T[keyof T];
        } else if (typeof value === 'number') {
          sanitized[key] = value;
        }
        break;
      case 'boolean':
        sanitized[key] = Boolean(value) as T[keyof T];
        break;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    data: sanitized,
    errors,
  };
}

/**
 * Debounce function to prevent rapid repeated calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Secure local storage wrapper
 */
export const secureStorage = {
  set(key: string, value: unknown): void {
    try {
      const data = JSON.stringify(value);
      const encrypted = encryptData(data);
      const checksum = data.length.toString(36);
      localStorage.setItem(`roa_${key}`, `${checksum}:${encrypted}`);
    } catch (e) {
      console.error('Failed to save to secure storage:', e);
    }
  },

  get<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(`roa_${key}`);
      if (!stored) return null;

      const [checksum, encrypted] = stored.split(':');
      const data = decryptData(encrypted);
      const expectedLength = parseInt(checksum, 36);

      // Verify data integrity
      if (data.length !== expectedLength) {
        console.warn('Data integrity check failed, clearing corrupt data');
        localStorage.removeItem(`roa_${key}`);
        return null;
      }

      return JSON.parse(data) as T;
    } catch (e) {
      console.error('Failed to read from secure storage:', e);
      return null;
    }
  },

  remove(key: string): void {
    localStorage.removeItem(`roa_${key}`);
  },

  clear(): void {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('roa_'));
    keys.forEach(k => localStorage.removeItem(k));
  },
};
