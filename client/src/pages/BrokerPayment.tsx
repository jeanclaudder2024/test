import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  Star,
  Globe,
  Award,
  Clock,
  Banknote,
  Users,
  TrendingUp,
  User,
  Building2
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface PaymentFormProps {
  brokerData: any;
  onSuccess: () => void;
}

function PaymentForm({ brokerData, onSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/broker-payment-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Update broker payment status
        await apiRequest('POST', '/api/broker/payment-confirm', {
          paymentIntentId: paymentIntent.id,
          brokerData,
        });
        
        toast({
          title: "Payment Successful!",
          description: "Your membership card is being generated. Welcome to GloboOil Elite!",
        });
        
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-semibold py-3 px-6 text-lg"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Pay $299 - Activate Elite Membership
          </>
        )}
      </Button>
    </form>
  );
}

export default function BrokerPayment() {
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState<string>('');
  const [brokerData, setBrokerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get broker data from localStorage (stored during upgrade process)
    const storedBrokerData = localStorage.getItem('brokerUpgradeData');
    console.log('Stored broker data:', storedBrokerData);
    
    if (!storedBrokerData) {
      console.log('No broker data found, redirecting to upgrade...');
      setLocation('/broker-upgrade');
      return;
    }

    const parsedData = JSON.parse(storedBrokerData);
    console.log('Parsed broker data:', parsedData);
    setBrokerData(parsedData);

    // Create payment intent
    const createPaymentIntent = async () => {
      try {
        console.log('Creating payment intent for data:', parsedData);
        
        const response = await apiRequest('/api/broker/create-payment-intent', {
          method: 'POST',
          body: JSON.stringify({
            amount: 299,
            brokerData: parsedData,
          }),
        });

        console.log('Payment response data:', response);
        
        if (response && response.clientSecret) {
          setClientSecret(response.clientSecret);
          console.log('Client secret set successfully');
        } else {
          console.error('No client secret in response:', response);
          throw new Error('No client secret received from server');
        }
      } catch (error) {
        console.error('Payment setup error:', error);
        toast({
          title: "Payment Setup Failed",
          description: error instanceof Error ? error.message : "Unable to initialize payment. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [setLocation, toast]);

  const handlePaymentSuccess = () => {
    // Clear stored data and redirect to success page
    localStorage.removeItem('brokerUpgradeData');
    setLocation('/broker-payment-success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Setting up your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-red-600">Payment setup failed. Please try again.</p>
            <Button onClick={() => setLocation('/broker-upgrade')} className="mt-4">
              Return to Upgrade
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-full mb-4 shadow-2xl">
            <Award className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            GloboOil Elite Membership
          </h1>
          <p className="text-gray-600 text-lg">
            Complete your payment to unlock exclusive broker privileges
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Membership Benefits */}
          <Card className="bg-gradient-to-br from-yellow-600 to-yellow-700 text-white border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Star className="h-6 w-6 mr-2" />
                Elite Membership Benefits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Membership Card Preview */}
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Globe className="h-8 w-8 mr-2" />
                    <div>
                      <h3 className="text-xl font-bold">GloboOil</h3>
                      <p className="text-sm opacity-90">ELITE BROKER MEMBERSHIP</p>
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold">{brokerData?.firstName} {brokerData?.lastName}</p>
                  <p className="text-lg">Member ID: Will be generated</p>
                  <p className="text-sm opacity-90">Valid: 1 Year from activation</p>
                </div>
              </div>

              {/* Benefits List */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-3 text-yellow-200" />
                  <span>Exclusive access to premium oil deals</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-3 text-yellow-200" />
                  <span>Priority customer support</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-3 text-yellow-200" />
                  <span>Advanced analytics and market insights</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-3 text-yellow-200" />
                  <span>Direct company contact privileges</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-3 text-yellow-200" />
                  <span>Unlimited document generation</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-3 text-yellow-200" />
                  <span>Global broker network access</span>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-yellow-500/30">
                <div className="text-center">
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-sm opacity-90">Active Brokers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">$2.5B</div>
                  <div className="text-sm opacity-90">Volume Traded</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">150+</div>
                  <div className="text-sm opacity-90">Countries</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card className="shadow-2xl border-0">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center justify-between">
                <span className="flex items-center">
                  <CreditCard className="h-6 w-6 mr-2" />
                  Secure Payment
                </span>
                <Badge className="bg-green-100 text-green-800">
                  <Shield className="h-4 w-4 mr-1" />
                  SSL Secured
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pricing Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span>Elite Membership (1 Year)</span>
                  <span className="font-semibold">$299.00</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Processing Fee</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-yellow-600">$299.00 USD</span>
                </div>
              </div>

              {/* Payment Form */}
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm brokerData={brokerData} onSuccess={handlePaymentSuccess} />
              </Elements>

              {/* Security Notice */}
              <div className="flex items-start space-x-3 text-sm text-gray-600">
                <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Your payment is secure</p>
                  <p>We use industry-standard encryption to protect your payment information. Your card details are never stored on our servers.</p>
                </div>
              </div>

              {/* Money Back Guarantee */}
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-blue-900">30-Day Money Back Guarantee</p>
                <p className="text-sm text-blue-700">Not satisfied? Get a full refund within 30 days.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-6">Trusted by leading oil companies worldwide</p>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="flex items-center space-x-2">
              <Building2 className="h-6 w-6" />
              <span className="font-medium">Shell</span>
            </div>
            <div className="flex items-center space-x-2">
              <Building2 className="h-6 w-6" />
              <span className="font-medium">ExxonMobil</span>
            </div>
            <div className="flex items-center space-x-2">
              <Building2 className="h-6 w-6" />
              <span className="font-medium">BP</span>
            </div>
            <div className="flex items-center space-x-2">
              <Building2 className="h-6 w-6" />
              <span className="font-medium">Chevron</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

