import { apiRequest, queryClient } from "./queryClient";

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  interval: string;
  trialDays: number;
  features: string[];
  maxVessels: number;
  maxPorts: number;
  maxRefineries: number;
  canAccessBrokerFeatures: boolean;
  canAccessAnalytics: boolean;
  canExportData: boolean;
  stripeProductId?: string;
  stripePriceId?: string;
}

export interface UserSubscription {
  id: number;
  userId: number;
  planId: number;
  status: 'trial' | 'active' | 'canceled' | 'past_due' | 'unpaid';
  trialStartDate?: string;
  trialEndDate?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  plan: SubscriptionPlan;
}

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  planName: string;
  status: string;
  trialEndsAt?: string;
  subscriptionEndsAt?: string;
  canAccessBrokerFeatures: boolean;
  canAccessAnalytics: boolean;
  canExportData: boolean;
  maxVessels: number;
  maxPorts: number;
  maxRefineries: number;
}

// Feature access control functions
export const checkFeatureAccess = (status: SubscriptionStatus, feature: string): boolean => {
  if (!status.hasActiveSubscription) return false;
  
  switch (feature) {
    case 'broker_features':
      return status.canAccessBrokerFeatures;
    case 'analytics':
      return status.canAccessAnalytics;
    case 'export_data':
      return status.canExportData;
    case 'vessel_tracking':
      return true; // Available to all active subscriptions
    case 'port_data':
      return true; // Available to all active subscriptions
    default:
      return false;
  }
};

export const checkResourceLimit = (
  status: SubscriptionStatus, 
  resource: 'vessels' | 'ports' | 'refineries', 
  currentCount: number
): boolean => {
  if (!status.hasActiveSubscription) return false;
  
  const limit = status[`max${resource.charAt(0).toUpperCase() + resource.slice(1)}` as keyof SubscriptionStatus] as number;
  return limit === -1 || currentCount < limit;
};

// API functions
export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const response = await apiRequest('GET', '/api/subscription-plans');
  return response.json();
};

export const getUserSubscription = async (): Promise<UserSubscription | null> => {
  const response = await apiRequest('GET', '/api/user-subscription');
  if (response.status === 404) return null;
  return response.json();
};

export const getSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
  const response = await apiRequest('GET', '/api/subscription-status');
  return response.json();
};

export const createStripeCheckout = async (planId: number, interval: 'month' | 'year' = 'month') => {
  const response = await apiRequest('POST', '/api/create-stripe-checkout', { planId, interval });
  const data = await response.json();
  
  if (data.url) {
    window.location.href = data.url;
  }
  
  return data;
};

export const cancelSubscription = async () => {
  const response = await apiRequest('POST', '/api/cancel-subscription');
  
  // Invalidate subscription queries
  queryClient.invalidateQueries({ queryKey: ['/api/user-subscription'] });
  queryClient.invalidateQueries({ queryKey: ['/api/subscription-status'] });
  
  return response.json();
};

export const reactivateSubscription = async () => {
  const response = await apiRequest('POST', '/api/reactivate-subscription');
  
  // Invalidate subscription queries
  queryClient.invalidateQueries({ queryKey: ['/api/user-subscription'] });
  queryClient.invalidateQueries({ queryKey: ['/api/subscription-status'] });
  
  return response.json();
};

// Trial management
export const isTrialExpired = (subscription: UserSubscription): boolean => {
  if (subscription.status !== 'trial' || !subscription.trialEndDate) return false;
  return new Date(subscription.trialEndDate) < new Date();
};

export const getDaysRemainingInTrial = (subscription: UserSubscription): number => {
  if (subscription.status !== 'trial' || !subscription.trialEndDate) return 0;
  
  const now = new Date();
  const trialEnd = new Date(subscription.trialEndDate);
  const diff = trialEnd.getTime() - now.getTime();
  
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};