import { initializeApp } from 'firebase/auth';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase with the configuration
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Set up provider for Google authentication
export const googleProvider = new GoogleAuthProvider();
// Always prompt for Google account selection
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Phone auth requires a recaptcha verifier, which is set up in the FirebaseAuthProvider component

// Export providers and functions for use throughout the app
export { GoogleAuthProvider };