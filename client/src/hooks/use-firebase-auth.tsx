import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { auth, googleProvider } from '@/lib/firebase';
import { 
  User, 
  signInWithPopup, 
  signInWithRedirect, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updateProfile
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

interface FirebaseAuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  createUserWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPhoneVerification: (phoneNumber: string) => Promise<any>;
  verifyPhoneCode: (verificationId: string, code: string) => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | null>(null);

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  useEffect(() => {
    // Initialize recaptcha verifier for phone auth
    if (typeof window !== 'undefined' && !recaptchaVerifier) {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });
      setRecaptchaVerifier(verifier);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      // Using redirect for mobile compatibility
      await signInWithRedirect(auth, googleProvider);
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      toast({
        title: 'Sign In Failed',
        description: error.message || 'Failed to sign in with Google',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Error signing in with email:', error);
      toast({
        title: 'Sign In Failed',
        description: error.message || 'Failed to sign in with email and password',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const createUserWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: 'Registration Failed',
        description: error.message || 'Failed to create user account',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: 'Sign Out Failed',
        description: error.message || 'Failed to sign out',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const sendPhoneVerification = async (phoneNumber: string) => {
    try {
      if (!recaptchaVerifier) {
        throw new Error('reCAPTCHA not initialized');
      }
      
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      return confirmationResult;
    } catch (error: any) {
      console.error('Error sending phone verification:', error);
      toast({
        title: 'Phone Verification Failed',
        description: error.message || 'Failed to send verification code',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const verifyPhoneCode = async (verificationId: string, code: string) => {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      await signInWithPopup(auth, new PhoneAuthProvider());
    } catch (error: any) {
      console.error('Error verifying phone code:', error);
      toast({
        title: 'Phone Verification Failed',
        description: error.message || 'Failed to verify code',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    signInWithEmail,
    createUserWithEmail,
    signOut,
    sendPhoneVerification,
    verifyPhoneCode
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {/* Invisible reCAPTCHA container for phone auth */}
      <div id="recaptcha-container"></div>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
}