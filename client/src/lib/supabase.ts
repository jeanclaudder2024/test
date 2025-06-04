// Using direct API calls instead of Supabase client
// This integrates with the existing authentication system

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: AuthUser;
}

// Auth types
export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'broker';
  subscription_plan: 'free' | 'basic' | 'premium' | 'broker';
  subscription_status: 'active' | 'cancelled' | 'expired' | 'trial';
  trial_ends_at?: string;
  created_at: string;
  updated_at: string;
  full_name?: string;
  company_name?: string;
  phone?: string;
  avatar_url?: string;
}

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: ['Basic company directory', 'Limited vessel tracking', 'Standard support'],
    limits: {
      companies: 10,
      vessels: 5,
      deals: 1
    }
  },
  basic: {
    name: 'Basic',
    price: 29,
    features: ['Full company directory', 'Real-time vessel tracking', 'Email support', 'Basic analytics'],
    limits: {
      companies: 100,
      vessels: 50,
      deals: 10
    }
  },
  premium: {
    name: 'Premium',
    price: 99,
    features: ['Everything in Basic', 'Advanced analytics', 'Priority support', 'Custom reports', 'API access'],
    limits: {
      companies: 1000,
      vessels: 500,
      deals: 100
    }
  },
  broker: {
    name: 'Broker Pro',
    price: 199,
    features: ['Everything in Premium', 'Deal management', 'Commission tracking', 'Client portal', 'White-label options'],
    limits: {
      companies: 'unlimited',
      vessels: 'unlimited',
      deals: 'unlimited'
    }
  }
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;