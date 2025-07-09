import { useState, useEffect, useRef } from 'react';
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

  // Use ref to prevent multiple simultaneous calls
  const fetchingRef = useRef(false);
  const hasInitializedRef = useRef(false);

  // Check for existing token on mount
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const token = localStorage.getItem('authToken');
    if (token) {
      fetchCurrentUser();
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const fetchCurrentUser = async () => {
    // Prevent multiple simultaneous calls
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const token = localStorage.getItem('authToken');
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
        localStorage.removeItem('authToken');
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
      localStorage.removeItem('authToken');
      setAuthState({
        user: null,
        subscription: null,
        trialExpired: false,
        isAuthenticated: false,
        isLoading: false,
      });
    } finally {
      fetchingRef.current = false;
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
      localStorage.setItem('authToken', data.token);
      
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
      localStorage.setItem('authToken', data.token);
      
      // Update state
      setAuthState({
        user: data.user,
        subscription: data.subscription,
        trialExpired: data.trialExpired || false,
        isAuthenticated: true,
        isLoading: false,
      });
      
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Call logout endpoint first
      await fetch('/api/auth/logout', { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
    } catch (error) {
      console.log('Logout endpoint error (ignored):', error);
    }
    
    // Clear everything locally
    localStorage.removeItem('authToken');
    localStorage.clear(); // Clear all localStorage
    
    // Reset auth state
    setAuthState({
      user: null,
      subscription: null,
      trialExpired: false,
      isAuthenticated: false,
      isLoading: false,
    });
    
    // Redirect to home page
    window.location.replace('/');
  };

  return {
    ...authState,
    login,
    register,
    logout,
    refetch: () => {
      if (!fetchingRef.current) {
        fetchCurrentUser();
      }
    },
  };
};