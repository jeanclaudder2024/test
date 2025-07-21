import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useLocation } from 'wouter';
import { useEffect } from 'react';

interface BrokerRouteProps {
  children: React.ReactNode;
}

export default function BrokerRoute({ children }: BrokerRouteProps) {
  const { user } = useAuth();
  const { canAccessBrokerFeatures } = useSubscription();
  const [, setLocation] = useLocation();

  // Admin users always have access
  if (user?.role === 'admin') {
    return <>{children}</>;
  }

  // If user has just completed broker membership, allow access immediately
  const brokerMembershipCompleted = localStorage.getItem('brokerMembershipCompleted');
  if (brokerMembershipCompleted === 'true') {
    return <>{children}</>;
  }

  // If user has broker membership, allow access
  if (canAccessBrokerFeatures || user?.hasBrokerMembership) {
    return <>{children}</>;
  }

  // Redirect to broker membership purchase page
  useEffect(() => {
    setLocation('/broker-payment');
  }, [setLocation]);

  return null;
}