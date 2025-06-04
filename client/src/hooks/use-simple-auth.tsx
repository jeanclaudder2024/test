import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  isSubscribed?: boolean;
  subscriptionTier: string;
  displayName?: string;
  photoURL?: string;
  provider?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isBroker: boolean;
  canAccessFeature: (feature: string) => boolean;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  phone?: string;
  subscriptionTier?: string;
  displayName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await apiRequest('/api/auth/me');
      if (response.user) {
        setUser(response.user);
      }
    } catch (error) {
      // User not authenticated, which is fine
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.user) {
        setUser(response.user);
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        return true;
      }

      toast({
        title: "Login Failed",
        description: response.message || "Invalid email or password",
        variant: "destructive",
      });
      return false;
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const response = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (response.user) {
        setUser(response.user);
        toast({
          title: "Registration Successful",
          description: "Welcome to PetroDealHub!",
        });
        return true;
      }

      toast({
        title: "Registration Failed",
        description: response.message || "Registration failed",
        variant: "destructive",
      });
      return false;
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
      });
      setUser(null);
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Sign Out Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  // Role-based access control
  const isAdmin = user?.subscriptionTier === 'admin';
  const isBroker = user?.subscriptionTier === 'broker';

  const canAccessFeature = (feature: string): boolean => {
    if (!user) return false;
    
    // Admin has access to everything
    if (isAdmin) return true;
    
    // Feature-based access control
    const featureMap: Record<string, string[]> = {
      'admin-panel': ['admin'],
      'broker-dashboard': ['broker', 'admin'],
      'advanced-analytics': ['professional', 'enterprise', 'broker', 'admin'],
      'api-access': ['professional', 'enterprise', 'broker', 'admin'],
      'priority-support': ['professional', 'enterprise', 'broker', 'admin'],
      'custom-reports': ['enterprise', 'admin'],
      'white-label': ['enterprise', 'admin'],
    };
    
    const requiredPlans = featureMap[feature];
    if (!requiredPlans) return true; // Feature doesn't have restrictions
    
    return requiredPlans.includes(user.subscriptionTier);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isBroker,
    canAccessFeature,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};