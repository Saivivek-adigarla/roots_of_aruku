import { initializeApp } from 'firebase/app';
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

let analytics: ReturnType<typeof getAnalytics> | null = null;
try {
  analytics = getAnalytics(app);
} catch {
  // Analytics unavailable (e.g. SSR or ad blocker)
}

export { analytics };
export default app;
