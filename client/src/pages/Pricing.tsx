import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, X, Ship, MapPin, Building2, BarChart3, FileText, Users, Globe, Shield } from 'lucide-react';
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

  // Fetch subscription plans (no cache to always get latest)
  const { data: plans, isLoading, error } = useQuery({
    queryKey: ['/api/admin/subscription-plans'],
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache the results
    queryFn: async () => {
      try {
        const response = await apiRequest(
          'GET',
          '/api/admin/subscription-plans'
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch subscription plans');
        }
        
        // Parse the response from the admin API
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
      const response = await apiRequest(
        'POST',
        '/api/create-stripe-checkout',
        { planId, interval: billingInterval }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create checkout session');
      }

      const data = await response.json();
      
      // Show info message about subscription process
      toast({
        title: "Subscription Information",
        description: data.message || "Subscription checkout is being set up. Please contact support for assistance.",
        variant: "default",
      });
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
      
      {/* Plan Comparison Section */}
      <div className="mt-16 mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">Detailed Plan Comparison</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Compare all features across our subscription plans to find the perfect fit for your maritime operations.
          </p>
        </div>
        
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-4 font-semibold text-gray-900">Features</th>
                  {plans?.map((plan) => (
                    <th key={plan.id} className="text-center p-4 font-semibold text-gray-900 min-w-[180px]">
                      <div className="flex flex-col items-center">
                        <span className="text-lg">{plan.name}</span>
                        <span className="text-sm text-muted-foreground mt-1">
                          {formatCurrency(billingInterval === 'month' ? plan.monthlyPrice : plan.yearlyPrice, plan.currency)}
                          /{billingInterval}
                        </span>
                        {plan.isPopular && (
                          <Badge className="bg-primary hover:bg-primary text-xs mt-1">Popular</Badge>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Vessel Tracking */}
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900 flex items-center">
                    <Ship className="w-5 h-5 mr-2 text-blue-500" />
                    Vessel Tracking
                  </td>
                  <td className="p-4 text-center">Up to 50 vessels</td>
                  <td className="p-4 text-center">Up to 200 vessels</td>
                  <td className="p-4 text-center">Unlimited vessels</td>
                </tr>
                
                {/* Real-time Positions */}
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-green-500" />
                    Real-time Positions
                  </td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                
                {/* Port & Refinery Access */}
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900 flex items-center">
                    <Building2 className="w-5 h-5 mr-2 text-purple-500" />
                    Port & Refinery Access
                  </td>
                  <td className="p-4 text-center">Limited access</td>
                  <td className="p-4 text-center">Full access</td>
                  <td className="p-4 text-center">Global access</td>
                </tr>
                
                {/* Analytics Dashboard */}
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-orange-500" />
                    Analytics Dashboard
                  </td>
                  <td className="p-4 text-center">Basic reporting</td>
                  <td className="p-4 text-center">Advanced analytics</td>
                  <td className="p-4 text-center">Enterprise analytics</td>
                </tr>
                
                {/* Document Generation */}
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-indigo-500" />
                    Document Generation
                  </td>
                  <td className="p-4 text-center">Basic documents</td>
                  <td className="p-4 text-center">Professional docs</td>
                  <td className="p-4 text-center">All document types</td>
                </tr>
                
                {/* Broker Features */}
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-red-500" />
                    Broker Features
                  </td>
                  <td className="p-4 text-center">
                    <X className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                
                {/* API Access */}
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900 flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-cyan-500" />
                    API Access
                  </td>
                  <td className="p-4 text-center">
                    <X className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">Limited API</td>
                  <td className="p-4 text-center">Full API access</td>
                </tr>
                
                {/* Support */}
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-yellow-500" />
                    Support Level
                  </td>
                  <td className="p-4 text-center">Email support</td>
                  <td className="p-4 text-center">Priority support</td>
                  <td className="p-4 text-center">24/7 dedicated support</td>
                </tr>
                
                {/* Data Export */}
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">Data Export</td>
                  <td className="p-4 text-center">CSV only</td>
                  <td className="p-4 text-center">CSV, JSON</td>
                  <td className="p-4 text-center">All formats</td>
                </tr>
                
                {/* Historical Data */}
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">Historical Data</td>
                  <td className="p-4 text-center">3 months</td>
                  <td className="p-4 text-center">12 months</td>
                  <td className="p-4 text-center">Unlimited</td>
                </tr>
                
                {/* Action buttons */}
                <tr className="bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">Get Started</td>
                  {plans?.map((plan) => (
                    <td key={plan.id} className="p-4 text-center">
                      <Button 
                        onClick={() => handleSubscribe(plan.id)}
                        className={cn(
                          "w-full",
                          plan.isPopular ? "bg-primary hover:bg-primary/90" : "bg-gray-900 hover:bg-gray-800"
                        )}
                        size="sm"
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