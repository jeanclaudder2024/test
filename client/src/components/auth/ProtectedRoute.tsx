import { useClerk, useUser } from '@clerk/clerk-react';
import { Redirect, useLocation, Route } from 'wouter';
import { Loader2 } from 'lucide-react';
import { ComponentType } from 'react';

// Support both legacy props (for existing routes) and children props (for newer components)
interface ProtectedRouteProps {
  path?: string;
  component?: ComponentType<any>;
  children?: React.ReactNode;
}

export function ProtectedRoute({ path, component: Component, children }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useUser();
  const { session } = useClerk();
  const [, setLocation] = useLocation();

  // Handle loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not signed in, redirect to login page
  if (!isSignedIn) {
    return <Redirect to="/login" />;
  }

  // Support both usage patterns:
  // 1. <ProtectedRoute path="/path" component={Component} />
  // 2. <ProtectedRoute>...</ProtectedRoute>
  if (path && Component) {
    return <Route path={path} component={Component} />;
  }

  return <>{children}</>;
}