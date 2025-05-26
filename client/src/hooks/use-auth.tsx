import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { signInWithGoogle, handleRedirectResult, auth } from "@/lib/firebase";
import { User as FirebaseUser } from "firebase/auth";
import { useLocation } from "wouter";

type User = {
  id: number;
  username: string;
  email?: string | null;
  phone?: string | null;
  provider?: string | null;
  photoURL?: string | null;
  displayName?: string | null;
  isSubscribed?: boolean;
  subscriptionTier?: string | null;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
  googleSignIn: () => Promise<void>;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = LoginData & {
  email?: string;
  phone?: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ['/api/user'],
    queryFn: async ({ queryKey }) => {
      try {
        const res = await fetch(queryKey[0] as string, {
          credentials: "include",
        });
        
        if (res.status === 401) {
          return null;
        }
        
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        
        const userData = await res.json();
        return userData as User;
      } catch (err) {
        console.error("Auth error:", err);
        return null;
      }
    }
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("/api/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      return res;
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(['/api/user'], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest("/api/register", {
        method: "POST",
        body: JSON.stringify(userData),
      });
      return res;
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(['/api/user'], user);
      toast({
        title: "Registration successful",
        description: `Welcome aboard, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("/api/logout", {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/user'], null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Google Sign In mutation
  const googleAuthMutation = useMutation({
    mutationFn: async (firebaseUser: FirebaseUser) => {
      // Send Firebase auth data to the server to create/login the user
      const authData = {
        idToken: await firebaseUser.getIdToken(),
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        uid: firebaseUser.uid
      };

      const res = await apiRequest("/api/auth/google", {
        method: "POST",
        body: JSON.stringify(authData),
      });
      return res;
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(['/api/user'], user);
      toast({
        title: "Google login successful",
        description: `Welcome, ${user.displayName || user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Google login failed",
        description: error.message || "Could not authenticate with Google",
        variant: "destructive",
      });
    },
  });

  // Handle Google sign-in
  const googleSignIn = async () => {
    try {
      const userCredential = await signInWithGoogle();
      if (userCredential?.user) {
        await googleAuthMutation.mutateAsync(userCredential.user);
      }
    } catch (error: any) {
      toast({
        title: "Google login failed",
        description: error.message || "Could not authenticate with Google",
        variant: "destructive",
      });
    }
  };

  // Handle Google redirect result on component mount
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await handleRedirectResult();
        if (result?.user) {
          await googleAuthMutation.mutateAsync(result.user);
        }
      } catch (error: any) {
        // Only show error if not canceled by user
        if (error.code !== 'auth/cancelled-popup-request') {
          toast({
            title: "Google login failed",
            description: error.message || "Could not authenticate with Google",
            variant: "destructive",
          });
        }
      }
    };

    checkRedirectResult();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null, // Ensure we never pass undefined as the user value
        isLoading,
        error,
        isAuthenticated: !!user, // User is authenticated if user object exists
        loginMutation,
        logoutMutation,
        registerMutation,
        googleSignIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}