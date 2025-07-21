import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { CheckCircle, Ship, DollarSign, Users, Globe, Shield, CreditCard } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      console.log('Creating payment intent...');
      const response = await fetch('/api/broker-membership-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      const responseData = await response.json();
      console.log('Payment response:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to create payment intent');
      }
      
      const { clientSecret } = responseData;
      
      if (!clientSecret) {
        throw new Error('No client secret received from server');
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      console.log('Confirming payment...');
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
        console.log('Payment succeeded, confirming membership...');
        
        // Confirm broker membership activation
        const confirmResponse = await fetch('/api/confirm-broker-membership', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id
          })
        });
        
        const confirmData = await confirmResponse.json();
        console.log('Confirmation response:', confirmData);

        if (confirmData.success) {
          toast({
            title: "Payment Successful! 🎉",
            description: "Now complete your membership information to get broker access.",
            variant: "default",
          });

          // Navigate to membership info page
          setTimeout(() => {
            setLocation('/broker-membership-info');
          }, 2000);
        } else {
          throw new Error(confirmData.message || 'Payment confirmation failed');
        }
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "An error occurred during payment processing",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
          PetroDealHub Broker Membership
        </h1>
        <p className="text-lg text-muted-foreground">
          Step 1: Complete Payment - $299 One-Time Membership Fee
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Membership Benefits */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-6 w-6 text-blue-600" />
              What You Get
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Secure payment powered by Stripe</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-500" />
                <span>Join 1,000+ professional oil brokers</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-purple-500" />
                <span>Global network access included</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-orange-500" />
                <span>Professional broker certification</span>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-green-500" />
                <span>Lifetime broker dashboard access</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              By clicking "Process Payment", you agree to our terms of service and privacy policy. 
              Your membership will be activated immediately after successful payment.
            </p>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card className="border-2 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-orange-600" />
              Payment Information
            </CardTitle>
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

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Payment Summary</h4>
                <div className="flex justify-between text-lg">
                  <span>Broker Membership (Lifetime)</span>
                  <span className="font-bold">$299.00</span>
                </div>
                <p className="text-sm text-blue-600 mt-2">One-time payment • No recurring charges</p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white py-3 text-lg"
                disabled={!stripe || isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Processing Payment...
                  </div>
                ) : (
                  `Process Payment - $299`
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Test Card: 4242 4242 4242 4242 • Any future date • Any CVC
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function BrokerPayment() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm />
    </Elements>
  );
}