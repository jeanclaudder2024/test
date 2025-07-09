import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Crown, Star, Building, Loader2 } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const subscriptionPlans = [
  {
    id: 1,
    name: "🧪 Basic",
    price: "$69",
    period: "/month",
    description: "Perfect for independent brokers starting in petroleum markets",
    features: [
      "Access to 2 major maritime zones",
      "Basic vessel tracking with verified activity", 
      "Access to 5 regional ports",
      "Basic documentation: LOI, SPA",
      "Email support"
    ],
    popular: false
  },
  {
    id: 2,
    name: "📈 Professional", 
    price: "$150",
    period: "/month",
    description: "Professional brokers and medium-scale petroleum trading companies",
    features: [
      "Access to 6 major maritime zones",
      "Enhanced tracking with real-time updates",
      "Access to 20+ strategic ports", 
      "Enhanced documentation: LOI, B/L, SPA, ICPO",
      "Basic broker features + deal participation",
      "Priority email support"
    ],
    popular: true
  },
  {
    id: 3,
    name: "🏢 Enterprise",
    price: "$399", 
    period: "/month",
    description: "Full-scale solution for large petroleum trading corporations",
    features: [
      "Access to 9 major global maritime zones",
      "Full live tracking with verified activity",
      "Access to 100+ strategic global ports",
      "Full set: SGS, SDS, Q88, ATB, customs",
      "International Broker ID included",
      "Legal recognition and dispute protection",
      "24/7 premium support + account manager"
    ],
    popular: false
  }
];

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  const upgradeMutation = useMutation({
    mutationFn: async (planId: number) => {
      const response = await apiRequest('POST', '/api/upgrade-subscription', { planId });
      return response.json();
    },
    onSuccess: async () => {
      await refreshUser();
      toast({
        title: "Upgrade Successful!",
        description: "Your subscription has been upgraded successfully.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Upgrade Failed",
        description: error.message || "Failed to upgrade subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUpgrade = (planId: number) => {
    setSelectedPlan(planId);
    upgradeMutation.mutate(planId);
  };

  const getPlanIcon = (planId: number) => {
    switch (planId) {
      case 1: return <Star className="h-6 w-6 text-blue-500" />;
      case 2: return <Crown className="h-6 w-6 text-purple-500" />;
      case 3: return <Building className="h-6 w-6 text-green-500" />;
      default: return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Upgrade Your Subscription
          </DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground">
            Choose the plan that best fits your petroleum trading needs
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {subscriptionPlans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative transition-all duration-300 hover:shadow-lg ${
                plan.popular 
                  ? 'border-2 border-purple-500 shadow-lg' 
                  : 'border border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-500 text-white px-4 py-1 text-sm font-semibold">
                    MOST POPULAR
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  {getPlanIcon(plan.id)}
                </div>
                <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
                <div className="mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-4xl font-bold text-primary">{plan.price}</span>
                    <div className="text-left">
                      <div className="text-muted-foreground text-sm">{plan.period}</div>
                    </div>
                  </div>
                </div>
                <CardDescription className="text-sm">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full py-3 transition-all duration-300 ${
                    plan.popular
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-primary hover:bg-primary/90'
                  }`}
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={upgradeMutation.isPending && selectedPlan === plan.id}
                >
                  {upgradeMutation.isPending && selectedPlan === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Upgrading...
                    </>
                  ) : (
                    "Upgrade to This Plan"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">
            All plans include 24/7 support and can be cancelled anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}