import { queryOptions } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Types for subscription system
export interface SubscriptionPlan {
  id: number;
  name: string;
  code: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  maxUsers: number;
  maxVessels: number;
  maxRefineries: number;
  isPopular?: boolean;
  description: string;
  stripeMonthlyPriceId?: string;
  stripeYearlyPriceId?: string;
}

export interface UserSubscription {
  id: number;
  planId: number;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEnd?: Date;
  cancelAtPeriodEnd: boolean;
  plan: SubscriptionPlan;
}

export interface SubscriptionUsage {
  users: number;
  vessels: number;
  refineries: number;
  documents: number;
  apiCalls: number;
}

// Subscription plans data based on provided specifications
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 1,
    name: "Basic",
    code: "basic",
    monthlyPrice: 69,
    yearlyPrice: 662, // 20% discount (save 20%)
    maxUsers: 1,
    maxVessels: 250,
    maxRefineries: 25,
    description: "Perfect for individual brokers starting their petroleum trading journey",
    features: [
      "Access to 2 maritime zones",
      "Up to 250 tankers",
      "Up to 25 refineries",
      "5 major ports",
      "LOI, B/L only",
      "View-only access",
      "1 user",
      "Email support only",
      "All major global languages",
      "5-day free trial"
    ],
    stripeMonthlyPriceId: "price_basic_monthly",
    stripeYearlyPriceId: "price_basic_yearly"
  },
  {
    id: 2,
    name: "Professional",
    code: "professional",
    monthlyPrice: 150,
    yearlyPrice: 1350, // 25% discount (save 25%)
    maxUsers: 3,
    maxVessels: -1, // Unlimited
    maxRefineries: -1, // Unlimited
    isPopular: true,
    description: "Ideal for growing trading companies with active deal participation",
    features: [
      "Access to 6 strategic zones",
      "Unlimited tracking with vessel status",
      "Expanded refinery data + operational info",
      "Access to 20+ international ports",
      "Includes SPA, ICPO, NCNDA",
      "Limited participation in active deals",
      "Up to 3 users",
      "Direct support + onboarding session",
      "All major global languages",
      "✅ Eligible for PetroDealHub International Broker ID",
      "✅ Contact with oil sales teams at major companies",
      "✅ Entry into verified contract environments",
      "✅ Join live deal rooms and bid on contracts",
      "✅ Alerts on refinery availability and vessel movements",
      "✅ Weekly opportunity recommendations based on region or product",
      "✅ Contract terms review before commitment",
      "5-day free trial"
    ],
    stripeMonthlyPriceId: "price_professional_monthly",
    stripeYearlyPriceId: "price_professional_yearly"
  },
  {
    id: 3,
    name: "Enterprise",
    code: "enterprise",
    monthlyPrice: 399,
    yearlyPrice: 3591, // 25% discount (save 25%)
    maxUsers: -1, // Unlimited
    maxVessels: -1, // Unlimited
    maxRefineries: -1, // Unlimited
    description: "Perfect for large organizations and petroleum trading companies with global operations",
    features: [
      "Access to 9 major global maritime zones",
      "Full live tracking with verified activity",
      "Full access including internal documentation (e.g., gate passes)",
      "Access to 100+ strategic global ports",
      "Full set: SGS, SDS, Q88, ATB, customs and compliance documentation",
      "Full participation + contract management",
      "Full team access with user permission control",
      "24/7 premium support + dedicated account manager",
      "All major global languages",
      "✅ Included with official registration",
      "✅ Full direct access to official seller departments",
      "✅ Legal recognition and dispute protection",
      "✅ Participate in real contract execution with sellers",
      "✅ Priority alerts for new international supply opportunities",
      "✅ Country-based lead targeting + document review assistance",
      "✅ Dedicated advisors for deal compliance and risk reduction",
      "5-day free trial"
    ],
    stripeMonthlyPriceId: "price_enterprise_monthly",
    stripeYearlyPriceId: "price_enterprise_yearly"
  }
];

// Feature gates and access control
export class FeatureGate {
  private userPlan: SubscriptionPlan | null;
  private isAdmin: boolean;

  constructor(userPlan: SubscriptionPlan | null, isAdmin: boolean = false) {
    this.userPlan = userPlan;
    this.isAdmin = isAdmin;
  }

  // Admin users have unlimited access
  hasAccess(feature: string): boolean {
    if (this.isAdmin) return true;
    if (!this.userPlan) return false;

    switch (feature) {
      case 'vessel_tracking':
        return true; // All plans have vessel tracking
      case 'unlimited_vessels':
        return this.userPlan.code !== 'basic';
      case 'refinery_access':
        return true; // All plans have refinery access
      case 'unlimited_refineries':
        return this.userPlan.code !== 'basic';
      case 'advanced_documentation':
        return this.userPlan.code !== 'basic';
      case 'deal_participation':
        return this.userPlan.code !== 'basic';
      case 'broker_membership':
        return this.userPlan.code === 'professional' || this.userPlan.code === 'enterprise';
      case 'direct_seller_access':
        return this.userPlan.code === 'professional' || this.userPlan.code === 'enterprise';
      case 'contract_execution':
        return this.userPlan.code === 'enterprise';
      case 'priority_support':
        return this.userPlan.code === 'enterprise';
      case 'multi_user':
        return this.userPlan.code !== 'basic';
      case 'api_access':
        return this.userPlan.code === 'professional' || this.userPlan.code === 'enterprise';
      case 'analytics_export':
        return this.userPlan.code !== 'basic';
      default:
        return false;
    }
  }

  getVesselLimit(): number {
    if (this.isAdmin) return -1;
    if (!this.userPlan) return 0;
    return this.userPlan.maxVessels;
  }

  getRefineryLimit(): number {
    if (this.isAdmin) return -1;
    if (!this.userPlan) return 0;
    return this.userPlan.maxRefineries;
  }

  getUserLimit(): number {
    if (this.isAdmin) return -1;
    if (!this.userPlan) return 0;
    return this.userPlan.maxUsers;
  }
}

// Query options for React Query
export const subscriptionQueries = {
  plans: () => queryOptions({
    queryKey: ['/api/subscription/plans'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  }),
  
  userSubscription: () => queryOptions({
    queryKey: ['/api/subscription/current'],
    staleTime: 1000 * 60 * 2, // 2 minutes
  }),
  
  usage: () => queryOptions({
    queryKey: ['/api/subscription/usage'],
    staleTime: 1000 * 60 * 1, // 1 minute
  }),
};

// Subscription utility functions
export function isTrialActive(subscription: UserSubscription | null): boolean {
  if (!subscription?.trialEnd) return false;
  return new Date() < new Date(subscription.trialEnd);
}

export function isSubscriptionActive(subscription: UserSubscription | null): boolean {
  if (!subscription) return false;
  if (subscription.status === 'active') return true;
  if (subscription.status === 'trialing') return true;
  return false;
}

export function getDaysUntilExpiry(subscription: UserSubscription | null): number {
  if (!subscription) return 0;
  
  const expiryDate = subscription.trialEnd 
    ? new Date(subscription.trialEnd)
    : new Date(subscription.currentPeriodEnd);
    
  const today = new Date();
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

export function getSubscriptionStatusColor(subscription: UserSubscription | null): string {
  if (!subscription) return "text-gray-500";
  
  switch (subscription.status) {
    case 'active':
      return "text-green-600";
    case 'trialing':
      return "text-blue-600";
    case 'past_due':
      return "text-yellow-600";
    case 'canceled':
    case 'unpaid':
      return "text-red-600";
    default:
      return "text-gray-500";
  }
}

export function formatSubscriptionStatus(subscription: UserSubscription | null): string {
  if (!subscription) return "No subscription";
  
  switch (subscription.status) {
    case 'active':
      return "Active";
    case 'trialing':
      return "Free Trial";
    case 'past_due':
      return "Payment Due";
    case 'canceled':
      return "Canceled";
    case 'unpaid':
      return "Unpaid";
    default:
      return subscription.status;
  }
}

// Subscription actions
export async function createCheckoutSession(planId: number, isYearly: boolean = false) {
  const response = await apiRequest("/api/subscription/create-checkout", {
    method: "POST",
    body: JSON.stringify({
      planId,
      isYearly
    })
  });
  
  if (response.url) {
    window.location.href = response.url;
  }
  
  return response;
}

export async function createPortalSession() {
  const response = await apiRequest("/api/subscription/create-portal", {
    method: "POST",
    body: JSON.stringify({})
  });
  
  if (response.url) {
    window.location.href = response.url;
  }
  
  return response;
}

export async function cancelSubscription() {
  return apiRequest("/api/subscription/cancel", {
    method: "POST",
    body: JSON.stringify({})
  });
}

export async function resumeSubscription() {
  return apiRequest("/api/subscription/resume", {
    method: "POST", 
    body: JSON.stringify({})
  });
}