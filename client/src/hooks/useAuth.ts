import { useState, useEffect } from 'react';
import { User, UserSubscription, RegisterInput, LoginInput } from '@shared/schema';

interface AuthState {
  user: User | null;
  subscription: UserSubscription | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  trialExpired: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    subscription: null,
    isLoading: true,
    isAuthenticated: false,
    trialExpired: false,
  });

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchCurrentUser();
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAuthState({
          user: data.user,
          subscription: data.subscription,
          trialExpired: data.trialExpired,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('auth_token');
        setAuthState({
          user: null,
          subscription: null,
          trialExpired: false,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      localStorage.removeItem('auth_token');
      setAuthState({
        user: null,
        subscription: null,
        trialExpired: false,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const login = async (credentials: LoginInput) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store token
      localStorage.setItem('auth_token', data.token);
      
      // Update state
      setAuthState({
        user: data.user,
        subscription: data.subscription,
        trialExpired: data.trialExpired,
        isAuthenticated: true,
        isLoading: false,
      });
      
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const register = async (userData: RegisterInput) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      
      // Store token
      localStorage.setItem('auth_token', data.token);
      
      // Update state
      setAuthState({
        user: data.user,
        subscription: null, // Will be fetched separately
        trialExpired: false, // New user, trial just started
        isAuthenticated: true,
        isLoading: false,
      });
      
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    // Clear token and state first
    localStorage.removeItem('auth_token');
    setAuthState({
      user: null,
      subscription: null,
      trialExpired: false,
      isAuthenticated: false,
      isLoading: false,
    });
    
    // Call logout endpoint to inform server
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      // Ignore errors on logout
    }
    
    // Force a complete page reload to ensure clean state
    window.location.href = '/';
  };

  return {
    ...authState,
    login,
    register,
    logout,
    refetch: fetchCurrentUser,
  };
};