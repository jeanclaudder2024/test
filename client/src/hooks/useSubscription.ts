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
  maxPorts: number;
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

  // For trial users, give them FULL access (like Enterprise plan)
  const effectivePlan = hasActiveTrial ? 3 : planId; // Give trial users Enterprise level access

  return {
    hasBasicAccess: hasActiveSubscription || hasActiveTrial || effectivePlan >= 1,
    hasProfessionalAccess: hasActiveSubscription || hasActiveTrial || effectivePlan >= 2,
    hasEnterpriseAccess: hasActiveSubscription || hasActiveTrial || effectivePlan >= 3,
    hasTrialAccess: hasActiveTrial,
    isTrialExpired: trialExpired || trialDaysRemaining === 0,
    trialDaysRemaining,
    canAccessBrokerFeatures: hasActiveSubscription || hasActiveTrial || effectivePlan >= 2,
    canAccessAllZones: hasActiveSubscription || hasActiveTrial || effectivePlan >= 3,
    canGenerateDocuments: hasActiveSubscription || hasActiveTrial || effectivePlan >= 1,
    maxPorts: effectivePlan >= 3 ? 999 : effectivePlan >= 2 ? 50 : 15, // Trial users get unlimited ports
    documentTypes: effectivePlan >= 3 
      ? ['LOI', 'B/L', 'SPA', 'ICPO', 'SGS', 'SDS', 'Q88', 'ATB', 'customs']
      : effectivePlan >= 2 
      ? ['LOI', 'B/L', 'SPA', 'ICPO']
      : ['LOI', 'SPA']
  };
}