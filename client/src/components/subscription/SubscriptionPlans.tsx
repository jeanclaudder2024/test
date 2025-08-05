import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
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
      
      const selectedInterval = billingCycle === 'yearly' ? 'year' : 'month';
      await createStripeCheckout(planId, selectedInterval);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start checkout process. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const calculatePrice = (plan: any) => {
    const basePrice = plan.monthlyPrice ? parseFloat(plan.monthlyPrice) : parseFloat(plan.price || '0');
    
    if (billingCycle === 'yearly') {
      if (plan.yearlyPrice) {
        return parseFloat(plan.yearlyPrice);
      }
      // Calculate yearly with 20% discount if no yearlyPrice is set
      return basePrice * 12 * 0.8;
    }
    return basePrice;
  };

  const calculateSavings = (plan: any) => {
    const basePrice = plan.monthlyPrice ? parseFloat(plan.monthlyPrice) : parseFloat(plan.price || '0');
    const monthlyTotal = basePrice * 12;
    const yearlyPrice = plan.yearlyPrice ? parseFloat(plan.yearlyPrice) : (basePrice * 12 * 0.8);
    return monthlyTotal - yearlyPrice;
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
    <div className="space-y-8">
      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
          <div className="flex items-center">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all relative ${
                billingCycle === 'yearly'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Yearly
              <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5">
                Save 20%
              </Badge>
            </button>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
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
              <div className="text-3xl font-bold text-white">
                ${calculatePrice(plan).toFixed(2)}
              </div>
              <div className="text-white/60 text-sm">
                per {billingCycle === 'yearly' ? 'year' : 'month'}
              </div>
              {billingCycle === 'yearly' && plan.monthlyPrice && (
                <div className="text-green-400 text-sm mt-1">
                  Save ${calculateSavings(plan).toFixed(2)} per year
                </div>
              )}
              {billingCycle === 'monthly' && (
                <div className="text-white/40 text-xs mt-1">
                  ${(calculatePrice(plan) * 12).toFixed(2)} billed annually
                </div>
              )}
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
    </div>
  );
}

export default SubscriptionPlans;