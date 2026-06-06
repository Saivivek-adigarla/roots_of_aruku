import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { secureStorage } from '../utils/security';
import { authService } from '../services/authService';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  initialized: boolean;
  isInitializing: boolean;

  setUser: (user: User | null) => void;
  isAdmin: () => boolean;
  logout: () => Promise<void>;
  clearSession: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      initialized: false,
      isInitializing: false,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
        if (user) secureStorage.set('session_timestamp', Date.now());
        else secureStorage.remove('session_timestamp');
      },

      isAdmin: () => {
        const user = get().user;
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
        return user?.isAdmin === true || user?.email === adminEmail;
      },

      logout: async () => {
        try { 
          await authService.logout(); 
        } catch { 
          /* already signed out */ 
        }
        set({ user: null, isAuthenticated: false });
        secureStorage.remove('session_timestamp');
      },

      clearSession: () => {
        set({ user: null, isAuthenticated: false });
        secureStorage.clear();
      },

      initialize: async () => {
        // Prevent duplicate initializations
        if (get().initialized || get().isInitializing) return;
        
        set({ isInitializing: true });
        try {
          const user = await authService.getCurrentUser();
          set({ user, isAuthenticated: !!user, initialized: true, isInitializing: false });
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ user: null, isAuthenticated: false, initialized: true, isInitializing: false });
        }
      },
    }),
    {
      name: 'roa-auth',
      version: 2,
    }
  )
);
