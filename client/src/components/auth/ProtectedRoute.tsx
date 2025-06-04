import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
  adminOnly?: boolean;
  brokerOnly?: boolean;
  feature?: string;
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  requiresAuth = true,
  adminOnly = false,
  brokerOnly = false,
  feature,
  redirectTo = '/login'
}: ProtectedRouteProps) => {
  const { user, profile, loading, isAdmin, isBroker, canAccessFeature } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (loading) return;

    // Check authentication requirement
    if (requiresAuth && !user) {
      setLocation(redirectTo);
      return;
    }

    // Check admin requirement
    if (adminOnly && !isAdmin) {
      setLocation('/dashboard');
      return;
    }

    // Check broker requirement
    if (brokerOnly && !isBroker) {
      setLocation('/dashboard');
      return;
    }

    // Check feature access
    if (feature && !canAccessFeature(feature)) {
      setLocation('/subscription');
      return;
    }
  }, [user, profile, loading, isAdmin, isBroker, requiresAuth, adminOnly, brokerOnly, feature, redirectTo, setLocation, canAccessFeature]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // If not authenticated and auth is required, don't render anything (redirect will happen)
  if (requiresAuth && !user) {
    return null;
  }

  // If admin access required but user is not admin, don't render
  if (adminOnly && !isAdmin) {
    return null;
  }

  // If broker access required but user is not broker, don't render
  if (brokerOnly && !isBroker) {
    return null;
  }

  // If feature access required but user doesn't have access, don't render
  if (feature && !canAccessFeature(feature)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;