import { supabase } from '../lib/supabase';
import { User } from '../types';
import { upsertUserProfile, fetchUserProfile } from './database';

export const authService = {
  // Email + Password Login
  loginWithEmail: async (email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.toLowerCase().trim(), password });
    if (error) throw error;

    const profile = await fetchUserProfile(data.user.id);
    const isAdminEmail = email === import.meta.env.VITE_ADMIN_EMAIL;

    const user: User = {
      uid: data.user.id,
      name: profile?.name || data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
      email: data.user.email || email,
      phone: profile?.phone || data.user.user_metadata?.phone || '',
      isAdmin: profile?.role === 'admin' || isAdminEmail,
    };

    return user;
  },

  // Email + Password Signup
  registerWithEmail: async (email: string, password: string, displayName: string, phone?: string): Promise<User> => {
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: { name: displayName, phone: phone || '' },
      },
    });
    if (error) throw error;

    await upsertUserProfile(data.user.id, email, displayName, phone || '', 'customer');

    return {
      uid: data.user.id,
      name: displayName,
      email: data.user.email || email,
      phone: phone || '',
      isAdmin: false,
    };
  },

  // Phone OTP Login
  loginWithPhone: async (phone: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithOtp({
      phone: `+91${phone.replace(/\D/g, '').slice(-10)}`,
    });
    if (error) throw error;
  },

  // Verify Phone OTP
  verifyPhoneOtp: async (phone: string, otp: string): Promise<User> => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: `+91${phone.replace(/\D/g, '').slice(-10)}`,
      token: otp,
      type: 'sms',
    });
    if (error) throw error;

    const profile = await fetchUserProfile(data.user.id);

    const user: User = {
      uid: data.user.id,
      name: profile?.name || data.user.user_metadata?.name || 'User',
      email: profile?.email || data.user.email || '',
      phone: phone.replace(/\D/g, '').slice(-10),
      isAdmin: profile?.role === 'admin',
    };

    // Ensure profile exists
    if (!profile) {
      await upsertUserProfile(data.user.id, user.email, user.name, user.phone, 'customer');
    }

    return user;
  },

  // Google Sign-In
  loginWithGoogle: async (): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;
  },

  // Logout
  logout: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current authenticated user
  getCurrentUser: async (): Promise<User | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const firebaseUser = session.user;
    const profile = await fetchUserProfile(firebaseUser.id);
    const isAdminEmail = firebaseUser.email === import.meta.env.VITE_ADMIN_EMAIL;

    return {
      uid: firebaseUser.id,
      name: profile?.name || firebaseUser.user_metadata?.name || firebaseUser.email?.split('@')[0] || 'User',
      email: firebaseUser.email || '',
      phone: profile?.phone || firebaseUser.user_metadata?.phone || firebaseUser.phone || '',
      isAdmin: profile?.role === 'admin' || isAdminEmail,
    };
  },

  // Update profile
  updateProfile: async (userId: string, updates: Partial<User>): Promise<void> => {
    const dbUpdates: { name?: string; phone?: string; email?: string; role?: string } = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.phone) dbUpdates.phone = updates.phone;
    if (updates.email) dbUpdates.email = updates.email;
    if (updates.isAdmin !== undefined) dbUpdates.role = updates.isAdmin ? 'admin' : 'customer';

    await upsertUserProfile(userId, updates.email || '', dbUpdates.name || '', dbUpdates.phone || '', dbUpdates.role || 'customer');
  },

  // Password reset
  resetPassword: async (email: string): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
      redirectTo: `${window.location.origin}/forgot-password`,
    });
    if (error) throw error;
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (user: User | null) => void) => {
    supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          const isAdminEmail = session.user.email === import.meta.env.VITE_ADMIN_EMAIL;
          callback({
            uid: session.user.id,
            name: profile?.name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            phone: profile?.phone || session.user.user_metadata?.phone || session.user.phone || '',
            isAdmin: profile?.role === 'admin' || isAdminEmail,
          });
        } else {
          callback(null);
        }
      })();
    });
  },
};
