/**
 * Environment Configuration Validation
 * Validates required environment variables on app startup
 */

interface EnvironmentConfig {
  // Firebase Configuration
  VITE_FIREBASE_API_KEY: string;
  VITE_FIREBASE_AUTH_DOMAIN: string;
  VITE_FIREBASE_PROJECT_ID: string;
  VITE_FIREBASE_STORAGE_BUCKET: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  VITE_FIREBASE_APP_ID: string;

  // Supabase Configuration
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;

  // Payment Gateway
  VITE_RAZORPAY_KEY_ID: string;

  // Admin Configuration
  VITE_ADMIN_EMAIL: string;

  // Optional Configuration
  VITE_WHATSAPP_NUMBER?: string;
  VITE_CLAUDE_API_KEY?: string;
}

interface ValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
  config: Partial<EnvironmentConfig>;
}

const REQUIRED_VARS: (keyof EnvironmentConfig)[] = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
];

const OPTIONAL_VARS: (keyof EnvironmentConfig)[] = [
  'VITE_RAZORPAY_KEY_ID',
  'VITE_ADMIN_EMAIL',
  'VITE_WHATSAPP_NUMBER',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

/**
 * Validate environment variables
 */
export function validateEnvironment(): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];
  const config: Partial<EnvironmentConfig> = {};

  // Check required variables
  for (const key of REQUIRED_VARS) {
    const value = import.meta.env[key];
    if (!value || value === 'demo-key' || value === 'undefined') {
      missing.push(key);
    } else {
      config[key] = value;
    }
  }

  // Check optional variables
  for (const key of OPTIONAL_VARS) {
    const value = import.meta.env[key];
    if (value && value !== 'undefined') {
      config[key] = value;
    }
  }

  // Check for placeholder/demo values
  if (config.VITE_FIREBASE_API_KEY && config.VITE_FIREBASE_API_KEY.startsWith('demo')) {
    warnings.push('Firebase is using demo configuration - authentication will not work');
  }

  if (!config.VITE_RAZORPAY_KEY_ID) {
    warnings.push('Razorpay key not configured - online payments will not work');
  }

  if (!config.VITE_ADMIN_EMAIL) {
    warnings.push('Admin email not configured - admin panel will not be accessible');
  }

  // Validate URL formats
  if (config.VITE_SUPABASE_URL) {
    try {
      new URL(config.VITE_SUPABASE_URL);
    } catch {
      missing.push('VITE_SUPABASE_URL (invalid URL format)');
    }
  }

  if (config.VITE_FIREBASE_AUTH_DOMAIN) {
    if (!config.VITE_FIREBASE_AUTH_DOMAIN.includes('firebaseapp.com')) {
      warnings.push('FIREBASE_AUTH_DOMAIN may not be a valid Firebase domain');
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
    config,
  };
}

/**
 * Log environment status (development only)
 */
export function logEnvironmentStatus(): void {
  if (import.meta.env.DEV) {
    const result = validateEnvironment();

    if (result.valid) {
      console.log('%c Environment configured correctly ', 'background: #22c55e; color: white; padding: 4px 8px; border-radius: 4px;');
    } else {
      console.warn('%c Missing environment variables: ', 'background: #ef4444; color: white; padding: 4px 8px; border-radius: 4px;', result.missing.join(', '));
    }

    if (result.warnings.length > 0) {
      console.warn('%c Environment warnings: ', 'background: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px;', result.warnings.join('\n'));
    }
  }
}

/**
 * Get environment variable with type safety
 */
export function getEnv<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] | undefined {
  return import.meta.env[key] as EnvironmentConfig[K] | undefined;
}

/**
 * Check if running in development mode
 */
export const isDevelopment = import.meta.env.DEV;

/**
 * Check if running in production mode
 */
export const isProduction = import.meta.env.PROD;

/**
 * Check if running in SSR mode
 */
export const isSSR = typeof window === 'undefined';
