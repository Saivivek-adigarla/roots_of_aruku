import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyAbHM9vAP1ZgNX-O7NNCBF9pCibEzDzU9A',
  authDomain: 'roots-of-araku.firebaseapp.com',
  projectId: 'roots-of-araku',
  storageBucket: 'roots-of-araku.firebasestorage.app',
  messagingSenderId: '688694239799',
  appId: '1:688694239799:web:9bc837324456ea4ddcd5b2',
  measurementId: 'G-TSKQ1ZVS7Z',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

let analytics: ReturnType<typeof getAnalytics> | null = null;
try {
  analytics = getAnalytics(app);
} catch {
  // Analytics unavailable
}

export { analytics };
export default app;
