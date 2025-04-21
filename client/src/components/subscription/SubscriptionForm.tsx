import { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useLocation } from 'wouter';

export default function SubscriptionForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Check if Stripe is loaded properly
  useEffect(() => {
    if (stripe && elements) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
      // Display error after a timeout if Stripe is still not loaded
      const timer = setTimeout(() => {
        if (!stripe || !elements) {
          setErrorMessage('Could not load the payment processor. Please check your internet connection or try again later.');
        }
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [stripe, elements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setErrorMessage(error.message || 'An unexpected error occurred.');
        toast({
          title: 'Payment Failed',
          description: error.message || 'An unexpected error occurred.',
          variant: 'destructive',
        });
      } else {
        // Payment succeeded - redirect will happen automatically
        toast({
          title: 'Payment Successful',
          description: 'Your subscription has been activated!',
        });
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred.');
      toast({
        title: 'Payment Error',
        description: err.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Complete Your Subscription</h2>
        <p className="text-muted-foreground">
          Enter your payment details to activate your subscription
        </p>
      </div>

      <PaymentElement />

      {errorMessage && (
        <div className="p-3 border border-destructive/50 bg-destructive/10 text-destructive rounded-md text-sm">
          {errorMessage}
        </div>
      )}

      <div className="flex items-center justify-between mt-6">
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => navigate('/dashboard')}
          disabled={isProcessing}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <div className="flex items-center">
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Processing...
            </div>
          ) : (
            'Subscribe Now'
          )}
        </button>
      </div>
    </form>
  );
}