import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { getSubscriptionStatus, getUserSubscription, getDaysRemainingInTrial, createStripeCheckout } from '@/lib/subscriptionService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export function SubscriptionStatus() {
  const { toast } = useToast();
  
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/subscription-status'],
    queryFn: () => getSubscriptionStatus(),
  });

  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['/api/user-subscription'],
    queryFn: () => getUserSubscription(),
  });

  const handleUpgrade = async () => {
    try {
      // Default to Pro Plan for upgrades
      await createStripeCheckout(3); // Assuming Pro Plan has ID 3
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start upgrade process. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (statusLoading || subscriptionLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <LoadingSpinner />
      </div>
    );
  }

  if (!status || !subscription) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          No active subscription found. Please contact support or upgrade your account.
        </AlertDescription>
      </Alert>
    );
  }

  const getStatusIcon = () => {
    switch (subscription.status) {
      case 'trial':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'canceled':
      case 'past_due':
      case 'unpaid':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = () => {
    switch (subscription.status) {
      case 'trial':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'canceled':
      case 'past_due':
      case 'unpaid':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const isTrialStatus = subscription.status === 'trial';
  const daysRemaining = isTrialStatus ? getDaysRemainingInTrial(subscription) : 0;
  const trialProgress = isTrialStatus && subscription.plan.trialDays > 0 
    ? ((subscription.plan.trialDays - daysRemaining) / subscription.plan.trialDays) * 100 
    : 0;

  const shouldShowTrialWarning = isTrialStatus && daysRemaining <= 1;
  const shouldShowUpgradePrompt = subscription.status === 'canceled' || subscription.status === 'past_due' || shouldShowTrialWarning;

  return (
    <div className="space-y-4">
      {/* Trial Warning */}
      {shouldShowTrialWarning && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="flex items-center justify-between">
              <span>
                Your trial expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}. 
                Upgrade now to continue using all features.
              </span>
              <Button size="sm" onClick={handleUpgrade} className="ml-4">
                Upgrade Now
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Subscription Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <CardTitle className="text-lg">Subscription Status</CardTitle>
            </div>
            <Badge className={getStatusColor()}>
              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
            </Badge>
          </div>
          <CardDescription>
            Current plan: <span className="font-medium">{subscription.plan.name}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Trial Progress */}
          {isTrialStatus && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Trial Progress</span>
                <span>{subscription.plan.trialDays - daysRemaining} of {subscription.plan.trialDays} days used</span>
              </div>
              <Progress value={trialProgress} className="h-2" />
              <p className="text-sm text-gray-600">
                {daysRemaining > 0 ? (
                  <>Trial ends in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}</>
                ) : (
                  <>Trial has expired</>
                )}
              </p>
            </div>
          )}

          {/* Subscription Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="font-medium">Max Vessels:</span>
                <span className="ml-2">
                  {status.maxVessels === -1 ? 'Unlimited' : status.maxVessels}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">Max Ports:</span>
                <span className="ml-2">
                  {status.maxPorts === -1 ? 'Unlimited' : status.maxPorts}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">Max Refineries:</span>
                <span className="ml-2">
                  {status.maxRefineries === -1 ? 'Unlimited' : status.maxRefineries}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <span className="font-medium">Analytics:</span>
                <span className="ml-2">
                  {status.canAccessAnalytics ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">Data Export:</span>
                <span className="ml-2">
                  {status.canExportData ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">Broker Features:</span>
                <span className="ml-2">
                  {status.canAccessBrokerFeatures ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Renewal/Expiry Information */}
          {subscription.currentPeriodEnd && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                <span>
                  {subscription.status === 'active' ? 'Renews' : 'Expires'} {' '}
                  {formatDistanceToNow(new Date(subscription.currentPeriodEnd), { addSuffix: true })}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {shouldShowUpgradePrompt && (
            <div className="pt-4 border-t border-gray-200">
              <Button onClick={handleUpgrade} className="w-full">
                {subscription.status === 'trial' ? 'Upgrade Now' : 'Reactivate Subscription'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default SubscriptionStatus;