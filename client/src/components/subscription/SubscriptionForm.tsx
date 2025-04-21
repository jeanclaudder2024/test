import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, Check, Lock, ShieldCheck } from 'lucide-react';
import { useLocation } from 'wouter';

export default function SubscriptionForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header with icon */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <CreditCard className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Complete Your Subscription
        </h2>
        <p className="text-muted-foreground">
          Enter your payment details to activate your subscription
        </p>
      </div>

      {/* Payment information */}
      <div className="p-6 bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-border/50">
        <h3 className="text-sm font-medium mb-4 text-muted-foreground uppercase tracking-wide">
          Payment Information
        </h3>
        <div className="payment-element-container">
          <PaymentElement className="payment-element" />
        </div>
      </div>

      {/* Security notice */}
      <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
        <Lock className="h-3 w-3" />
        <span>Your payment information is secure and encrypted</span>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="p-4 border border-destructive/50 bg-destructive/10 text-destructive rounded-md text-sm">
          {errorMessage}
        </div>
      )}

      {/* Payment benefits */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-900/30">
        <h3 className="flex items-center text-sm font-medium text-green-800 dark:text-green-400 mb-2">
          <ShieldCheck className="h-4 w-4 mr-2" />
          Your subscription includes:
        </h3>
        <ul className="text-sm text-green-700 dark:text-green-300 space-y-2">
          <li className="flex items-start">
            <Check className="h-4 w-4 mr-2 mt-0.5 text-green-600 dark:text-green-400" />
            <span>Immediate access to premium features</span>
          </li>
          <li className="flex items-start">
            <Check className="h-4 w-4 mr-2 mt-0.5 text-green-600 dark:text-green-400" />
            <span>Cancel anytime with no penalty</span>
          </li>
          <li className="flex items-start">
            <Check className="h-4 w-4 mr-2 mt-0.5 text-green-600 dark:text-green-400" />
            <span>30-day money-back guarantee</span>
          </li>
        </ul>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col space-y-4">
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="py-3 px-5 w-full border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Processing payment...
            </div>
          ) : (
            'Complete Subscription'
          )}
        </button>
        
        <button
          type="button"
          className="py-2 px-4 w-full text-center text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => navigate('/dashboard')}
          disabled={isProcessing}
        >
          Cancel and return to dashboard
        </button>
      </div>
    </form>
  );
}