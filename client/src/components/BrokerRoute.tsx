import { ReactNode } from 'react';
import { useBrokerSubscription } from '@/hooks/useBrokerSubscription';
import BrokerLocked from '@/pages/BrokerLocked';

interface BrokerRouteProps {
  children: ReactNode;
}

export default function BrokerRoute({ children }: BrokerRouteProps) {
  const { subscriptionStatus, isLoading, hasAccess } = useBrokerSubscription();

  // Show loading while checking subscription status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Checking subscription status...</p>
        </div>
      </div>
    );
  }

  // If user doesn't have active subscription, show locked page
  if (!hasAccess) {
    return <BrokerLocked />;
  }

  // User has access, show the protected content
  return <>{children}</>;
}