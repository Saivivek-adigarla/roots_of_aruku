import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { authService, fetchUserProfile } from '../services/authService';
import { secureStorage } from '../utils/security';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase/config';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  initialized: boolean;
  loading: boolean;

  setUser: (user: User | null) => void;
  isAdmin: () => boolean;
  logout: () => Promise<void>;
  clearSession: () => void;
  initialize: () => void;
}

const SESSION_TIMEOUT = 7 * 24 * 60 * 60 * 1000; // 7 days

const mapFirebaseUser = async (fbUser: FirebaseUser): Promise<User> => {
  const profile = await fetchUserProfile(fbUser.uid);
  const isAdminEmail = fbUser.email === import.meta.env.VITE_ADMIN_EMAIL;

  return {
    uid: fbUser.uid,
    name: profile?.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
    email: fbUser.email || '',
    phone: profile?.phone || fbUser.phoneNumber?.replace('+91', '') || '',
    isAdmin: profile?.role === 'admin' || isAdminEmail,
  };
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      initialized: false,
      loading: false,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user, loading: false });
        if (user) secureStorage.set('session_timestamp', Date.now());
        else secureStorage.remove('session_timestamp');
      },

      isAdmin: () => {
        const user = get().user;
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
        return user?.isAdmin === true || user?.email === adminEmail;
      },

      logout: async () => {
        try { await authService.logout(); } catch { /* already signed out */ }
        set({ user: null, isAuthenticated: false, loading: false });
        secureStorage.remove('session_timestamp');
      },

      clearSession: () => {
        set({ user: null, isAuthenticated: false, loading: false });
        secureStorage.clear();
      },

      initialize: () => {
        // Prevent double initialization
        if (get().initialized || get().loading) return;
        set({ loading: true });

        // Check session timeout
        const timestamp = secureStorage.get('session_timestamp');
        if (timestamp && Date.now() - Number(timestamp) > SESSION_TIMEOUT) {
          get().clearSession();
          set({ initialized: true, loading: false });
          return;
        }

        // Listen for Firebase auth state changes - this is the single source of truth
        onAuthStateChanged(auth, async (fbUser) => {
          if (fbUser) {
            try {
              const user = await mapFirebaseUser(fbUser);
              set({ user, isAuthenticated: true, initialized: true, loading: false });
              secureStorage.set('session_timestamp', Date.now());
            } catch {
              set({ user: null, isAuthenticated: false, initialized: true, loading: false });
            }
          } else {
            set({ user: null, isAuthenticated: false, initialized: true, loading: false });
            secureStorage.remove('session_timestamp');
          }
        });
      },
    }),
    {
      name: 'roa-auth',
      version: 3,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
