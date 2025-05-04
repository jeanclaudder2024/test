import { useClerk, useUser } from '@clerk/clerk-react';
import { Redirect, useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useUser();
  const { session } = useClerk();
  const [, setLocation] = useLocation();

  // Show loading spinner while Clerk is loading
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

  return <>{children}</>;
}