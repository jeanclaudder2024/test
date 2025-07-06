import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface PricingPlan {
  id: number;
  name: string;
  slug: string;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  monthlyPriceId: string;
  yearlyPriceId: string;
  currency: string;
  features: PlanFeature[];
  isPopular: boolean;
  trialDays: number;
}

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Fetch subscription plans
  const { data: plans, isLoading, error } = useQuery({
    queryKey: ['/api/subscriptions/plans'],
    queryFn: async () => {
      try {
        const response = await apiRequest(
          'GET',
          '/api/subscriptions/plans'
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch subscription plans');
        }
        
        // Parse the JSON features string and transform data
        const plansData = await response.json();
        
        return plansData.map((plan: any) => ({
          ...plan,
          features: JSON.parse(plan.features || '[]').map((feature: string) => ({
            name: feature,
            included: true
          })),
        })).sort((a: PricingPlan, b: PricingPlan) => a.name.localeCompare(b.name));
      } catch (err) {
        console.error('Error fetching plans:', err);
        
        // Return fallback data for development purposes
        console.warn('Using fallback plan data while API is being fixed');
        return [
          {
            id: 1,
            name: "Basic",
            slug: "basic",
            description: "Essential tracking features for small operators",
            monthlyPrice: "49.99",
            yearlyPrice: "499.90",
            currency: "usd",
            features: [
              { name: "Track up to 50 vessels", included: true },
              { name: "Real-time vessel positions", included: true },
              { name: "Basic reporting", included: true },
              { name: "Email support", included: true },
              { name: "Data export (CSV)", included: true }
            ],
            isPopular: false,
            trialDays: 5
          },
          {
            id: 2,
            name: "Professional",
            slug: "pro",
            description: "Advanced features for medium-sized fleets",
            monthlyPrice: "99.99",
            yearlyPrice: "999.90",
            currency: "usd",
            features: [
              { name: "Track up to 200 vessels", included: true },
              { name: "Real-time vessel positions", included: true },
              { name: "Advanced analytics dashboard", included: true },
              { name: "API access", included: true },
              { name: "Priority email support", included: true },
              { name: "Data export (CSV, JSON)", included: true },
              { name: "Historical data (12 months)", included: true },
              { name: "Custom alerts", included: true }
            ],
            isPopular: true,
            trialDays: 5
          },
          {
            id: 3,
            name: "Enterprise",
            slug: "enterprise",
            description: "Comprehensive solution for large operations",
            monthlyPrice: "249.99",
            yearlyPrice: "2499.90",
            currency: "usd",
            features: [
              { name: "Unlimited vessel tracking", included: true },
              { name: "Real-time vessel positions", included: true },
              { name: "Enterprise analytics", included: true },
              { name: "Full API access", included: true },
              { name: "24/7 dedicated support", included: true },
              { name: "Data export (all formats)", included: true },
              { name: "Historical data (unlimited)", included: true },
              { name: "Custom alerts and notifications", included: true },
              { name: "White-label options", included: true },
              { name: "Custom integrations", included: true },
              { name: "Dedicated account manager", included: true }
            ],
            isPopular: false,
            trialDays: 5
          }
        ];
      }
    }
  });

  // Handle subscription checkout
  const handleSubscribe = async (planId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive",
      });
      navigate('/login?redirect=/pricing');
      return;
    }

    try {
      const response = await apiRequest(
        'POST',
        '/api/subscriptions/create-checkout-session',
        { planId, interval: billingInterval }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      // Redirect to the Stripe Checkout page
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Subscription Error",
        description: error instanceof Error ? error.message : "Failed to process subscription request",
        variant: "destructive",
      });
    }
  };

  // Format currency display
  const formatCurrency = (amount: string, currency: string) => {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount)) {
      return `$${amount}`;
    }

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    return formatter.format(numAmount);
  };

  if (isLoading) {
    return (
      <div className="container py-12 mx-auto">
        <div className="flex flex-col items-center justify-center mb-12">
          <Skeleton className="w-[120px] h-[30px] mb-2" />
          <Skeleton className="w-[250px] h-[24px] mb-6" />
          <Skeleton className="w-[100px] h-[30px]" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader>
                <Skeleton className="w-[100px] h-[28px] mb-2" />
                <Skeleton className="w-[180px] h-[20px]" />
              </CardHeader>
              <CardContent className="flex-grow">
                <Skeleton className="w-[150px] h-[36px] mb-4" />
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <Skeleton key={j} className="w-full h-[20px]" />
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="w-full h-[40px]" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-12 mx-auto">
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Plans</h2>
          <p className="text-gray-600 mb-6">
            {error instanceof Error ? error.message : "An error occurred while loading subscription plans."}
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12 mx-auto">
      <div className="flex flex-col items-center justify-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Maritime Intelligence Pricing
        </h1>
        <p className="text-muted-foreground mb-6 text-center max-w-2xl">
          Choose the perfect plan for your maritime tracking and intelligence needs
        </p>
        
        <div className="flex items-center space-x-2">
          <Label htmlFor="billing-toggle" className={cn(
            "text-sm font-medium",
            billingInterval === 'month' ? "text-primary" : "text-muted-foreground"
          )}>
            Monthly Billing
          </Label>
          <Switch
            id="billing-toggle"
            checked={billingInterval === 'year'}
            onCheckedChange={(checked) => setBillingInterval(checked ? 'year' : 'month')}
          />
          <Label htmlFor="billing-toggle" className={cn(
            "text-sm font-medium flex items-center space-x-1.5",
            billingInterval === 'year' ? "text-primary" : "text-muted-foreground"
          )}>
            <span>Annual Billing</span>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Save 15%
            </Badge>
          </Label>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        {plans?.map((plan) => {
          const price = billingInterval === 'month' 
            ? plan.monthlyPrice 
            : plan.yearlyPrice;
            
          return (
            <Card key={plan.id} className={cn(
              "flex flex-col",
              plan.isPopular && "border-primary shadow-md"
            )}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription className="mt-1.5">{plan.description}</CardDescription>
                  </div>
                  {plan.isPopular && (
                    <Badge className="bg-primary hover:bg-primary">Popular</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold">
                    {formatCurrency(price, plan.currency)}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    /{billingInterval}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start">
                      <div className="mr-2 mt-1">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <span className={cn(
                        "text-sm",
                        !feature.included && "text-muted-foreground line-through"
                      )}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
                
                {plan.trialDays > 0 && (
                  <p className="text-sm text-muted-foreground mt-4">
                    Includes {plan.trialDays} day free trial
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleSubscribe(plan.id)}
                  className={cn(
                    "w-full",
                    plan.isPopular ? "bg-primary hover:bg-primary/90" : ""
                  )}
                >
                  Subscribe to {plan.name}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      <div className="mt-12 mx-auto max-w-3xl text-center">
        <h3 className="text-xl font-semibold mb-2">Enterprise Solutions</h3>
        <p className="text-muted-foreground mb-4">
          Need a custom solution for your large maritime operations? Contact our sales team for a tailored package.
        </p>
        <Button variant="outline" onClick={() => navigate('/contact')}>
          Contact Sales
        </Button>
      </div>
    </div>
  );
}