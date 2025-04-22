import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Shield, Star } from "lucide-react";
import { useNavigate } from "wouter";

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

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  currentPlan?: string | null;
  onSelect: (plan: SubscriptionPlan) => void;
}

export function SubscriptionCard({ plan, currentPlan, onSelect }: SubscriptionCardProps) {
  const [, navigate] = useNavigate();
  const isCurrent = currentPlan === plan.name;
  const features = plan.features || [];
  
  // Format price display 
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(parseFloat(plan.price));
  
  // Premium plan highlight
  const isPremium = plan.name.toLowerCase().includes('premium') || 
    plan.name.toLowerCase().includes('elite');
  
  return (
    <Card className={`w-full overflow-hidden ${isPremium ? 'border-primary' : 'border-border'}`}>
      {isPremium && (
        <div className="bg-primary text-primary-foreground text-xs py-1 text-center font-medium">
          RECOMMENDED
        </div>
      )}
      <CardHeader className={`${isPremium ? 'bg-primary/5' : ''}`}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-1">
            {isPremium ? <Shield className="h-5 w-5 text-primary" /> : <Star className="h-5 w-5" />}
            {plan.name}
          </CardTitle>
          {isCurrent && (
            <Badge variant="secondary" className="text-xs font-normal">
              Current Plan
            </Badge>
          )}
        </div>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6">
          <p className="text-3xl font-bold">{formattedPrice}</p>
          <p className="text-sm text-muted-foreground">{plan.interval === 'monthly' ? 'per month' : 'per year'}</p>
        </div>
        
        <div className="space-y-2">
          {features.length > 0 ? (
            features.map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Basic access to the platform</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/30 p-6 flex flex-col">
        <Button 
          onClick={() => onSelect(plan)} 
          variant={isPremium ? "default" : "outline"}
          disabled={!plan.isActive || isCurrent}
          className="w-full"
        >
          {isCurrent ? 'Current Plan' : `Subscribe to ${plan.name}`}
        </Button>
      </CardFooter>
    </Card>
  );
}