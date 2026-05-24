import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  User as FirebaseUser,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { User } from '../types';

/**
 * Authentication Service
 * Handles all auth-related operations with Firebase
 */

export const authService = {
  /**
   * Register with email and password
   */
  registerWithEmail: async (
    email: string,
    password: string,
    displayName: string
  ): Promise<User> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      
      const user: User = {
        id: userCredential.user.uid,
        email: userCredential.user.email || email,
        displayName,
        addresses: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Save user profile to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), user);
      
      return user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  /**
   * Login with email and password
   */
  loginWithEmail: async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Fetch user profile from Firestore
      const userDoc = await getDoc(
        doc(db, 'users', userCredential.user.uid)
      );
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }
      
      return userDoc.data() as User;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  /**
   * Login with Google
   */
  loginWithGoogle: async (): Promise<User> => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Check if user exists in Firestore
      let userDoc = await getDoc(
        doc(db, 'users', userCredential.user.uid)
      );
      
      if (!userDoc.exists()) {
        // Create new user profile
        const user: User = {
          id: userCredential.user.uid,
          email: userCredential.user.email || '',
          displayName: userCredential.user.displayName || '',
          photoURL: userCredential.user.photoURL || '',
          addresses: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await setDoc(doc(db, 'users', userCredential.user.uid), user);
        return user;
      }
      
      return userDoc.data() as User;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  /**
   * Setup phone number authentication
   */
  setupPhoneAuth: (phoneNumber: string, elementId: string): RecaptchaVerifier => {
    return new RecaptchaVerifier(elementId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA resolved
      },
    }, auth);
  },

  /**
   * Send OTP to phone number
   */
  sendOTP: async (phoneNumber: string, verifier: RecaptchaVerifier) => {
    try {
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        verifier
      );
      return confirmationResult;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  /**
   * Verify OTP
   */
  verifyOTP: async (confirmationResult: any, code: string): Promise<User> => {
    try {
      const userCredential = await confirmationResult.confirm(code);
      
      let userDoc = await getDoc(
        doc(db, 'users', userCredential.user.uid)
      );
      
      if (!userDoc.exists()) {
        const user: User = {
          id: userCredential.user.uid,
          email: userCredential.user.email || '',
          phoneNumber: userCredential.user.phoneNumber || '',
          addresses: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await setDoc(doc(db, 'users', userCredential.user.uid), user);
        return user;
      }
      
      return userDoc.data() as User;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  /**
   * Send password reset email
   */
  resetPassword: async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  /**
   * Logout
   */
  logout: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  /**
   * Get current user
   */
  getCurrentUser: async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      return userDoc.exists() ? (userDoc.data() as User) : null;
    } catch (error: any) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (userId: string, updates: Partial<User>): Promise<void> => {
    try {
      await setDoc(
        doc(db, 'users', userId),
        { ...updates, updatedAt: new Date() },
        { merge: true }
      );
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  /**
   * Save address to user profile
   */
  saveAddress: async (userId: string, address: any): Promise<void> => {
    try {
      await setDoc(
        doc(db, 'users', userId, 'addresses', address.id),
        address
      );
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  /**
   * Get user addresses
   */
  getUserAddresses: async (userId: string) => {
    try {
      const querySnapshot = await getDocs(
        collection(db, 'users', userId, 'addresses')
      );
      return querySnapshot.docs.map((doc) => doc.data());
    } catch (error: any) {
      throw new Error(error.message);
    }
  },
};