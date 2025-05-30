import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  signInWithRedirect, 
  GoogleAuthProvider,
  getRedirectResult,
  UserCredential,
  signOut,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from "firebase/auth";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Google Authentication Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Phone Authentication Provider
const phoneProvider = new PhoneAuthProvider(auth);

/**
 * Sign in with Google using popup
 * @returns User credential if successful
 */
export async function signInWithGoogle(): Promise<UserCredential | null> {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    console.error("Google sign-in error:", error);
    
    // If popup blocked, try redirect instead
    if (error.code === 'auth/popup-blocked') {
      signInWithRedirect(auth, googleProvider);
    }
    
    throw error;
  }
}

/**
 * Handle redirect result (for when popup is blocked)
 * @returns User credential if successful
 */
export async function handleRedirectResult(): Promise<UserCredential | null> {
  try {
    const result = await getRedirectResult(auth);
    return result;
  } catch (error) {
    console.error("Redirect result error:", error);
    return null;
  }
}

// Placeholder for reCAPTCHA verifier instance
let recaptchaVerifier: RecaptchaVerifier | null = null;
let confirmationResult: ConfirmationResult | null = null;

/**
 * Initialize reCAPTCHA verifier for phone authentication
 * @param containerId DOM element ID for reCAPTCHA container
 */
export function initRecaptchaVerifier(containerId: string): void {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'normal',
      callback: () => {
        // reCAPTCHA solved, allow signInWithPhoneNumber
        console.log('reCAPTCHA verified');
      },
      'expired-callback': () => {
        // Response expired. Ask user to solve reCAPTCHA again
        console.log('reCAPTCHA expired');
      }
    });
  }
}

/**
 * Start phone number verification process
 * @param phoneNumber Phone number in E.164 format (e.g., +12345678900)
 * @returns Promise resolving with confirmation result
 */
export async function startPhoneVerification(phoneNumber: string): Promise<ConfirmationResult | null> {
  try {
    if (!recaptchaVerifier) {
      throw new Error('reCAPTCHA verifier not initialized');
    }

    confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return confirmationResult;
  } catch (error) {
    console.error("Phone verification error:", error);
    return null;
  }
}

/**
 * Verify phone verification code
 * @param verificationCode 6-digit verification code sent to the phone
 * @returns User credential if successful
 */
export async function verifyPhoneCode(verificationCode: string): Promise<UserCredential | null> {
  try {
    if (!confirmationResult) {
      throw new Error('No confirmation result available');
    }

    return await confirmationResult.confirm(verificationCode);
  } catch (error) {
    console.error("Phone verification code error:", error);
    return null;
  }
}

/**
 * Sign out the current user
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
}