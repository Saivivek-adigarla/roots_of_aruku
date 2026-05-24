import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { validateEnvironment, logEnvironmentStatus } from './utils/env';

// Validate environment before app loads
const envStatus = validateEnvironment();
logEnvironmentStatus();

// In development, show warnings for missing config
if (!envStatus.valid && import.meta.env.DEV) {
  console.warn(
    'Some features may not work correctly due to missing environment variables.\n' +
    'Please check your .env file and ensure all required variables are set.\n' +
    'Missing: ' + envStatus.missing.join(', ')
  );
}

// Global error handler for uncaught errors
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Unhandled error:', { message, source, lineno, colno, error });
  // In production, you could send this to an error tracking service
  return false;
};

// Handle unhandled promise rejections
window.onunhandledrejection = (event) => {
  console.error('Unhandled promise rejection:', event.reason);
};

// Check for required browser features
const checkBrowserSupport = () => {
  const features: string[] = [];

  if (!window.crypto?.getRandomValues) {
    features.push('crypto.getRandomValues');
  }

  if (!window.fetch) {
    features.push('fetch API');
  }

  if (!window.Promise) {
    features.push('Promises');
  }

  if (!window.localStorage) {
    features.push('localStorage');
  }

  if (features.length > 0) {
    console.warn('Your browser may not support some required features:', features.join(', '));
    // Could show a user notification here
  }
};

checkBrowserSupport();

// Render app
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
