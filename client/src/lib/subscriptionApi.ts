import { apiRequest } from './queryClient';

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
  stripePriceId?: string;
  isActive: boolean;
}

export interface UserSubscription {
  id: number;
  userId: number;
  planId: number;
  status: string;
  trialStartDate?: string;
  trialEndDate?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  canceledAt?: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  plan: SubscriptionPlan;
}

// API Functions
export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const response = await fetch('/api/subscription-plans');
  if (!response.ok) {
    throw new Error('Failed to fetch subscription plans');
  }
  return response.json();
};

export const getSubscriptionsWithDetails = async (): Promise<UserSubscription[]> => {
  const response = await apiRequest('GET', '/api/admin/subscriptions');
  return response.json();
};

export const createSubscriptionPlan = async (planData: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> => {
  const response = await apiRequest('POST', '/api/admin/subscription-plans', planData);
  return response.json();
};

export const updateSubscriptionPlan = async (id: number, planData: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> => {
  const response = await apiRequest('PUT', `/api/admin/subscription-plans/${id}`, planData);
  return response.json();
};

export const deleteSubscriptionPlan = async (id: number): Promise<void> => {
  await apiRequest('DELETE', `/api/admin/subscription-plans/${id}`);
};

export const upgradeUserSubscription = async (planId: number): Promise<any> => {
  const response = await apiRequest('POST', '/api/upgrade-subscription', { planId });
  return response.json();
};

export const createStripeCheckout = async (planId: number, interval: 'month' | 'year' = 'month'): Promise<{ url: string }> => {
  const response = await apiRequest('POST', '/api/create-stripe-checkout', { planId, interval });
  return response.json();
};

export const cancelSubscription = async (): Promise<any> => {
  const response = await apiRequest('POST', '/api/cancel-subscription');
  return response.json();
};

export const reactivateSubscription = async (): Promise<any> => {
  const response = await apiRequest('POST', '/api/reactivate-subscription');
  return response.json();
};