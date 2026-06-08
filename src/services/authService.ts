import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { User } from '../types';

const googleProvider = new GoogleAuthProvider();
let confirmationResult: ConfirmationResult | null = null;

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

export const authService = {
  // Email + Password Login
  loginWithEmail: async (email: string, password: string): Promise<User> => {
    const credential = await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
    return mapFirebaseUser(credential.user);
  },

  // Email + Password Signup
  registerWithEmail: async (email: string, password: string, displayName: string, phone?: string): Promise<User> => {
    const credential = await createUserWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
    await upsertUserProfile(credential.user.uid, email, displayName, phone || '', 'customer');
    return mapFirebaseUser(credential.user);
  },

  // Google Login
  loginWithGoogle: async (): Promise<User> => {
    const result = await signInWithPopup(auth, googleProvider);
    await upsertUserProfile(result.user.uid, result.user.email || '', result.user.displayName || 'User', result.user.phoneNumber?.replace('+91', '') || '', 'customer');
    return mapFirebaseUser(result.user);
  },

  // Phone OTP Login - Step 1: Send OTP
  loginWithPhone: async (phone: string): Promise<void> => {
    try {
      const appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
      });
      confirmationResult = await signInWithPhoneNumber(auth, `+91${phone}`, appVerifier);
    } catch (error: any) {
      confirmationResult = null;
      throw new Error(error.message || 'Failed to send OTP');
    }
  },

  // Phone OTP Login - Step 2: Verify OTP
  verifyPhoneOtp: async (phone: string, otp: string): Promise<User> => {
    if (!confirmationResult) {
      throw new Error('Please request OTP first');
    }
    const result = await confirmationResult.confirm(otp);
    await upsertUserProfile(result.user.uid, result.user.email || '', result.user.displayName || 'User', phone.replace('+91', ''), 'customer');
    return mapFirebaseUser(result.user);
  },

  // Forgot Password
  resetPassword: async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email.toLowerCase().trim());
  },

  // Logout
  logout: async (): Promise<void> => {
    await signOut(auth);
  },

  // Get current Firebase user
  getCurrentFirebaseUser: (): FirebaseUser | null => {
    return auth.currentUser;
  },

  // Auth state listener
  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },
};

// Firestore profile helpers
async function fetchUserProfile(uid: string): Promise<any> {
  try {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
}

async function upsertUserProfile(uid: string, email: string, name: string, phone: string, role: string): Promise<void> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      email,
      name,
      phone,
      role,
      createdAt: serverTimestamp(),
    });
  } else {
    const data = snap.data();
    if (!data.phone && phone) {
      await setDoc(ref, { phone, updatedAt: serverTimestamp() }, { merge: true });
    }
  }
}

export { fetchUserProfile, upsertUserProfile };
