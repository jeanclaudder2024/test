import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string | null;
  price: string;
  interval: string;
  features: string;
  stripePriceId: string | null;
  isActive: boolean | null;
}

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  isCurrent?: boolean;
}

export function SubscriptionCard({ plan, isCurrent = false }: SubscriptionCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Parse features array from JSON string
  let featureList = [];
  try {
    featureList = typeof plan.features === 'string' ? 
      JSON.parse(plan.features) : [];
  } catch (error) {
    console.error("Error parsing features:", error);
  }

  // Subscribe to plan
  const subscribe = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);
      const response = await apiRequest({
        url: "/api/subscription/subscribe",
        method: "POST",
        body: { planId: plan.id }
      });
      
      // If response has URL, it's a checkout session
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      
      return data;
    },
    onSuccess: (data) => {
      if (!data) return; // Handled externally by redirect
      
      toast({
        title: "Subscription Updated",
        description: `You are now subscribed to the ${plan.name} plan.`,
      });
      
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription Failed",
        description: error.message || "Failed to update subscription. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });
  
  // Format price display
  const formatPrice = () => {
    const price = parseFloat(plan.price);
    if (price === 0) return "Free";
    return `$${price}/${plan.interval === 'monthly' ? 'mo' : 'yr'}`;
  };
  
  return (
    <Card className={`w-full ${isCurrent ? 'border-primary' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{plan.name}</CardTitle>
            <CardDescription className="mt-1">{plan.description}</CardDescription>
          </div>
          {isCurrent && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
              Current Plan
            </Badge>
          )}
        </div>
        <div className="mt-1">
          <span className="text-3xl font-bold">{formatPrice()}</span>
          {plan.price !== "0" && (
            <span className="text-muted-foreground"> per {plan.interval}</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {featureList.map((feature: string, i: number) => (
            <li key={i} className="flex items-start">
              <Check className="h-5 w-5 text-primary shrink-0 mr-2" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          variant={isCurrent ? "secondary" : "default"}
          disabled={isCurrent || isProcessing}
          onClick={() => subscribe.mutate()}
        >
          {isCurrent
            ? "Current Plan"
            : isProcessing
            ? "Processing..."
            : `Subscribe to ${plan.name}`}
        </Button>
      </CardFooter>
    </Card>
  );
}