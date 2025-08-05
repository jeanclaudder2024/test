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

      {/* Plans Grid - Using Original Landing Page Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, index) => (
          <div 
            key={plan.id} 
            className={`backdrop-blur-sm rounded-xl border p-8 flex flex-col h-full transition-transform duration-300 hover:transform hover:-translate-y-2 relative overflow-hidden group ${
              isPopularPlan(plan.name) 
                ? 'bg-gradient-to-br from-[#003366]/80 to-[#00264d]/80 border-orange-500/30 transform scale-105 shadow-xl' 
                : 'bg-slate-900/50 border-slate-800/60'
            }`}
          >
            {isPopularPlan(plan.name) && (
              <div className="absolute top-0 right-0">
                <div className="bg-orange-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg shadow-md">
                  POPULAR
                </div>
              </div>
            )}
            
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              isPopularPlan(plan.name) 
                ? 'bg-gradient-to-br from-orange-500/5 to-blue-900/10' 
                : 'bg-gradient-to-br from-slate-800/10 to-slate-900/30'
            }`}></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-4">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">${calculatePrice(plan).toFixed(2)}</span>
                <span className="text-white/60 ml-2">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                {billingCycle === 'yearly' && (
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
              <p className="text-white/70 mb-8">{plan.description}</p>
              
              <ul className="space-y-3 mb-8">
                {plan.features?.slice(0, 6).map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-white/80">{feature.replace(/_/g, ' ')}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-auto">
                <Button 
                  className={`w-full mb-3 ${
                    isPopularPlan(plan.name) 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white border border-orange-600/50' 
                      : 'bg-white/10 hover:bg-white/20 border border-white/20 text-white'
                  }`}
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={currentPlanId === plan.id}
                >
                  {currentPlanId === plan.id ? 'Current Plan' : `Start ${plan.trialDays || 5}-Day Free Trial`}
                </Button>
                <p className="text-xs text-center text-white/50">No credit card required</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SubscriptionPlans;