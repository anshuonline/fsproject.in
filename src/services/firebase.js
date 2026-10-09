import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "auth.freesong.in",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "authentication-freesong",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "authentication-freesong.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1036335369920",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1036335369920:web:708fee24c1da07a85a6725",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-06L8EEWV5F"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { signInWithPopup, signOut, onAuthStateChanged };

