import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, UserCredential } from "firebase/auth";

// Firebase configuration based on environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Use redirect for mobile to avoid popup blockers, use popup for desktop for better UX
export async function signInWithGoogle(): Promise<UserCredential | null> {
  try {
    // Determine if we're on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Redirect flow (better for mobile)
      await signInWithRedirect(auth, googleProvider);
      return null;
    } else {
      // Popup flow (better for desktop)
      return await signInWithPopup(auth, googleProvider);
    }
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
}

// Handle redirect result
export async function handleRedirectResult(): Promise<UserCredential | null> {
  try {
    const result = await getRedirectResult(auth);
    return result;
  } catch (error) {
    console.error("Error handling redirect result", error);
    throw error;
  }
}

export { auth, googleProvider };