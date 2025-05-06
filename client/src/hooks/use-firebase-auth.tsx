import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect
} from "react";
import {
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  signInWithGoogle,
  signInWithEmail,
  createUser,
  signOutUser,
  resetPassword,
  signInWithPhone,
  setupPhoneAuth
} from "@/services/firebaseAuth";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { RecaptchaVerifier, ConfirmationResult } from "firebase/auth";

// Define the User type
export interface User {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  isEmailVerified: boolean;
  isAnonymous: boolean;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

// Convert Firebase User to our User type
const convertFirebaseUser = (firebaseUser: FirebaseUser): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    phoneNumber: firebaseUser.phoneNumber,
    isEmailVerified: firebaseUser.emailVerified,
    isAnonymous: firebaseUser.isAnonymous,
    metadata: {
      creationTime: firebaseUser.metadata.creationTime,
      lastSignInTime: firebaseUser.metadata.lastSignInTime,
    },
  };
};

type PhoneAuthState = {
  verificationId: string | null;
  confirmationResult: ConfirmationResult | null;
  verifier: RecaptchaVerifier | null;
}

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  googleSignInMutation: ReturnType<typeof useGoogleSignInMutation>;
  emailSignInMutation: ReturnType<typeof useEmailSignInMutation>;
  emailSignUpMutation: ReturnType<typeof useEmailSignUpMutation>;
  signOutMutation: ReturnType<typeof useSignOutMutation>;
  resetPasswordMutation: ReturnType<typeof useResetPasswordMutation>;
  phoneAuthState: PhoneAuthState;
  startPhoneSignIn: (phoneNumber: string, containerId: string) => Promise<ConfirmationResult>;
  confirmPhoneSignIn: (verificationCode: string) => Promise<User>;
};

// Custom hooks for auth mutations
const useGoogleSignInMutation = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: signInWithGoogle,
    onError: (error: Error) => {
      toast({
        title: "Google Sign-in failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

const useEmailSignInMutation = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => 
      signInWithEmail(email, password),
    onError: (error: Error) => {
      toast({
        title: "Email Sign-in failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

const useEmailSignUpMutation = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => 
      createUser(email, password),
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

const useSignOutMutation = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: signOutUser,
    onError: (error: Error) => {
      toast({
        title: "Sign-out failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

const useResetPasswordMutation = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (email: string) => resetPassword(email),
    onSuccess: () => {
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for instructions to reset your password.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Password Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const FirebaseAuthContext = createContext<AuthContextType | null>(null);

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [phoneAuthState, setPhoneAuthState] = useState<PhoneAuthState>({
    verificationId: null,
    confirmationResult: null,
    verifier: null,
  });
  
  const { toast } = useToast();
  
  const googleSignInMutation = useGoogleSignInMutation();
  const emailSignInMutation = useEmailSignInMutation();
  const emailSignUpMutation = useEmailSignUpMutation();
  const signOutMutation = useSignOutMutation();
  const resetPasswordMutation = useResetPasswordMutation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setIsLoading(false);
        if (firebaseUser) {
          setUser(convertFirebaseUser(firebaseUser));
        } else {
          setUser(null);
        }
      },
      (error) => {
        setIsLoading(false);
        setError(error as Error);
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive",
        });
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [toast]);

  // Phone authentication functions
  const startPhoneSignIn = async (phoneNumber: string, containerId: string) => {
    try {
      const verifier = setupPhoneAuth(containerId);
      if (!verifier) {
        throw new Error("Could not set up phone authentication");
      }
      
      const confirmationResult = await signInWithPhone(phoneNumber, verifier);
      
      setPhoneAuthState({
        ...phoneAuthState,
        confirmationResult,
        verifier,
      });
      
      return confirmationResult;
    } catch (error) {
      toast({
        title: "Phone authentication failed",
        description: (error as Error).message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const confirmPhoneSignIn = async (verificationCode: string) => {
    try {
      if (!phoneAuthState.confirmationResult) {
        throw new Error("No verification ID available. Please request a code first.");
      }
      
      const result = await phoneAuthState.confirmationResult.confirm(verificationCode);
      const user = convertFirebaseUser(result.user);
      
      // Reset phone auth state
      setPhoneAuthState({
        verificationId: null,
        confirmationResult: null,
        verifier: null,
      });
      
      return user;
    } catch (error) {
      toast({
        title: "Code verification failed",
        description: (error as Error).message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <FirebaseAuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        googleSignInMutation,
        emailSignInMutation,
        emailSignUpMutation,
        signOutMutation,
        resetPasswordMutation,
        phoneAuthState,
        startPhoneSignIn,
        confirmPhoneSignIn,
      }}
    >
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error("useFirebaseAuth must be used within a FirebaseAuthProvider");
  }
  return context;
}