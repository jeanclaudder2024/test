import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  getRedirectResult 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firebase Firestore Database
export const db = getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Sign in with Google (popup method)
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Handle redirect result for Google authentication
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    return result;
  } catch (error) {
    console.error("Error handling redirect result:", error);
    throw error;
  }
};