import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { User as AppUser } from '@shared/schema';

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error?: AuthError }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  hasActiveSubscription: boolean;
  hasPremiumAccess: boolean;
  permissions: {
    isAdmin: boolean;
    hasActiveSubscription: boolean;
    hasPremiumAccess: boolean;
    subscriptionPlan: string;
    subscriptionStatus: string;
    role: string;
  } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthProvider(): AuthContextType {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<AuthContextType['permissions']>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserData(session.access_token);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session) {
        await fetchUserData(session.access_token);
      } else {
        setUser(null);
        setPermissions(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch('/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);

        // Fetch permissions
        const permissionsResponse = await fetch('/api/auth/permissions', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (permissionsResponse.ok) {
          const permissionsData = await permissionsResponse.json();
          setPermissions(permissionsData);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error || undefined };
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { error: error || undefined };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      setPermissions(null);
    }
  };

  const isAdmin = permissions?.isAdmin || false;
  const hasActiveSubscription = permissions?.hasActiveSubscription || false;
  const hasPremiumAccess = permissions?.hasPremiumAccess || false;

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    hasActiveSubscription,
    hasPremiumAccess,
    permissions
  };
}

export { AuthContext };