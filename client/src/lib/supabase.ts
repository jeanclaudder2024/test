import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types for authentication
export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: any;
  app_metadata?: any;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: AuthUser;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'broker' | 'user';
  subscription_plan: 'basic' | 'professional' | 'enterprise' | 'broker';
  company_name?: string;
  created_at: string;
  updated_at: string;
}

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  basic: {
    id: 'basic',
    name: 'Basic Plan',
    price: '$29/month',
    features: [
      'Access to vessel tracking',
      'Basic port information',
      'Email support',
      'Standard reporting'
    ]
  },
  professional: {
    id: 'professional',
    name: 'Professional Plan',
    price: '$79/month',
    features: [
      'Advanced vessel analytics',
      'Real-time notifications',
      'Priority support',
      'Custom reports',
      'API access'
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: '$199/month',
    features: [
      'Full platform access',
      'Dedicated account manager',
      'Custom integrations',
      'Advanced analytics',
      'White-label solutions'
    ]
  },
  broker: {
    id: 'broker',
    name: 'Broker Plan',
    price: '$149/month',
    features: [
      'Broker dashboard',
      'Deal management',
      'Client portfolio',
      'Commission tracking',
      'Advanced reporting'
    ]
  }
};

// Helper functions for authentication
export const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    return { error };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  } catch (error) {
    return { user: null, error };
  }
};

export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  } catch (error) {
    return { session: null, error };
  }
};

// Profile management
export const createUserProfile = async (userId: string, profileData: Partial<UserProfile>) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([{
        id: userId,
        ...profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};