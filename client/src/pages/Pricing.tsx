import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, X, Ship, MapPin, Building2, BarChart3, FileText, Users, Globe, Shield, ChevronDown, Zap, Crown, Star } from 'lucide-react';
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
  const [showComparison, setShowComparison] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Fetch subscription plans (no cache to always get latest)
  const { data: plans, isLoading, error } = useQuery({
    queryKey: ['/api/subscription-plans'],
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache the results
    queryFn: async () => {
      try {
        const response = await apiRequest(
          'GET',
          '/api/subscription-plans'
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch subscription plans');
        }
        
        // Parse the response from the public API
        const plansData = await response.json();
        
        return plansData.map((plan: any) => ({
          id: plan.id,
          name: plan.name,
          slug: plan.name.toLowerCase().replace(/\s+/g, '-'),
          description: plan.description,
          monthlyPrice: parseFloat(plan.price).toString(),
          yearlyPrice: (parseFloat(plan.price) * 12 * 0.8).toFixed(0), // 20% discount for yearly
          monthlyPriceId: plan.stripePriceId || `price_${plan.id}_monthly`,
          yearlyPriceId: plan.stripePriceId ? plan.stripePriceId.replace('monthly', 'yearly') : `price_${plan.id}_yearly`,
          currency: 'usd',
          features: Array.isArray(plan.features) ? plan.features.map((feature: string) => ({
            name: feature,
            included: true
          })) : [],
          isPopular: plan.id === 2, // Professional plan is popular
          trialDays: plan.trialDays || 5
        })).sort((a: PricingPlan, b: PricingPlan) => a.id - b.id);
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
            trialDays: 14
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
            trialDays: 14
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
            trialDays: 30
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
      // Get the plan data to find the price ID
      const plan = plans?.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      const priceId = billingInterval === 'month' ? plan.monthlyPriceId : plan.yearlyPriceId;

      console.log('Creating checkout session for:', { planId, priceId, billingInterval });

      const response = await apiRequest(
        'POST',
        '/api/create-checkout-session',
        { 
          planId, 
          interval: billingInterval 
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create checkout session');
      }

      const data = await response.json();
      
      // Redirect to Stripe checkout with better error handling
      const checkoutUrl = data.url || data.redirectUrl;
      
      console.log('Checkout response data:', data);
      console.log('Attempting to redirect to:', checkoutUrl);
      console.log('Window context check - parent:', window.parent !== window, 'top:', window.top !== window);
      
      if (checkoutUrl && typeof checkoutUrl === 'string' && checkoutUrl.length > 0) {
        // Check if we're in a restricted environment (like Replit iframe)
        try {
          // Force immediate top-level navigation to prevent iFrame issues
          if (window.parent && window.parent !== window) {
            // We're in an iframe - force parent navigation
            console.log('Detected iframe - using parent.location');
            window.parent.location.href = checkoutUrl;
          } else if (window.top && window.top !== window) {
            // Alternative iframe detection
            console.log('Detected iframe - using top.location');
            window.top.location.href = checkoutUrl;
          } else {
            // Direct navigation for non-iframe context
            console.log('Using direct navigation - window.location.replace');
            window.location.replace(checkoutUrl);
          }
        } catch (securityError) {
          console.warn('Security error with iframe navigation, opening in new tab:', securityError);
          // If we can't access parent/top due to security restrictions, open in new tab
          const newWindow = window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
          if (newWindow) {
            toast({
              title: "Checkout Opened",
              description: "Stripe checkout opened in a new tab. Please complete your payment there.",
            });
          } else {
            toast({
              title: "Popup Blocked",
              description: "Please allow popups and try again, or copy this URL to complete payment: " + checkoutUrl,
              variant: "destructive",
            });
          }
        }
      } else if (data.sessionId) {
        // Fallback: construct URL manually if needed
        const fallbackUrl = `https://checkout.stripe.com/c/pay/${data.sessionId}`;
        try {
          if (window.parent && window.parent !== window) {
            window.parent.location.href = fallbackUrl;
          } else if (window.top && window.top !== window) {
            window.top.location.href = fallbackUrl;
          } else {
            window.location.replace(fallbackUrl);
          }
        } catch (securityError) {
          window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
          toast({
            title: "Checkout Opened",
            description: "Stripe checkout opened in a new tab.",
          });
        }
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to start checkout process. Please try again.",
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
        <Badge variant="outline" className="px-4 py-2 bg-blue-500/20 text-blue-400 border-blue-500/30 backdrop-blur-sm mb-6 inline-flex items-center">
          <div className="w-2 h-2 rounded-full bg-blue-400 mr-2 animate-pulse"></div>
          Choose the Plan That Fits Your Petroleum Trading Needs
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Flexible Subscription Plans
        </h1>
        <p className="text-muted-foreground mb-6 text-center max-w-2xl">
          Whether you're an individual broker or a global trading company, PetroDealHub provides 
          flexible subscription plans tailored to your scale of operations, market access, and trading goals.
        </p>
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-4 text-sm text-slate-500">
            <span>✅ 5-Day free trial for every plan</span>
            <span>•</span>
            <span>✅ No credit card required</span>
            <span>•</span>
            <span>✅ Cancel anytime</span>
          </div>
        </div>
        
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
              Save 20%
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
      
      {/* Expandable Plan Comparison Button */}
      <div className="mt-16 mx-auto max-w-4xl text-center">
        <Button
          onClick={() => setShowComparison(!showComparison)}
          variant="outline"
          size="lg"
          className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 text-blue-800 font-semibold px-8 py-4 text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <BarChart3 className="w-6 h-6 mr-3" />
          {showComparison ? 'Hide' : 'View'} Detailed Plan Comparison
          <ChevronDown className={cn(
            "w-5 h-5 ml-3 transition-transform duration-300",
            showComparison && "rotate-180"
          )} />
        </Button>
        <p className="text-sm text-muted-foreground mt-3">
          Compare all features side-by-side to find your perfect plan
        </p>
      </div>

      {/* Expandable Plan Comparison Section */}
      {showComparison && (
        <div className="mt-12 mx-auto max-w-7xl animate-in slide-in-from-top-4 duration-500">
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-blue-100 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 text-center">
              <h2 className="text-3xl font-bold mb-2">Professional Plan Comparison</h2>
              <p className="text-blue-100 text-lg">
                Choose the perfect maritime solution for your business needs
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-blue-200">
                    <th className="text-left p-6 font-bold text-gray-900 text-lg">Features & Capabilities</th>
                    {plans?.map((plan, index) => (
                      <th key={plan.id} className="text-center p-6 min-w-[200px]">
                        <div className="flex flex-col items-center space-y-3">
                          <div className="flex items-center space-x-2">
                            {index === 0 && <Zap className="w-6 h-6 text-orange-500" />}
                            {index === 1 && <Star className="w-6 h-6 text-blue-500" />}
                            {index === 2 && <Crown className="w-6 h-6 text-purple-500" />}
                            <span className="text-xl font-bold text-gray-900">{plan.name}</span>
                          </div>
                          <div className="bg-white rounded-lg px-4 py-2 shadow-sm border">
                            <span className="text-2xl font-bold text-blue-600">
                              {formatCurrency(billingInterval === 'month' ? plan.monthlyPrice : plan.yearlyPrice, plan.currency)}
                            </span>
                            <span className="text-gray-600 text-sm">/{billingInterval}</span>
                          </div>
                          {plan.isPopular && (
                            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-lg">
                              ⭐ Most Popular
                            </Badge>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {/* Vessel Tracking */}
                  <tr className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-25 hover:to-indigo-25 transition-all duration-200">
                    <td className="p-6 font-semibold text-gray-900 flex items-center text-lg">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <Ship className="w-6 h-6 text-blue-600" />
                      </div>
                      Vessel Tracking Capacity
                    </td>
                    <td className="p-6 text-center">
                      <div className="bg-orange-50 rounded-lg py-2 px-4 inline-block">
                        <span className="font-bold text-orange-700">50 vessels</span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="bg-blue-50 rounded-lg py-2 px-4 inline-block">
                        <span className="font-bold text-blue-700">200 vessels</span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="bg-purple-50 rounded-lg py-2 px-4 inline-block">
                        <span className="font-bold text-purple-700">Unlimited</span>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Real-time Positions */}
                  <tr className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-green-25 hover:to-emerald-25 transition-all duration-200">
                    <td className="p-6 font-semibold text-gray-900 flex items-center text-lg">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                        <MapPin className="w-6 h-6 text-green-600" />
                      </div>
                      Real-time Vessel Positions
                    </td>
                    <td className="p-6 text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-6 h-6 text-green-600" />
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-6 h-6 text-green-600" />
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-6 h-6 text-green-600" />
                      </div>
                    </td>
                  </tr>
                  
                  {/* Port & Refinery Access */}
                  <tr className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-purple-25 hover:to-pink-25 transition-all duration-200">
                    <td className="p-6 font-semibold text-gray-900 flex items-center text-lg">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                        <Building2 className="w-6 h-6 text-purple-600" />
                      </div>
                      Maritime Infrastructure Access
                    </td>
                    <td className="p-6 text-center">
                      <div className="bg-orange-50 rounded-lg py-2 px-4 inline-block">
                        <span className="font-medium text-orange-700">Regional Access</span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="bg-blue-50 rounded-lg py-2 px-4 inline-block">
                        <span className="font-medium text-blue-700">Full Network</span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="bg-purple-50 rounded-lg py-2 px-4 inline-block">
                        <span className="font-medium text-purple-700">Global Coverage</span>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Broker Features */}
                  <tr className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-red-25 hover:to-rose-25 transition-all duration-200">
                    <td className="p-6 font-semibold text-gray-900 flex items-center text-lg">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                        <Users className="w-6 h-6 text-red-600" />
                      </div>
                      Professional Broker Tools
                    </td>
                    <td className="p-6 text-center">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <X className="w-6 h-6 text-red-600" />
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-6 h-6 text-green-600" />
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-6 h-6 text-green-600" />
                      </div>
                    </td>
                  </tr>
                  
                  {/* Analytics Dashboard */}
                  <tr className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-orange-25 hover:to-amber-25 transition-all duration-200">
                    <td className="p-6 font-semibold text-gray-900 flex items-center text-lg">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                        <BarChart3 className="w-6 h-6 text-orange-600" />
                      </div>
                      Analytics & Reporting
                    </td>
                    <td className="p-6 text-center">
                      <div className="bg-orange-50 rounded-lg py-2 px-4 inline-block">
                        <span className="font-medium text-orange-700">Basic Reports</span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="bg-blue-50 rounded-lg py-2 px-4 inline-block">
                        <span className="font-medium text-blue-700">Advanced Analytics</span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="bg-purple-50 rounded-lg py-2 px-4 inline-block">
                        <span className="font-medium text-purple-700">Enterprise Intelligence</span>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Document Generation */}
                  <tr className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-indigo-25 hover:to-blue-25 transition-all duration-200">
                    <td className="p-6 font-semibold text-gray-900 flex items-center text-lg">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                        <FileText className="w-6 h-6 text-indigo-600" />
                      </div>
                      Document Generation Suite
                    </td>
                    <td className="p-6 text-center">
                      <div className="bg-orange-50 rounded-lg py-2 px-4 inline-block">
                        <span className="font-medium text-orange-700">Standard Docs</span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="bg-blue-50 rounded-lg py-2 px-4 inline-block">
                        <span className="font-medium text-blue-700">Professional Suite</span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="bg-purple-50 rounded-lg py-2 px-4 inline-block">
                        <span className="font-medium text-purple-700">Complete Library</span>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Support Level */}
                  <tr className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-yellow-25 hover:to-orange-25 transition-all duration-200">
                    <td className="p-6 font-semibold text-gray-900 flex items-center text-lg">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                        <Shield className="w-6 h-6 text-yellow-600" />
                      </div>
                      Customer Support
                    </td>
                    <td className="p-6 text-center">
                      <div className="bg-orange-50 rounded-lg py-2 px-4 inline-block">
                        <span className="font-medium text-orange-700">Email Support</span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="bg-blue-50 rounded-lg py-2 px-4 inline-block">
                        <span className="font-medium text-blue-700">Priority Support</span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="bg-purple-50 rounded-lg py-2 px-4 inline-block">
                        <span className="font-medium text-purple-700">24/7 Dedicated</span>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Action buttons */}
                  <tr className="bg-gradient-to-r from-gray-50 to-blue-50">
                    <td className="p-6 font-bold text-gray-900 text-lg">Start Your Journey</td>
                    {plans?.map((plan, index) => (
                      <td key={plan.id} className="p-6 text-center">
                        <Button 
                          onClick={() => handleSubscribe(plan.id)}
                          className={cn(
                            "w-full py-3 px-6 text-lg font-semibold shadow-lg transition-all duration-300 transform hover:scale-105",
                            index === 0 && "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
                            index === 1 && "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600",
                            index === 2 && "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                          )}
                        >
                          Choose {plan.name}
                        </Button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* FAQ Section */}
      <div className="mt-16 mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">
            Common questions about our subscription plans and features.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What's included in the free trial?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                All plans include a 5-day free trial with full access to your chosen plan's features. No credit card required to start.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I change plans anytime?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and billing is prorated.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What broker features are included?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Professional and Enterprise plans include access to broker dashboard, deal management, document generation, and professional trading tools.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Is there a setup fee?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                No setup fees. All plans are charged monthly or yearly with no additional costs. Cancel anytime without penalties.
              </p>
            </CardContent>
          </Card>
        </div>
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