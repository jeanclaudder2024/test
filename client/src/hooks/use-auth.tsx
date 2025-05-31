import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

type RegisterData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ['/api/auth/me'],
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
        return userData.success ? userData.user : null;
      } catch (err) {
        console.error("Auth error:", err);
        return null;
      }
    }
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(credentials),
        });
        
        // Check if response is okay
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Login failed: ${errorText}`);
        }
        
        // Try to parse JSON safely
        let data;
        try {
          data = await res.json();
        } catch (jsonError) {
          console.error('JSON parsing error:', jsonError);
          throw new Error("Invalid server response format");
        }
        
        if (!data.success) {
          throw new Error(data.message || "Login failed");
        }
        
        return data.user;
      } catch (error) {
        console.error('Login mutation error:', error);
        throw error;
      }
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(['/api/auth/me'], user);
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
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(userData),
        });
        
        // Check if response is okay
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Registration failed: ${errorText}`);
        }
        
        // Try to parse JSON safely
        let data;
        try {
          data = await res.json();
        } catch (jsonError) {
          console.error('JSON parsing error:', jsonError);
          throw new Error("Invalid server response format");
        }
        
        if (!data.success) {
          throw new Error(data.message || "Registration failed");
        }
        
        return data.user;
      } catch (error) {
        console.error('Registration mutation error:', error);
        throw error;
      }
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(['/api/auth/me'], user);
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
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || "Logout failed");
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/me'], null);
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

  // Google authentication removed - using Supabase auth only

  // Google sign-in function (disabled - using Supabase auth only)
  const googleSignIn = async () => {
    toast({
      title: "Google Sign-In Unavailable",
      description: "Please use email/password login with your Supabase account",
      variant: "destructive",
    });
  };

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