import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, Zap, Crown, Building2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SUBSCRIPTION_PLANS, createCheckoutSession } from "@/lib/subscription";
import { cn } from "@/lib/utils";

export default function SubscriptionPlans() {
  const [isYearly, setIsYearly] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userSubscription, isLoading } = useQuery({
    queryKey: ["/api/subscription"],
    retry: false,
  });

  const subscribeMutation = useMutation({
    mutationFn: async ({ planId, isYearly }: { planId: number; isYearly: boolean }) => {
      const session = await createCheckoutSession(planId, isYearly);
      // Redirect to Stripe Checkout
      window.location.href = session.url;
    },
    onError: (error) => {
      toast({
        title: "Subscription Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getPlanIcon = (planCode: string) => {
    switch (planCode) {
      case "basic":
        return <Zap className="h-8 w-8" />;
      case "professional":
        return <Crown className="h-8 w-8" />;
      case "enterprise":
        return <Building2 className="h-8 w-8" />;
      default:
        return <Star className="h-8 w-8" />;
    }
  };

  const getPlanColor = (planCode: string) => {
    switch (planCode) {
      case "basic":
        return "from-blue-500 to-cyan-500";
      case "professional":
        return "from-purple-500 to-pink-500";
      case "enterprise":
        return "from-orange-500 to-red-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const handleSubscribe = (planId: number) => {
    subscribeMutation.mutate({ planId, isYearly });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Choose Your Maritime
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 ml-3">
              Trading Plan
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Professional maritime trading platform with real-time vessel tracking, 
            comprehensive port data, and exclusive access to global petroleum deals.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <Label htmlFor="billing-toggle" className="text-white font-medium">
              Monthly
            </Label>
            <Switch
              id="billing-toggle"
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-cyan-500"
            />
            <Label htmlFor="billing-toggle" className="text-white font-medium">
              Yearly
              <Badge className="ml-2 bg-gradient-to-r from-green-500 to-emerald-500">
                Save 25%
              </Badge>
            </Label>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isCurrentPlan = userSubscription?.planId === plan.id;
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const originalPrice = isYearly ? plan.monthlyPrice * 12 : plan.monthlyPrice;
            const savings = isYearly ? originalPrice - price : 0;

            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative overflow-hidden border-2 transition-all duration-300 hover:scale-105",
                  plan.isPopular 
                    ? "border-purple-500 shadow-2xl shadow-purple-500/25" 
                    : "border-gray-700 hover:border-gray-600",
                  isCurrentPlan && "ring-2 ring-blue-500"
                )}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-blue-500 text-white">
                      Current Plan
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  {/* Plan Icon */}
                  <div className={cn(
                    "mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-r text-white mb-4",
                    getPlanColor(plan.code)
                  )}>
                    {getPlanIcon(plan.code)}
                  </div>

                  <CardTitle className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </CardTitle>
                  
                  <CardDescription className="text-gray-300 text-sm mb-6">
                    {plan.description}
                  </CardDescription>

                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">
                        ${price}
                      </span>
                      <span className="text-gray-400 ml-2">
                        /{isYearly ? "year" : "month"}
                      </span>
                    </div>
                    
                    {isYearly && savings > 0 && (
                      <div className="text-sm text-green-400">
                        Save ${savings} per year
                      </div>
                    )}
                    
                    {!isYearly && (
                      <div className="text-sm text-gray-500">
                        ${plan.yearlyPrice}/year when billed annually
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm leading-relaxed">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Limits */}
                  <div className="pt-4 border-t border-gray-700">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-white font-semibold">
                          {plan.maxUsers === -1 ? "Unlimited" : plan.maxUsers}
                        </div>
                        <div className="text-gray-400">Users</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-semibold">
                          {plan.maxVessels === -1 ? "Unlimited" : plan.maxVessels}
                        </div>
                        <div className="text-gray-400">Vessels</div>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isCurrentPlan || subscribeMutation.isPending}
                    className={cn(
                      "w-full py-3 font-semibold transition-all duration-300",
                      plan.isPopular
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600",
                      isCurrentPlan && "bg-gray-600 cursor-not-allowed"
                    )}
                  >
                    {subscribeMutation.isPending 
                      ? "Processing..." 
                      : isCurrentPlan 
                        ? "Current Plan" 
                        : "Get Started"
                    }
                  </Button>

                  {/* Trial Info */}
                  {!isCurrentPlan && (
                    <p className="text-center text-xs text-gray-400">
                      5-day free trial • Cancel anytime
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Comparison */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            All Plans Include Professional Maritime Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Real-Time Tracking</h3>
              <p className="text-gray-300">
                Live vessel positions, port activities, and maritime intelligence
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Global Network</h3>
              <p className="text-gray-300">
                Access to international ports, refineries, and trading opportunities
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Professional Tools</h3>
              <p className="text-gray-300">
                Document generation, compliance management, and deal workflows
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-300 mb-6">
            Need a custom solution for your organization?
          </p>
          <Button 
            variant="outline" 
            className="border-gray-600 text-white hover:bg-gray-800"
          >
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
}