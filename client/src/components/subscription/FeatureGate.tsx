import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Crown, Star, Zap } from 'lucide-react';
import { getSubscriptionStatus, checkFeatureAccess, createStripeCheckout } from '@/lib/subscriptionService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  requiredPlan?: string;
}

export function FeatureGate({ 
  feature, 
  children, 
  fallback, 
  showUpgradePrompt = true, 
  requiredPlan = "Pro Plan" 
}: FeatureGateProps) {
  const { toast } = useToast();
  
  const { data: status, isLoading } = useQuery({
    queryKey: ['/api/subscription-status'],
    queryFn: () => getSubscriptionStatus(),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const handleUpgrade = async () => {
    try {
      // Default to Pro Plan (ID: 3) for most upgrades
      await createStripeCheckout(3);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start upgrade process. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!status) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <Lock className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Unable to verify subscription status. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  const hasAccess = checkFeatureAccess(status, feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  // Custom fallback provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default upgrade prompt
  if (!showUpgradePrompt) {
    return null;
  }

  const getFeatureIcon = () => {
    switch (feature) {
      case 'broker_features':
        return <Crown className="h-8 w-8 text-orange-500" />;
      case 'analytics':
        return <Star className="h-8 w-8 text-purple-500" />;
      case 'export_data':
        return <Zap className="h-8 w-8 text-blue-500" />;
      default:
        return <Lock className="h-8 w-8 text-gray-500" />;
    }
  };

  const getFeatureTitle = () => {
    switch (feature) {
      case 'broker_features':
        return 'Broker Features';
      case 'analytics':
        return 'Advanced Analytics';
      case 'export_data':
        return 'Data Export';
      default:
        return 'Premium Feature';
    }
  };

  const getFeatureDescription = () => {
    switch (feature) {
      case 'broker_features':
        return 'Access broker dashboard, deal management, and commission tracking tools.';
      case 'analytics':
        return 'View detailed analytics, performance metrics, and business insights.';
      case 'export_data':
        return 'Export your data in various formats for external analysis.';
      default:
        return 'This feature requires a subscription upgrade.';
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {getFeatureIcon()}
        </div>
        <CardTitle className="text-xl">{getFeatureTitle()}</CardTitle>
        <CardDescription className="text-center">
          {getFeatureDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
          <p className="text-sm text-gray-700 mb-2">
            Upgrade to <span className="font-semibold text-blue-600">{requiredPlan}</span> to unlock this feature
          </p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Full access to all maritime data</li>
            <li>• Advanced reporting capabilities</li>
            <li>• Priority customer support</li>
            <li>• API access for integrations</li>
          </ul>
        </div>
        
        <Button onClick={handleUpgrade} className="w-full" size="lg">
          Upgrade Now
        </Button>
        
        {status.status === 'trial' && (
          <p className="text-xs text-gray-500">
            Your trial will expire soon. Upgrade to continue using all features.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface ResourceLimitGateProps {
  resource: 'vessels' | 'ports' | 'refineries';
  currentCount: number;
  children: React.ReactNode;
  onUpgrade?: () => void;
}

export function ResourceLimitGate({ 
  resource, 
  currentCount, 
  children, 
  onUpgrade 
}: ResourceLimitGateProps) {
  const { toast } = useToast();
  
  const { data: status, isLoading } = useQuery({
    queryKey: ['/api/subscription-status'],
    queryFn: () => getSubscriptionStatus(),
    staleTime: 1000 * 60 * 5,
  });

  const handleUpgrade = async () => {
    if (onUpgrade) {
      onUpgrade();
      return;
    }
    
    try {
      await createStripeCheckout(3); // Default to Pro Plan
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start upgrade process. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <LoadingSpinner />
      </div>
    );
  }

  if (!status) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <Lock className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Unable to verify subscription limits.
        </AlertDescription>
      </Alert>
    );
  }

  const limit = status[`max${resource.charAt(0).toUpperCase() + resource.slice(1)}` as keyof typeof status] as number;
  const hasCapacity = limit === -1 || currentCount < limit;

  if (hasCapacity) {
    return <>{children}</>;
  }

  const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <Lock className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        <div className="flex items-center justify-between">
          <span>
            You've reached your {resourceName.toLowerCase()} limit ({limit}). 
            Upgrade to add more {resource}.
          </span>
          <Button size="sm" onClick={handleUpgrade} className="ml-4">
            Upgrade
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

export default FeatureGate;