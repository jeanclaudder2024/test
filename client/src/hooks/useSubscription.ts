import { useAuth } from './useAuth';

export interface SubscriptionFeatures {
  hasBasicAccess: boolean;
  hasProfessionalAccess: boolean;
  hasEnterpriseAccess: boolean;
  hasTrialAccess: boolean;
  isTrialExpired: boolean;
  trialDaysRemaining: number;
  canAccessBrokerFeatures: boolean;
  canAccessAllZones: boolean;
  canGenerateDocuments: boolean;
  maxVessels: number;
  maxPorts: number;
  maxRefineries: number;
  documentTypes: string[];
}

export function useSubscription(): SubscriptionFeatures {
  const { user, subscription, trialExpired, isAuthenticated } = useAuth();

  // Admin users have full access
  if (user?.role === 'admin') {
    return {
      hasBasicAccess: true,
      hasProfessionalAccess: true,
      hasEnterpriseAccess: true,
      hasTrialAccess: true,
      isTrialExpired: false,
      trialDaysRemaining: 365,
      canAccessBrokerFeatures: true,
      canAccessAllZones: true,
      canGenerateDocuments: true,
      maxPorts: 999,
      documentTypes: ['LOI', 'B/L', 'SPA', 'ICPO', 'SGS', 'SDS', 'Q88', 'ATB', 'customs']
    };
  }

  // Calculate trial days remaining
  const calculateTrialDays = () => {
    if (!subscription?.trialEndDate) return 0;
    const trialEnd = new Date(subscription.trialEndDate);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const trialDaysRemaining = calculateTrialDays();
  const hasActiveSubscription = subscription?.status === 'active';
  const hasActiveTrial = subscription?.status === 'trial' && !trialExpired && trialDaysRemaining > 0;

  // Determine subscription level
  const planId = subscription?.planId || 0;
  const isBasicPlan = planId === 1;
  const isProfessionalPlan = planId === 2;
  const isEnterprisePlan = planId === 3;

  // For trial users, use their actual selected plan limits (no unlimited access)
  const effectivePlan = planId; // Use actual plan limits even during trial

  return {
    hasBasicAccess: hasActiveSubscription || hasActiveTrial || effectivePlan >= 1,
    hasProfessionalAccess: hasActiveSubscription || hasActiveTrial || effectivePlan >= 2,
    hasEnterpriseAccess: hasActiveSubscription || hasActiveTrial || effectivePlan >= 3,
    hasTrialAccess: hasActiveTrial,
    isTrialExpired: trialExpired || trialDaysRemaining === 0,
    trialDaysRemaining,
    // FIXED: Broker features require PAID Professional (Plan 2) or Enterprise (Plan 3) - NO trial access
    canAccessBrokerFeatures: (hasActiveSubscription && effectivePlan >= 2) || (user?.role === 'admin'),
    canAccessAllZones: hasActiveSubscription || hasActiveTrial || effectivePlan >= 3,
    canGenerateDocuments: hasActiveSubscription || hasActiveTrial || effectivePlan >= 1,
    maxVessels: effectivePlan >= 3 ? 999 : effectivePlan >= 2 ? 100 : 50, // Basic=50, Professional=100, Enterprise=unlimited
    maxPorts: effectivePlan >= 3 ? 999 : effectivePlan >= 2 ? 20 : 5, // Basic=5, Professional=20, Enterprise=unlimited
    maxRefineries: effectivePlan >= 3 ? 999 : effectivePlan >= 2 ? 25 : 10, // Basic=10, Professional=25, Enterprise=unlimited
    documentTypes: effectivePlan >= 3 
      ? ['LOI', 'B/L', 'SPA', 'ICPO', 'SGS', 'SDS', 'Q88', 'ATB', 'customs']
      : effectivePlan >= 2 
      ? ['LOI', 'B/L', 'SPA', 'ICPO']
      : ['LOI', 'SPA']
  };
}