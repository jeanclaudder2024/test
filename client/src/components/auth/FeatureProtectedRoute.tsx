import React from "react";
import { Redirect, Route } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "wouter";

interface FeatureProtectedRouteProps {
  path: string;
  component: React.ComponentType;
  featureName?: string;
  fallbackPath?: string;
}

export function FeatureProtectedRoute({
  path,
  component: Component,
  featureName,
  fallbackPath = "/subscribe",
}: FeatureProtectedRouteProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { hasAccess, isLoading: featureLoading } = useFeatureAccess();
  const isLoading = authLoading || featureLoading;
  const [, navigate] = useNavigate();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  // Not logged in - redirect to auth page
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // If a specific feature is required and user doesn't have access
  if (featureName && !hasAccess(featureName)) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="max-w-md text-center">
            <ShieldAlert className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Feature Access Required</h1>
            <p className="text-muted-foreground mb-6">
              This feature requires a subscription plan with access to "{featureName}".
              Please upgrade your subscription to access this feature.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={() => navigate(fallbackPath)}>
                View Subscription Plans
              </Button>
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </Route>
    );
  }

  // User has access - render the component
  return <Component />;
}