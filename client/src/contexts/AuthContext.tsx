import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  supabase, 
  UserProfile, 
  AuthUser, 
  AuthSession,
  signUp,
  signIn,
  signOut,
  getUserProfile,
  createUserProfile,
  updateUserProfile 
} from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  session: AuthSession | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
  isAdmin: boolean;
  isBroker: boolean;
  canAccessFeature: (feature: string) => boolean;
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session as AuthSession);
        setUser(session?.user as AuthUser ?? null);
        
        if (session?.user) {
          // Fetch user profile
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session as AuthSession);
        setUser(session?.user as AuthUser ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await getUserProfile(userId);
      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }
      setProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleSignUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      const { data, error } = await signUp(email, password, userData);
      
      if (error) {
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      if (data.user) {
        // Create user profile
        await createUserProfile(data.user.id, {
          email: data.user.email!,
          ...userData,
        });
        
        toast({
          title: "Registration Successful",
          description: "Please check your email to verify your account.",
        });
      }

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast({
          title: "Sign Out Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

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

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    try {
      const { data, error } = await updateUserProfile(user.id, updates);
      
      if (error) {
        toast({
          title: "Profile Update Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Refresh profile
      await fetchUserProfile(user.id);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Profile Update Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  // Role-based access control
  const isAdmin = profile?.role === 'admin';
  const isBroker = profile?.role === 'broker' || profile?.subscription_plan === 'broker';

  const canAccessFeature = (feature: string): boolean => {
    if (!profile) return false;
    
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
    
    return requiredPlans.includes(profile.subscription_plan) || requiredPlans.includes(profile.role);
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    updateProfile: handleUpdateProfile,
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