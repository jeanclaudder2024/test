import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star } from "lucide-react";
import { Link } from "wouter";

export default function SubscriptionUpgrade() {
  const { user, isTrialExpired } = useAuth();

  const plans = [
    {
      name: "Professional",
      price: "$29",
      period: "month",
      description: "Perfect for individual brokers and small teams",
      features: [
        "Unlimited vessel tracking",
        "Real-time maritime data",
        "Advanced analytics dashboard",
        "Document management",
        "Email support",
        "Export capabilities"
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "month",
      description: "For large organizations and enterprise clients",
      features: [
        "Everything in Professional",
        "Multi-user team access",
        "Custom integrations",
        "Priority support",
        "Advanced reporting",
        "API access",
        "White-label options"
      ],
      popular: false,
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Upgrade Your Plan
          </h1>
          {isTrialExpired ? (
            <p className="text-xl text-blue-200">
              Your free trial has ended. Choose a plan to continue accessing PetroDealHub.
            </p>
          ) : (
            <p className="text-xl text-blue-200">
              Unlock the full potential of maritime oil trading with our premium features.
            </p>
          )}
          {user?.trialEndDate && (
            <div className="mt-4">
              <Badge variant="secondary" className="text-sm">
                Trial ends: {new Date(user.trialEndDate).toLocaleDateString()}
              </Badge>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative ${plan.popular ? 'border-primary shadow-xl' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-2">
                  {plan.name === "Enterprise" ? (
                    <Crown className="w-6 h-6 text-yellow-500 mr-2" />
                  ) : (
                    <Star className="w-6 h-6 text-blue-500 mr-2" />
                  )}
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                </div>
                <div className="text-4xl font-bold">
                  {plan.price}
                  <span className="text-base font-normal text-muted-foreground">/{plan.period}</span>
                </div>
                <CardDescription className="text-sm mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : 'bg-secondary hover:bg-secondary/90'}`}
                  size="lg"
                >
                  Choose {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-blue-200 mb-4">
            Need help choosing the right plan? Our team is here to help.
          </p>
          <div className="space-x-4">
            <Button variant="outline" asChild>
              <Link href="/contact">Contact Sales</Link>
            </Button>
            {!isTrialExpired && (
              <Button variant="ghost" asChild>
                <Link href="/">Continue Trial</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}