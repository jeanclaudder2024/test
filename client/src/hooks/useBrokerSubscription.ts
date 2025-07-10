import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useSubscription } from './useSubscription';

interface BrokerSubscriptionStatus {
  hasActiveSubscription: boolean;
  membershipStatus: 'pending' | 'active' | 'expired' | 'cancelled';
  membershipExpiresAt: string | null;
  isProfileComplete: boolean;
  cardNumber: string | null;
}

export function useBrokerSubscription() {
  const { user } = useAuth();
  const { canAccessBrokerFeatures } = useSubscription();
  
  const { data, isLoading, error } = useQuery<BrokerSubscriptionStatus>({
    queryKey: ['/api/broker/subscription-status'],
    enabled: !!user,
    retry: false,
  });

  // FIXED: Use corrected subscription logic - only PAID Professional+ plans get broker access
  const hasAccess = canAccessBrokerFeatures || (user?.role === 'admin');

  return {
    subscriptionStatus: data,
    isLoading,
    error,
    hasAccess,
    needsUpgrade: !hasAccess,
    isExpired: data?.membershipStatus === 'expired'
  };
}