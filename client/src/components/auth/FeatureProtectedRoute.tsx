import { Redirect, Route } from "wouter";
import { ReactElement } from "react";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";
import { Link } from "wouter";

interface FeatureProtectedRouteProps {
  path: string;
  component: () => ReactElement;
  featureName: string;
  fallbackPath?: string;
}

/**
 * Route component that checks feature access before rendering
 * If user doesn't have access to the feature, they are redirected to the subscription plans page
 * or a custom fallback path
 */
export function FeatureProtectedRoute({
  path,
  component: Component,
  featureName,
  fallbackPath = "/subscribe"
}: FeatureProtectedRouteProps) {
  const { hasAccess, isLoading } = useFeatureAccess();
  const { user, isLoading: authLoading } = useAuth();
  
  // Combined loading state
  const loading = isLoading || authLoading;

  return (
    <Route path={path}>
      {() => {
        if (loading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }
        
        const hasFeatureAccess = hasAccess(featureName);
        
        if (!hasFeatureAccess) {
          // If user is logged in but doesn't have feature access, show subscription upgrade prompt
          if (user) {
            return (
              <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="max-w-md text-center p-8 border rounded-lg shadow-lg">
                  <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h2 className="text-2xl font-bold mb-4">Feature Not Available</h2>
                  <p className="mb-6 text-muted-foreground">
                    This feature requires a higher subscription tier. Upgrade your plan to access this feature.
                  </p>
                  <Button asChild>
                    <Link href="/subscribe">Upgrade Subscription</Link>
                  </Button>
                </div>
              </div>
            );
          }
          
          // Otherwise redirect to the fallback path
          return <Redirect to={fallbackPath} />;
        }
        
        return <Component />;
      }}
    </Route>
  );
}