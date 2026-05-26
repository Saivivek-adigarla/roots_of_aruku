import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { User } from '../types';
import { upsertUserProfile, fetchUserProfile } from './database';

export const authService = {
  registerWithEmail: async (email: string, password: string, displayName: string): Promise<User> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user: User = {
      uid: userCredential.user.uid,
      name: displayName,
      email: userCredential.user.email || email,
      phone: '',
      isAdmin: false,
    };
    // Save to Firestore (existing)
    await setDoc(doc(db, 'users', userCredential.user.uid), user);
    // Also create in Supabase
    try {
      await upsertUserProfile(userCredential.user.uid, email, displayName, '', 'customer');
    } catch { /* non-blocking */ }
    return user;
  },

  loginWithEmail: async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const isAdminEmail = email === import.meta.env.VITE_ADMIN_EMAIL;

    // Try Supabase first for profile data
    try {
      const profile = await fetchUserProfile(userCredential.user.uid);
      if (profile) {
        const role = profile.role === 'admin' || isAdminEmail ? 'admin' : profile.role;
        return {
          uid: userCredential.user.uid,
          name: profile.name || userCredential.user.displayName || 'User',
          email: userCredential.user.email || email,
          phone: profile.phone || '',
          isAdmin: role === 'admin',
        };
      }
    } catch { /* fallback to Firestore */ }

    // Fallback to Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    if (userDoc.exists()) return userDoc.data() as User;
    return {
      uid: userCredential.user.uid,
      name: userCredential.user.displayName || 'User',
      email: userCredential.user.email || email,
      phone: '',
      isAdmin: isAdminEmail,
    };
  },

  resetPassword: async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  },

  logout: async (): Promise<void> => {
    await signOut(auth);
  },

  getCurrentUser: async (firebaseUser: FirebaseUser): Promise<User | null> => {
    // Try Supabase first
    try {
      const profile = await fetchUserProfile(firebaseUser.uid);
      if (profile) {
        return {
          uid: firebaseUser.uid,
          name: profile.name || firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          phone: profile.phone || '',
          isAdmin: profile.role === 'admin' || firebaseUser.email === import.meta.env.VITE_ADMIN_EMAIL,
        };
      }
    } catch { /* fallback */ }

    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      return userDoc.exists() ? (userDoc.data() as User) : null;
    } catch {
      return null;
    }
  },

  updateProfile: async (userId: string, updates: Partial<User>): Promise<void> => {
    await setDoc(doc(db, 'users', userId), updates, { merge: true });
    // Also update in Supabase
    try {
      const supabaseUpdates: { name?: string; phone?: string } = {};
      if (updates.name) supabaseUpdates.name = updates.name;
      if (updates.phone) supabaseUpdates.phone = updates.phone;
      if (Object.keys(supabaseUpdates).length > 0) {
        await upsertUserProfile(userId, updates.email || '', supabaseUpdates.name || '', supabaseUpdates.phone || '', updates.isAdmin ? 'admin' : 'customer');
      }
    } catch { /* non-blocking */ }
  },
};
