import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile { uid: string; name: string; phone: string; email: string; photoURL?: string; isAdmin: boolean; }

interface AuthStore { user: UserProfile | null; setUser: (user: UserProfile | null) => void; isAdmin: () => boolean; }

export const useAuthStore = create<AuthStore>()(
  persist((set, get) => ({ user: null, setUser: (user) => set({ user }), isAdmin: () => get().user?.isAdmin === true || get().user?.email === import.meta.env.VITE_ADMIN_EMAIL }), { name: 'roa-auth' })
);
