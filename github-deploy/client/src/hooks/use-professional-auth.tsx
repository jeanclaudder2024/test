import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored authentication on app start
    const checkStoredAuth = async () => {
      const storedToken = localStorage.getItem('petrodealhub_token');
      const storedUser = localStorage.getItem('petrodealhub_user');
      
      if (storedToken && storedUser) {
        try {
          // Verify token is still valid
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setToken(storedToken);
              setUser(JSON.parse(storedUser));
            } else {
              // Token is invalid, clear storage
              localStorage.removeItem('petrodealhub_token');
              localStorage.removeItem('petrodealhub_user');
            }
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('petrodealhub_token');
            localStorage.removeItem('petrodealhub_user');
          }
        } catch (error) {
          console.error('Auth verification error:', error);
          localStorage.removeItem('petrodealhub_token');
          localStorage.removeItem('petrodealhub_user');
        }
      }
      
      setIsLoading(false);
    };

    checkStoredAuth();
  }, []);

  const login = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('petrodealhub_token', token);
    localStorage.setItem('petrodealhub_user', JSON.stringify(user));
  };

  const logout = async () => {
    try {
      // Call logout endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Logout API error:', error);
    }
    
    // Clear local state and storage
    setUser(null);
    setToken(null);
    localStorage.removeItem('petrodealhub_token');
    localStorage.removeItem('petrodealhub_user');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('petrodealhub_user', JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useProfessionalAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useProfessionalAuth must be used within an AuthProvider');
  }
  return context;
}