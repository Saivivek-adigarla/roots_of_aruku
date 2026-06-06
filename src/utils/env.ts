/**
 * Environment Configuration Validation
 */

interface EnvironmentConfig {
  VITE_ADMIN_EMAIL: string;
  VITE_WHATSAPP_NUMBER?: string;
}

interface ValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
  config: Partial<EnvironmentConfig>;
}

const REQUIRED_VARS: (keyof EnvironmentConfig)[] = [];

const OPTIONAL_VARS: (keyof EnvironmentConfig)[] = [
  'VITE_ADMIN_EMAIL',
  'VITE_WHATSAPP_NUMBER',
];

export function validateEnvironment(): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];
  const config: Partial<EnvironmentConfig> = {};

  for (const key of REQUIRED_VARS) {
    const value = import.meta.env[key];
    if (!value || value === 'demo-key' || value === 'undefined') {
      missing.push(key);
    } else {
      config[key] = value;
    }
  }

  for (const key of OPTIONAL_VARS) {
    const value = import.meta.env[key];
    if (value && value !== 'undefined') {
      config[key] = value;
    }
  }

  if (!config.VITE_ADMIN_EMAIL) {
    warnings.push('Admin email not configured - admin panel will not be accessible');
  }

  return { valid: missing.length === 0, missing, warnings, config };
}

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

export function getEnv<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] | undefined {
  return import.meta.env[key] as EnvironmentConfig[K] | undefined;
}

export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
export const isSSR = typeof window === 'undefined';
