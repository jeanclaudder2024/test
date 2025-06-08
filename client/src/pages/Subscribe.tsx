import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import SubscriptionForm from '@/components/subscription/SubscriptionForm';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Redirect } from 'wouter';
import { Loader2, ShieldCheck } from 'lucide-react';

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render
let stripePromise: Promise<any> | null = null;
try {
  if (import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
  } else {
    console.error('Missing VITE_STRIPE_PUBLIC_KEY environment variable');
  }
} catch (error) {
  console.error('Error loading Stripe:', error);
}

export default function SubscribePage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  
  // Subscription tiers
  const subscriptionTiers = [
    {
      id: 'price_standard',
      name: 'Standard',
      description: 'Access to basic maritime tracking features',
      price: 49.99,
      features: [
        'Vessel tracking',
        'Refinery data',
        'Basic reports'
      ]
    },
    {
      id: 'price_premium',
      name: 'Premium',
      description: 'Enhanced tracking and analytics',
      price: 99.99,
      features: [
        'All Standard features',
        'Advanced analytics',
        'Custom reports',
        'Priority support'
      ]
    },
    {
      id: 'price_enterprise',
      name: 'Enterprise',
      description: 'Full platform access with advanced features',
      price: 199.99,
      features: [
        'All Premium features',
        'AI Assistant unlimited usage',
        'Document generation',
        'API access',
        'Dedicated account manager'
      ]
    }
  ];

  // Check if user is already subscribed
  useEffect(() => {
    if (user?.isSubscribed) {
      toast({
        title: "Already Subscribed",
        description: `You already have an active ${user.subscriptionTier || 'standard'} subscription.`,
      });
    }
  }, [user, toast]);

  const handleSubscribe = async (priceId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiRequest("/api/get-or-create-subscription", {
        method: "POST",
        body: JSON.stringify({ priceId })
      });
      
      if (result.clientSecret) {
        setClientSecret(result.clientSecret);
      } else {
        // User already has a subscription
        toast({
          title: "Subscription Updated",
          description: "Your subscription has been updated.",
        });
      }
    } catch (err: any) {
      console.error("Error creating subscription:", err);
      setError(err.message || "Failed to create subscription");
      toast({
        title: "Subscription Error",
        description: err.message || "Failed to create subscription",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Upgrade Your Experience</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Choose the plan that's right for you and get access to premium features
        </p>
      </div>

      {clientSecret ? (
        <div className="max-w-md mx-auto bg-card rounded-lg border shadow-sm p-6">
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <SubscriptionForm />
          </Elements>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8 mt-8">
          {subscriptionTiers.map((tier) => (
            <div key={tier.id} className="bg-card rounded-lg border shadow-sm flex flex-col overflow-hidden">
              <div className="p-6 pb-2">
                <h3 className="text-2xl font-bold">{tier.name}</h3>
                <p className="text-muted-foreground mt-2">{tier.description}</p>
                <div className="mt-4 flex items-baseline text-3xl font-bold">
                  ${tier.price.toFixed(2)}
                  <span className="ml-1 text-sm font-medium text-muted-foreground">/month</span>
                </div>
              </div>
              
              <div className="px-6 pt-2 pb-6">
                <ul className="mt-4 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex">
                      <ShieldCheck className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto p-6 pt-0">
                <button
                  onClick={() => handleSubscribe(tier.id)}
                  disabled={loading}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                  ) : (
                    `Subscribe to ${tier.name}`
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 border border-destructive/50 bg-destructive/10 text-destructive rounded-md">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}