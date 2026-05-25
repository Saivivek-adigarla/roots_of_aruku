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
    await setDoc(doc(db, 'users', userCredential.user.uid), user);
    return user;
  },

  loginWithEmail: async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    if (userDoc.exists()) return userDoc.data() as User;
    return {
      uid: userCredential.user.uid,
      name: userCredential.user.displayName || 'User',
      email: userCredential.user.email || email,
      phone: '',
      isAdmin: email === import.meta.env.VITE_ADMIN_EMAIL,
    };
  },

  resetPassword: async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  },

  logout: async (): Promise<void> => {
    await signOut(auth);
  },

  getCurrentUser: async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      return userDoc.exists() ? (userDoc.data() as User) : null;
    } catch {
      return null;
    }
  },

  updateProfile: async (userId: string, updates: Partial<User>): Promise<void> => {
    await setDoc(doc(db, 'users', userId), updates, { merge: true });
  },
};
