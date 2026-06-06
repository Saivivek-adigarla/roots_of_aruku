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
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
    const user = await mapFirebaseUser(credential.user);
    return user;
  },

  // Email + Password Signup
  registerWithEmail: async (email: string, password: string, displayName: string, phone?: string): Promise<User> => {
    const credential = await createUserWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
    await upsertUserProfile(credential.user.uid, email, displayName, phone || '', 'customer');
    const user = await mapFirebaseUser(credential.user);
    return user;
  },

  // Phone OTP Login
  loginWithPhone: async (phone: string): Promise<void> => {
    const formattedPhone = `+91${phone.replace(/\D/g, '').slice(-10)}`;
    if (!auth) throw new Error('Auth not initialized');
    
    const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { 
      size: 'invisible',
      callback: () => {
        // reCAPTCHA completed successfully
      },
      'expired-callback': () => {
        confirmationResult = null;
      },
      'error-callback': () => {
        throw new Error('reCAPTCHA verification failed');
      }
    });
    
    confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
  },

  // Verify Phone OTP
  verifyPhoneOtp: async (phone: string, otp: string): Promise<User> => {
    if (!confirmationResult) throw new Error('No OTP request pending. Please resend OTP.');
    
    const credential = await confirmationResult.confirm(otp);
    const user = await mapFirebaseUser(credential.user);
    const profile = await fetchUserProfile(credential.user.uid);
    
    if (!profile) {
      await upsertUserProfile(
        credential.user.uid, 
        user.email, 
        user.name, 
        phone.replace(/\D/g, '').slice(-10), 
        'customer'
      );
    }
    
    confirmationResult = null;
    return user;
  },

  // Google Sign-In
  loginWithGoogle: async (): Promise<User> => {
    const result = await signInWithPopup(auth, googleProvider);
    const user = await mapFirebaseUser(result.user);
    
    // Create profile if doesn't exist
    const profile = await fetchUserProfile(result.user.uid);
    if (!profile) {
      await upsertUserProfile(
        result.user.uid,
        user.email,
        user.name,
        '',
        'customer'
      );
    }
    
    return user;
  },

  // Logout
  logout: async (): Promise<void> => {
    await signOut(auth);
  },

  // Get current authenticated user with timeout
  getCurrentUser: async (): Promise<User | null> => {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        unsubscribe();
        resolve(null);
      }, 5000); // 5 second timeout

      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        clearTimeout(timeout);
        unsubscribe();
        
        if (fbUser) {
          try {
            const user = await mapFirebaseUser(fbUser);
            resolve(user);
          } catch (error) {
            console.error('Error mapping Firebase user:', error);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });
  },

  // Update profile
  updateProfile: async (userId: string, updates: Partial<User>): Promise<void> => {
    const dbUpdates: { name?: string; phone?: string; email?: string; role?: string } = {};
    
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.phone) dbUpdates.phone = updates.phone;
    if (updates.email) dbUpdates.email = updates.email;
    if (updates.isAdmin !== undefined) dbUpdates.role = updates.isAdmin ? 'admin' : 'customer';

    await upsertUserProfile(
      userId, 
      updates.email || '', 
      dbUpdates.name || '', 
      dbUpdates.phone || '', 
      dbUpdates.role || 'customer'
    );
  },

  // Password reset
  resetPassword: async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email.toLowerCase().trim());
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (user: User | null) => void) => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const user = await mapFirebaseUser(fbUser);
          callback(user);
        } catch (error) {
          console.error('Error mapping Firebase user:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
    
    return unsubscribe;
  },
};

// Firestore profile helpers
export async function upsertUserProfile(
  userId: string, 
  email: string, 
  name: string, 
  phone: string, 
  role: string = 'customer'
) {
  try {
    const ref = doc(db, 'users', userId);
    const existing = await getDoc(ref);
    
    const data = {
      id: userId,
      name,
      email,
      phone,
      role,
      updated_at: new Date().toISOString(),
      ...(existing.exists() ? {} : { created_at: new Date().toISOString() }),
    };
    
    await setDoc(ref, data, { merge: true });
    return data;
  } catch (error) {
    console.error('Error upserting user profile:', error);
    throw error;
  }
}

export async function fetchUserProfile(userId: string) {
  try {
    const ref = doc(db, 'users', userId);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() as Record<string, unknown> : null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}
