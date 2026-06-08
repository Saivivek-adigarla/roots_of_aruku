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
} from "firebase/auth";

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { User } from "../types";

const googleProvider = new GoogleAuthProvider();

// store OTP session
let confirmationResult: ConfirmationResult | null = null;

/* -------------------------
   MAP FIREBASE USER
-------------------------- */
const mapFirebaseUser = async (fbUser: FirebaseUser): Promise<User> => {
  const profile = await fetchUserProfile(fbUser.uid);

  const isAdminEmail =
    fbUser.email?.toLowerCase() ===
    import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase();

  return {
    uid: fbUser.uid,
    name:
      profile?.name ||
      fbUser.displayName ||
      fbUser.email?.split("@")[0] ||
      "User",
    email: fbUser.email || "",
    phone: profile?.phone || fbUser.phoneNumber?.replace("+91", "") || "",
    isAdmin: profile?.role === "admin" || isAdminEmail,
  };
};

/* =========================
   AUTH SERVICE
========================= */
export const authService = {
  /* ---------------- EMAIL LOGIN ---------------- */
  loginWithEmail: async (
    email: string,
    password: string
  ): Promise<User> => {
    const credential = await signInWithEmailAndPassword(
      auth,
      email.toLowerCase().trim(),
      password
    );

    return mapFirebaseUser(credential.user);
  },

  /* ---------------- REGISTER ---------------- */
  registerWithEmail: async (
    email: string,
    password: string,
    displayName: string,
    phone?: string
  ): Promise<User> => {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email.toLowerCase().trim(),
      password
    );

    await upsertUserProfile(
      credential.user.uid,
      email,
      displayName,
      phone || "",
      "customer"
    );

    return mapFirebaseUser(credential.user);
  },

  /* ---------------- GOOGLE LOGIN ---------------- */
  loginWithGoogle: async (): Promise<User> => {
    const result = await signInWithPopup(auth, googleProvider);

    await upsertUserProfile(
      result.user.uid,
      result.user.email || "",
      result.user.displayName || "User",
      result.user.phoneNumber?.replace("+91", "") || "",
      "customer"
    );

    return mapFirebaseUser(result.user);
  },

  /* ---------------- PHONE OTP SEND ---------------- */
  loginWithPhone: async (phone: string): Promise<void> => {
    try {
      const appVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {},
        }
      );

      confirmationResult = await signInWithPhoneNumber(
        auth,
        `+91${phone}`,
        appVerifier
      );
    } catch (error: any) {
      confirmationResult = null;
      throw new Error(error.message || "Failed to send OTP");
    }
  },

  /* ---------------- OTP VERIFY ---------------- */
  verifyPhoneOtp: async (
    phone: string,
    otp: string
  ): Promise<User> => {
    if (!confirmationResult) {
      throw new Error("Please request OTP first");
    }

    const result = await confirmationResult.confirm(otp);

    await upsertUserProfile(
      result.user.uid,
      result.user.email || "",
      result.user.displayName || "User",
      phone.replace("+91", ""),
      "customer"
    );

    confirmationResult = null;

    return mapFirebaseUser(result.user);
  },

  /* ---------------- RESET PASSWORD ---------------- */
  resetPassword: async (email: string): Promise<void> => {
    await sendPasswordResetEmail(
      auth,
      email.toLowerCase().trim()
    );
  },

  /* ---------------- LOGOUT ---------------- */
  logout: async (): Promise<void> => {
    await signOut(auth);
  },

  /* ---------------- CURRENT USER ---------------- */
  getCurrentFirebaseUser: (): FirebaseUser | null => {
    return auth.currentUser;
  },

  /* ---------------- AUTH STATE LISTENER ---------------- */
  onAuthStateChanged: (
    callback: (user: FirebaseUser | null) => void
  ) => {
    return onAuthStateChanged(auth, callback);
  },
};

/* =========================
   FIRESTORE HELPERS
========================= */

async function fetchUserProfile(uid: string): Promise<any | null> {
  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
}

async function upsertUserProfile(
  uid: string,
  email: string,
  name: string,
  phone: string,
  role: string
): Promise<void> {
  const ref = doc(db, "users", uid);

  await setDoc(
    ref,
    {
      email,
      name,
      phone,
      role,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export { fetchUserProfile, upsertUserProfile };
