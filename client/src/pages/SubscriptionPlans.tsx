import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { SubscriptionCard } from "@/components/subscription/SubscriptionCard";
import { Loader2, AlertTriangle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageTitle } from "@/components/ui/page-title";
import { useLocation } from "wouter";

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string | null;
  price: string;
  interval: string;
  features: string[] | null;
  stripePriceId: string | null;
  isActive: boolean | null;
}

export default function SubscriptionPlans() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  // Fetch subscription plans
  const { data: plans = [], isLoading, error } = useQuery({
    queryKey: ["/api/subscription-plans"],
    queryFn: async () => {
      const res = await apiRequest({ url: "/api/subscription-plans" });
      return await res.json() as SubscriptionPlan[];
    }
  });

  // Subscription mutation
  const subscribeMutation = useMutation({
    mutationFn: async (planId: number) => {
      const res = await apiRequest({
        url: "/api/subscribe",
        method: "POST",
        body: { planId }
      });
      return await res.json();
    },
    onSuccess: (data) => {
      // If we get a payment link, redirect to it
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      
      toast({
        title: "Subscription Updated",
        description: "Your subscription has been updated successfully",
      });
      
      // Invalidate the user query to refresh subscription status
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription Failed",
        description: `Could not process subscription: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    subscribeMutation.mutate(plan.id);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <PageTitle title="Subscription Plans" />
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <PageTitle title="Subscription Plans" />
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
  const activePlans = plans.filter(plan => plan.isActive !== false);

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageTitle title="Subscription Plans" />
      
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
            {activePlans.map((plan) => (
              <SubscriptionCard
                key={plan.id}
                plan={plan}
                currentPlan={user?.subscriptionTier}
                onSelect={handleSelectPlan}
              />
            ))}
          </div>
        )}
        
        {subscribeMutation.isPending && (
          <div className="mt-8 flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-center">
              Processing your subscription...
            </p>
          </div>
        )}
        
        <div className="mt-8 text-center">
          <Button 
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={subscribeMutation.isPending}
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}