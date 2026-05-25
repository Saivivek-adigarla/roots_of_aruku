import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { secureStorage } from '../utils/security';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;

  // Auth actions
  setUser: (user: User | null) => void;
  isAdmin: () => boolean;
  logout: () => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
        });
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

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
        secureStorage.remove('session_timestamp');
      },

      clearSession: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
        secureStorage.clear();
      },
    }),
    {
      name: 'roa-auth',
      version: 1,
    }
  )
);
