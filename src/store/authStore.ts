import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { secureStorage } from '../utils/security';

export interface UserProfile {
  uid: string;
  name: string;
  phone: string;
  email: string;
  photoURL?: string;
  isAdmin: boolean;
}

interface AuthStore {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  isAdmin: () => boolean;
  clearSession: () => void;
}

// Custom storage adapter using our secure storage
const secureStorageAdapter = {
  getItem: (name: string): string | null => {
    const value = secureStorage.get<UserProfile>(name);
    return value ? JSON.stringify({ state: { user: value }, version: 0 }) : null;
  },
  setItem: (name: string, value: string): void => {
    try {
      const parsed = JSON.parse(value);
      if (parsed?.state?.user) {
        secureStorage.set(name, parsed.state.user);
      }
    } catch {
      // Ignore parse errors
    }
  },
  removeItem: (name: string): void => {
    secureStorage.remove(name);
  },
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => {
        set({ user });
        if (user) {
          secureStorage.set('session_timestamp', Date.now());
        } else {
          secureStorage.remove('session_timestamp');
        }
      },
      isAdmin: () => {
        const user = get().user;
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
        return user?.isAdmin === true || user?.email === adminEmail;
      },
      clearSession: () => {
        set({ user: null });
        secureStorage.remove('session_timestamp');
        secureStorage.remove('roa-auth');
      },
    }),
    {
      name: 'roa-auth',
      storage: createJSONStorage(() => secureStorageAdapter),
      partialize: (state) => ({ user: state.user }),
    }
  )
);
