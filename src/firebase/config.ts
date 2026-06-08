import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAbHM9vAP1ZgNX-O7NNCBF9pCibEzDzU9A',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'roots-of-araku.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'roots-of-araku',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'roots-of-araku.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '688694239799',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:688694239799:web:9bc837324456ea4ddcd5b2',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-TSKQ1ZVS7Z',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

let analytics: ReturnType<typeof getAnalytics> | null = null;
try {
  analytics = getAnalytics(app);
} catch {
  // Analytics unavailable in dev
}

export { analytics };
export default app;
