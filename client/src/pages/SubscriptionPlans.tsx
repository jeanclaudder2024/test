import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { SubscriptionCard } from "@/components/subscription/SubscriptionCard";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLocation } from "wouter";

// Define the subscription plan interface
interface SubscriptionPlanType {
  id: number;
  name: string;
  description: string | null;
  price: string;
  interval: string;
  features: string;
  stripePriceId: string | null;
  isActive: boolean | null;
}

export default function SubscriptionPlans() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();

  // Fetch subscription plans
  const { data: plans = [], isLoading, error } = useQuery({
    queryKey: ["/api/subscription/subscription-plans"],
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Plans</AlertTitle>
          <AlertDescription>
            Could not load subscription plans. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Filter only active plans
  const activePlans = Array.isArray(plans) 
    ? plans.filter((plan: SubscriptionPlanType) => plan.isActive !== false)
    : [];

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-3xl font-bold">Subscription Plans</h1>
      
      <div className="max-w-4xl mx-auto w-full">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Choose a Subscription Plan</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Select the subscription plan that best fits your needs. Upgrade anytime to access premium features.
          </p>
        </div>
        
        {activePlans.length === 0 ? (
          <Alert>
            <AlertTitle>No Plans Available</AlertTitle>
            <AlertDescription>
              There are currently no subscription plans available. Please check back later.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activePlans.map((plan: SubscriptionPlanType) => (
              <SubscriptionCard
                key={plan.id}
                plan={plan}
                isCurrent={user?.subscriptionTier === plan.name}
              />
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center">
          <Button 
            variant="outline"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}