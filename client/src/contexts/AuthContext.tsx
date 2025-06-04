import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserProfile, AuthUser, AuthSession } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is admin
  const isAdmin = profile?.role === 'admin';
  
  // Check if user is broker
  const isBroker = profile?.role === 'broker' || profile?.subscription_plan === 'broker';

  // Feature access control based on subscription
  const canAccessFeature = (feature: string): boolean => {
    if (!profile) return false;
    if (isAdmin) return true; // Admins have access to everything

    const plan = profile.subscription_plan;
    const status = profile.subscription_status;

    if (status !== 'active' && status !== 'trial') {
      return feature === 'basic'; // Only basic features for inactive subscriptions
    }

    switch (feature) {
      case 'basic':
        return true; // All plans have basic features
      case 'analytics':
        return ['premium', 'broker'].includes(plan);
      case 'api_access':
        return ['premium', 'broker'].includes(plan);
      case 'deal_management':
        return plan === 'broker' || isBroker;
      case 'admin_panel':
        return isAdmin;
      case 'unlimited_companies':
        return ['premium', 'broker'].includes(plan);
      default:
        return false;
    }
  };

  // Get user profile from database
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Create user profile in database
  const createProfile = async (userId: string, userData: Partial<UserProfile>) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: userId,
            email: userData.email,
            role: userData.role || 'user',
            subscription_plan: userData.subscription_plan || 'free',
            subscription_status: 'trial',
            trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days trial
            full_name: userData.full_name,
            company_name: userData.company_name,
            phone: userData.phone,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  };

  // Sign up new user
  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            company_name: userData.company_name,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create profile in database
        const profileData = await createProfile(data.user.id, {
          ...userData,
          email,
        });

        if (profileData) {
          setProfile(profileData);
          toast({
            title: "Account created successfully!",
            description: "Please check your email to verify your account.",
          });
        }
      }

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Sign in user
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const profileData = await fetchProfile(data.user.id);
        setProfile(profileData);
        
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });
      }

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Sign out user
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      setSession(null);
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error('No user logged in');

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        }
        
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
          } else {
            setProfile(null);
          }
          
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
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