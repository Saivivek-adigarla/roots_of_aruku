import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Auth actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  
  // Session persistence
  restoreSession: () => Promise<void>;
  clearSession: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          error: null,
        });
      },
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
        // Clear any auth tokens
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
      },
      
      restoreSession: async () => {
        try {
          const token = localStorage.getItem('authToken');
          if (token) {
            set({ isLoading: true });
            // Verify token with backend
            set({ isLoading: false });
          }
        } catch (error) {
          set({ error: 'Session restore failed', isLoading: false });
        }
      },
      
      clearSession: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        set({
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-store',
      version: 1,
    }
  )
);