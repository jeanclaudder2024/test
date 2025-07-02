import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckIcon, Crown, Zap, Building, Users } from 'lucide-react';
import { getSubscriptionPlans, createStripeCheckout, formatPrice } from '@/lib/subscriptionService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionPlansProps {
  currentPlanId?: number;
  onSelectPlan?: (planId: number) => void;
}

export function SubscriptionPlans({ currentPlanId, onSelectPlan }: SubscriptionPlansProps) {
  const { toast } = useToast();
  const { data: plans, isLoading } = useQuery({
    queryKey: ['/api/subscription-plans'],
    queryFn: () => getSubscriptionPlans(),
  });

  const handleSelectPlan = async (planId: number, interval: 'month' | 'year' = 'month') => {
    try {
      if (onSelectPlan) {
        onSelectPlan(planId);
        return;
      }
      
      await createStripeCheckout(planId, interval);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start checkout process. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'basic plan':
        return <Zap className="h-6 w-6 text-blue-600" />;
      case 'pro plan':
        return <Crown className="h-6 w-6 text-purple-600" />;
      case 'enterprise':
        return <Building className="h-6 w-6 text-green-600" />;
      case 'broker premium':
        return <Users className="h-6 w-6 text-orange-600" />;
      default:
        return <CheckIcon className="h-6 w-6 text-gray-600" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'basic plan':
        return 'border-blue-200 bg-blue-50';
      case 'pro plan':
        return 'border-purple-200 bg-purple-50';
      case 'enterprise':
        return 'border-green-200 bg-green-50';
      case 'broker premium':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const isPopularPlan = (planName: string) => {
    return planName.toLowerCase() === 'pro plan';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No subscription plans available.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {plans.map((plan) => (
        <Card 
          key={plan.id} 
          className={`relative transition-all duration-200 hover:shadow-lg ${
            currentPlanId === plan.id ? 'ring-2 ring-blue-500' : ''
          } ${getPlanColor(plan.name)}`}
        >
          {isPopularPlan(plan.name) && (
            <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              Most Popular
            </Badge>
          )}
          
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-3">
              {getPlanIcon(plan.name)}
            </div>
            <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
            <CardDescription className="text-sm text-gray-600">
              {plan.description}
            </CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(plan.price)}
              </span>
              <span className="text-gray-600 ml-1">/{plan.interval}</span>
            </div>
            {plan.trialDays > 0 && (
              <Badge variant="outline" className="mt-2">
                {plan.trialDays}-day free trial
              </Badge>
            )}
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span>Vessels</span>
                <span className="font-medium">
                  {plan.maxVessels === -1 ? 'Unlimited' : plan.maxVessels}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Ports</span>
                <span className="font-medium">
                  {plan.maxPorts === -1 ? 'Unlimited' : plan.maxPorts}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Refineries</span>
                <span className="font-medium">
                  {plan.maxRefineries === -1 ? 'Unlimited' : plan.maxRefineries}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <h4 className="font-medium text-sm mb-2">Features included:</h4>
              <ul className="space-y-1 text-sm">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span className="capitalize">{feature.replace(/_/g, ' ')}</span>
                  </li>
                ))}
                {plan.canAccessAnalytics && (
                  <li className="flex items-center">
                    <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Advanced Analytics</span>
                  </li>
                )}
                {plan.canExportData && (
                  <li className="flex items-center">
                    <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Data Export</span>
                  </li>
                )}
                {plan.canAccessBrokerFeatures && (
                  <li className="flex items-center">
                    <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Broker Tools</span>
                  </li>
                )}
              </ul>
            </div>
          </CardContent>

          <CardFooter>
            <Button
              onClick={() => handleSelectPlan(plan.id)}
              className="w-full"
              variant={currentPlanId === plan.id ? "outline" : "default"}
              disabled={currentPlanId === plan.id}
            >
              {currentPlanId === plan.id ? 'Current Plan' : 'Select Plan'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default SubscriptionPlans;