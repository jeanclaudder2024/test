import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import SubscriptionForm from '@/components/subscription/SubscriptionForm';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Redirect } from 'wouter';
import { Loader2, CheckCircle, Ship, BarChart2, Zap, Database, PhoneCall, Users, Shield, Lock, Server, RefreshCw } from 'lucide-react';

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function SubscribePage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  
  // Subscription tiers with added icons
  const subscriptionTiers = [
    {
      id: 'price_standard',
      name: 'Standard',
      description: 'Access to basic maritime tracking features',
      price: 49.99,
      color: 'blue',
      icon: <Ship className="h-8 w-8" />,
      features: [
        { name: 'Vessel tracking', icon: <Ship className="h-4 w-4" /> },
        { name: 'Refinery data', icon: <Database className="h-4 w-4" /> },
        { name: 'Basic reports', icon: <BarChart2 className="h-4 w-4" /> },
        { name: 'Email support', icon: <PhoneCall className="h-4 w-4" /> }
      ]
    },
    {
      id: 'price_premium',
      name: 'Premium',
      description: 'Enhanced tracking and analytics',
      price: 99.99,
      color: 'purple',
      popular: true, 
      icon: <BarChart2 className="h-8 w-8" />,
      features: [
        { name: 'All Standard features', icon: <CheckCircle className="h-4 w-4" /> },
        { name: 'Advanced analytics', icon: <BarChart2 className="h-4 w-4" /> },
        { name: 'Custom reports', icon: <Database className="h-4 w-4" /> },
        { name: 'Historical data (12 months)', icon: <RefreshCw className="h-4 w-4" /> },
        { name: 'Priority support', icon: <PhoneCall className="h-4 w-4" /> }
      ]
    },
    {
      id: 'price_enterprise',
      name: 'Enterprise',
      description: 'Full platform access with advanced features',
      price: 199.99,
      color: 'emerald',
      icon: <Zap className="h-8 w-8" />,
      features: [
        { name: 'All Premium features', icon: <CheckCircle className="h-4 w-4" /> },
        { name: 'AI Assistant unlimited usage', icon: <Zap className="h-4 w-4" /> },
        { name: 'Document generation', icon: <Server className="h-4 w-4" /> },
        { name: 'API access', icon: <Lock className="h-4 w-4" /> },
        { name: 'Dedicated account manager', icon: <Users className="h-4 w-4" /> }
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
    setSelectedTierId(priceId);
    setError(null);
    
    try {
      const result = await apiRequest("/api/create-subscription", {
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
      setSelectedTierId(null);
    }
  };

  // Helper function to get card colors based on tier
  const getColors = (color: string, popular?: boolean) => {
    if (color === 'blue') {
      return {
        bg: popular ? 'bg-gradient-to-br from-blue-600 to-blue-900' : 'bg-gradient-to-br from-blue-500/5 to-blue-500/10',
        border: popular ? 'border-blue-400' : 'border-blue-200',
        icon: popular ? 'text-white' : 'text-blue-500',
        highlight: 'bg-blue-500',
        text: popular ? 'text-white' : 'text-foreground',
        muted: popular ? 'text-blue-100/80' : 'text-muted-foreground',
        button: 'bg-blue-500 hover:bg-blue-600 text-white',
        check: 'text-blue-500'
      };
    } else if (color === 'purple') {
      return {
        bg: popular ? 'bg-gradient-to-br from-purple-600 to-purple-900' : 'bg-gradient-to-br from-purple-500/5 to-purple-500/10',
        border: popular ? 'border-purple-400' : 'border-purple-200',
        icon: popular ? 'text-white' : 'text-purple-500',
        highlight: 'bg-purple-500',
        text: popular ? 'text-white' : 'text-foreground',
        muted: popular ? 'text-purple-100/80' : 'text-muted-foreground',
        button: 'bg-purple-500 hover:bg-purple-600 text-white',
        check: 'text-purple-500'
      };
    } else if (color === 'emerald') {
      return {
        bg: popular ? 'bg-gradient-to-br from-emerald-600 to-emerald-900' : 'bg-gradient-to-br from-emerald-500/5 to-emerald-500/10',
        border: popular ? 'border-emerald-400' : 'border-emerald-200',
        icon: popular ? 'text-white' : 'text-emerald-500',
        highlight: 'bg-emerald-500',
        text: popular ? 'text-white' : 'text-foreground',
        muted: popular ? 'text-emerald-100/80' : 'text-muted-foreground',
        button: 'bg-emerald-500 hover:bg-emerald-600 text-white',
        check: 'text-emerald-500'
      };
    } else {
      return {
        bg: 'bg-card',
        border: 'border-border',
        icon: 'text-primary',
        highlight: 'bg-primary',
        text: 'text-foreground',
        muted: 'text-muted-foreground',
        button: 'bg-primary hover:bg-primary/90 text-primary-foreground',
        check: 'text-primary'
      };
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
    <div className="container max-w-6xl mx-auto py-16 px-4">
      {/* Background gradient */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-primary/10 to-transparent -z-10"></div>
      
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-4">
          Upgrade Your Experience
        </h1>
        <p className="text-xl text-muted-foreground">
          Choose the plan that's right for you and get access to premium features for real-time maritime intelligence
        </p>
      </div>

      {clientSecret ? (
        <div className="max-w-md mx-auto bg-card rounded-xl border shadow-lg p-8 backdrop-blur-sm">
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <SubscriptionForm />
          </Elements>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {subscriptionTiers.map((tier) => {
            const colors = getColors(tier.color, tier.popular);
            return (
              <div 
                key={tier.id} 
                className={`rounded-xl border ${colors.border} ${colors.bg} shadow-xl flex flex-col overflow-hidden transform transition-transform hover:scale-[1.02] relative`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg shadow-md">
                      MOST POPULAR
                    </div>
                  </div>
                )}
                
                <div className="p-8 pb-6">
                  <div className={`p-3 rounded-full ${colors.highlight} bg-opacity-10 w-fit mb-4`}>
                    <div className={colors.icon}>{tier.icon}</div>
                  </div>
                  <h3 className={`text-2xl font-bold ${colors.text}`}>{tier.name}</h3>
                  <p className={`mt-2 ${colors.muted}`}>{tier.description}</p>
                  <div className={`mt-6 flex items-baseline ${colors.text}`}>
                    <span className="text-4xl font-bold">${tier.price.toFixed(2)}</span>
                    <span className={`ml-1 text-sm font-medium ${colors.muted}`}>/month</span>
                  </div>
                </div>
                
                <div className="px-8 pt-2 pb-6 flex-grow">
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-6 opacity-30"></div>
                  <ul className="space-y-4">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <div className={`mr-3 mt-1 ${tier.popular ? 'text-white' : colors.check}`}>
                          {feature.icon}
                        </div>
                        <span className={colors.text}>{feature.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-8 pt-4">
                  <button
                    onClick={() => handleSubscribe(tier.id)}
                    disabled={loading && selectedTierId === tier.id}
                    className={`w-full py-3 px-6 rounded-lg shadow-md font-medium transition-all duration-200 ${colors.button} focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm`}
                  >
                    {loading && selectedTierId === tier.id ? (
                      <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                    ) : (
                      `Subscribe to ${tier.name}`
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <div className="mt-8 p-4 border border-destructive/50 bg-destructive/10 text-destructive rounded-md max-w-lg mx-auto">
          <p>{error}</p>
        </div>
      )}
      
      {/* Trust badges */}
      <div className="mt-20 text-center">
        <p className="text-sm uppercase tracking-wider text-muted-foreground mb-6">Trusted by maritime professionals worldwide</p>
        <div className="flex justify-center space-x-8 items-center">
          <div className="flex items-center">
            <Lock className="h-5 w-5 mr-2 text-muted-foreground" />
            <span className="text-muted-foreground">Secure Payment</span>
          </div>
          <div className="w-px h-6 bg-border"></div>
          <div className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-muted-foreground" />
            <span className="text-muted-foreground">SSL Encrypted</span>
          </div>
          <div className="w-px h-6 bg-border"></div>
          <div className="flex items-center">
            <RefreshCw className="h-5 w-5 mr-2 text-muted-foreground" />
            <span className="text-muted-foreground">30-Day Guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
}