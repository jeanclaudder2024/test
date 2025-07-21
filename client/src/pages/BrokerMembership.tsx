import { useState, useTransition, startTransition } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, Ship, DollarSign, Users, Globe, Shield } from 'lucide-react';
import { useLocation } from 'wouter';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

const BrokerMembershipForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [isPending, startTransitionLocal] = useTransition();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent for broker membership
      console.log('Calling broker membership payment endpoint...');
      const response = await fetch('/api/broker-membership-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      const responseData = await response.json();
      console.log('Payment intent response:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to create payment intent');
      }
      
      const { clientSecret } = responseData;
      
      if (!clientSecret) {
        throw new Error('No client secret received from server');
      }

      // Confirm payment using the client secret
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent?.status === 'succeeded') {
        // Confirm broker membership activation
        await apiRequest('POST', '/api/confirm-broker-membership', {
          paymentIntentId: paymentIntent.id
        });

        toast({
          title: "Broker Membership Activated!",
          description: "Welcome to PetroDealHub Broker Network! You now have full access to broker features.",
          variant: "default",
        });

        // User data will be updated on next page load
        
        // Show success message and enable card request button
        setPaymentCompleted(true);
        toast({
          title: "Payment Successful! ✅", 
          description: "Click the button below to request your membership card.",
          variant: "default",
        });
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "An error occurred during payment processing",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // If user already has broker membership, show message instead of redirect
  if (user?.hasBrokerMembership) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8 text-center">
        <h1 className="text-4xl font-bold text-green-600">Already a Broker Member!</h1>
        <p className="text-lg text-muted-foreground">You already have broker membership.</p>
        <Button onClick={() => setLocation('/broker-dashboard')} className="bg-blue-600 hover:bg-blue-700">
          Go to Broker Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
          Join PetroDealHub Broker Network
        </h1>
        <p className="text-lg text-muted-foreground">
          One-time membership fee of $299 - Lifetime access to professional oil trading features
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Membership Benefits */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-6 w-6 text-blue-600" />
              Broker Membership Benefits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Full Broker Dashboard Access</p>
                  <p className="text-sm text-muted-foreground">Comprehensive deal management and analytics</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">8-Step CIF-ASWP Transaction Workflow</p>
                  <p className="text-sm text-muted-foreground">Professional deal processing system</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Live Oil Trading Prices</p>
                  <p className="text-sm text-muted-foreground">Real-time market data and analytics</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Document Generation & Management</p>
                  <p className="text-sm text-muted-foreground">Professional maritime documentation</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Global Network Access</p>
                  <p className="text-sm text-muted-foreground">Connect with oil companies worldwide</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Lifetime Membership</p>
                  <p className="text-sm text-muted-foreground">One-time payment, lifetime access</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card className="border-2 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-orange-600" />
              Secure Payment
            </CardTitle>
            <p className="text-2xl font-bold text-orange-600">$299.00 USD</p>
            <p className="text-sm text-muted-foreground">One-time payment - No recurring fees</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="p-4 border rounded-lg bg-gray-50">
                <CardElement 
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                    },
                  }}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Secure payment powered by Stripe</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Join 1,000+ professional oil brokers</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <span>Global network access included</span>
                </div>
              </div>

              {paymentCompleted ? (
                <Button 
                  onClick={() => {
                    startTransition(() => {
                      setLocation('/membership-card-request');
                    });
                  }}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  size="lg"
                >
                  Request Membership Card →
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700"
                  disabled={!stripe || isProcessing}
                  size="lg"
                >
                  {isProcessing ? 'Processing Payment...' : 'Activate Broker Membership - $299'}
                </Button>
              )}

              <p className="text-xs text-muted-foreground text-center">
                By clicking "Activate Broker Membership", you agree to our terms of service and privacy policy.
                Your membership will be activated immediately after successful payment.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function BrokerMembership() {
  return (
    <Elements stripe={stripePromise}>
      <BrokerMembershipForm />
    </Elements>
  );
}