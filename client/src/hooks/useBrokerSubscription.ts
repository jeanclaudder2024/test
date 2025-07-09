import { useQuery } from '@tanstack/react-query';

interface BrokerSubscriptionStatus {
  hasActiveSubscription: boolean;
  membershipStatus: 'pending' | 'active' | 'expired' | 'cancelled';
  membershipExpiresAt: string | null;
  isProfileComplete: boolean;
  cardNumber: string | null;
}

export function useBrokerSubscription() {
  const { data, isLoading, error } = useQuery<BrokerSubscriptionStatus>({
    queryKey: ['/api/broker/subscription-status'],
    retry: false,
  });

  return {
    subscriptionStatus: data,
    isLoading,
    error,
    hasAccess: data?.hasActiveSubscription || false,
    needsUpgrade: !data?.hasActiveSubscription && data?.isProfileComplete === false,
    isExpired: data?.membershipStatus === 'expired'
  };
}