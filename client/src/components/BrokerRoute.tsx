import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import BrokerLocked from '@/pages/BrokerLocked';

interface BrokerRouteProps {
  children: React.ReactNode;
}

export default function BrokerRoute({ children }: BrokerRouteProps) {
  const { user } = useAuth();
  const { canAccessBrokerFeatures, isTrialExpired, hasActiveTrial } = useSubscription();

  // Admin users always have access
  if (user?.role === 'admin') {
    return <>{children}</>;
  }

  // If trial is expired and user doesn't have active subscription, block access
  if (isTrialExpired && !canAccessBrokerFeatures) {
    return <BrokerLocked />;
  }

  // If user has broker access (trial or paid), allow access
  if (canAccessBrokerFeatures) {
    return <>{children}</>;
  }

  // Default to locked page for users without proper subscription
  return <BrokerLocked />;
}