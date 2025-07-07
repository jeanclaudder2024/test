import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Crown, Zap, Users, ArrowRight } from 'lucide-react';
import { getSubscriptionPlans, getSubscriptionStatus } from '@/lib/subscriptionService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

export default function SubscriptionPlansPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Mock data for frontend testing - no backend calls
  const plans = [
    {
      id: 1,
      name: 'Free Trial',
      price: 0,
      description: 'Try our platform for 3 days',
      features: ['Real-time vessel tracking', 'Basic analytics', '5 vessel limit'],
      maxVessels: 5,
      maxPorts: 10,
      maxRefineries: 5,
      isPopular: false
    },
    {
      id: 2,
      name: 'Professional',
      price: 29,
      description: 'Perfect for maritime professionals',
      features: ['All vessel tracking', 'Advanced analytics', 'Document generation', 'Priority support'],
      maxVessels: -1,
      maxPorts: -1,
      maxRefineries: -1,
      isPopular: true
    },
    {
      id: 3,
      name: 'Enterprise',
      price: 99,
      description: 'For large maritime organizations',
      features: ['Everything in Professional', 'API access', 'Custom integrations', 'Dedicated support'],
      maxVessels: -1,
      maxPorts: -1,
      maxRefineries: -1,
      isPopular: false
    }
  ];

  const plansLoading = false;

  const handleSelectPlan = async (planId: number) => {
    // Store selected plan in localStorage for payment page
    const selectedPlan = plans.find(p => p.id === planId);
    if (selectedPlan) {
      localStorage.setItem('selectedPlan', JSON.stringify(selectedPlan));
    }
    
    // Show success message and redirect
    toast({
      title: 'Plan Selected!',
      description: `You've chosen the ${selectedPlan?.name} plan. Redirecting to payment...`,
    });
    
    // Redirect to payment methods page
    setTimeout(() => {
      setLocation('/payment');
    }, 1000);
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free trial':
        return <Star className="h-6 w-6 text-blue-600" />;
      case 'basic plan':
        return <Check className="h-6 w-6 text-green-600" />;
      case 'pro plan':
        return <Zap className="h-6 w-6 text-purple-600" />;
      case 'enterprise':
        return <Crown className="h-6 w-6 text-orange-600" />;
      case 'broker premium':
        return <Users className="h-6 w-6 text-red-600" />;
      default:
        return <Check className="h-6 w-6 text-gray-600" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free trial':
        return 'from-blue-500 to-blue-700';
      case 'basic plan':
        return 'from-green-500 to-green-700';
      case 'pro plan':
        return 'from-purple-500 to-purple-700';
      case 'enterprise':
        return 'from-orange-500 to-orange-700';
      case 'broker premium':
        return 'from-red-500 to-red-700';
      default:
        return 'from-gray-500 to-gray-700';
    }
  };

  if (plansLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock the full potential of maritime tracking with our comprehensive subscription plans.
            Start with a free trial and upgrade when you're ready.
          </p>
          

        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden transform hover:scale-105 transition-all duration-300 ${
                plan.name === 'Pro Plan' ? 'border-2 border-purple-500 shadow-2xl' : 'shadow-lg'
              }`}
            >
              {plan.name === 'Pro Plan' && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-purple-700 text-white text-center py-2 text-sm font-semibold">
                  Most Popular
                </div>
              )}
              
              <CardHeader className={`relative ${plan.name === 'Pro Plan' ? 'pt-12' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getPlanIcon(plan.name)}
                    <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                  </div>
                  {plan.name === 'Free Trial' && (
                    <Badge className="bg-blue-100 text-blue-800">Free</Badge>
                  )}
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    ${plan.price}
                    {plan.price > 0 && <span className="text-lg text-gray-600 font-normal">/month</span>}
                  </div>
                  {plan.name === 'Free Trial' && (
                    <p className="text-sm text-gray-600">3-day trial period</p>
                  )}
                </div>
                
                <CardDescription className="text-center mt-4">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Resource Limits */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Resource Limits</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">
                        {plan.maxVessels === -1 ? '∞' : plan.maxVessels}
                      </div>
                      <div className="text-gray-600">Vessels</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">
                        {plan.maxPorts === -1 ? '∞' : plan.maxPorts}
                      </div>
                      <div className="text-gray-600">Ports</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">
                        {plan.maxRefineries === -1 ? '∞' : plan.maxRefineries}
                      </div>
                      <div className="text-gray-600">Refineries</div>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full bg-gradient-to-r ${getPlanColor(plan.name)} hover:opacity-90 transition-opacity`}
                  size="lg"
                >
                  {plan.price === 0 ? 'Start Free Trial' : `Upgrade to ${plan.name}`}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I change plans later?</h3>
                <p className="text-gray-600 text-sm">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What happens after my trial ends?</h3>
                <p className="text-gray-600 text-sm">
                  Your account will be restricted until you choose a paid plan. Your data remains safe.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Do you offer refunds?</h3>
                <p className="text-gray-600 text-sm">
                  Yes, we offer a 30-day money-back guarantee for all paid plans.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Is my data secure?</h3>
                <p className="text-gray-600 text-sm">
                  Absolutely. We use enterprise-grade security and comply with maritime industry standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}