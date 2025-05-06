import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Check, ChevronRight, Loader2 } from 'lucide-react';

export default function SubscriptionSuccess() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    
    if (!sessionId) {
      setError('No session ID found. Please contact support if you believe this is an error.');
      setIsLoading(false);
      return;
    }

    // Verify the session status with your backend
    const verifySession = async () => {
      try {
        // First, we refresh the subscription data to make sure our backend syncs with Stripe
        await apiRequest('GET', '/api/subscriptions/current');
        
        // For this demo, we're just setting success without verifying the session
        // In a production environment, you should verify the session with your backend
        setSubscriptionDetails({
          success: true,
          plan: {
            name: 'Your Subscription'
          }
        });
        setIsLoading(false);
        
        // Show success toast
        toast({
          title: "Subscription Activated",
          description: "Your subscription has been successfully activated!",
          variant: "default",
        });
      } catch (error) {
        console.error('Error verifying subscription session:', error);
        setError('Failed to verify your subscription. Please contact support.');
        setIsLoading(false);
      }
    };

    verifySession();
  }, [toast]);

  return (
    <div className="container max-w-lg py-16 mx-auto">
      <Card className="border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-center text-2xl">Subscription Confirmation</CardTitle>
          <CardDescription className="text-center">
            Thank you for subscribing!
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Verifying your subscription...</p>
            </div>
          ) : error ? (
            <div className="py-8">
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
                {error}
              </div>
              <Button variant="outline" onClick={() => navigate('/account/subscription')}>
                Go to Account
              </Button>
            </div>
          ) : (
            <div className="py-6">
              <div className="flex justify-center mb-6">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
              </div>
              
              <h3 className="text-lg font-medium mb-1">
                {subscriptionDetails?.plan?.name || 'Your Subscription'} is now active
              </h3>
              
              <p className="text-muted-foreground mb-6">
                You now have full access to all premium features. Thank you for your support!
              </p>
              
              <div className="space-y-2 text-sm text-muted-foreground mb-6">
                <p>• Access to real-time vessel tracking</p>
                <p>• Advanced data analytics and reporting</p>
                <p>• Premium customer support</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            onClick={() => navigate('/dashboard')}
            className="w-full"
            disabled={isLoading}
          >
            Go to Dashboard <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/account/subscription')}
            className="w-full"
            disabled={isLoading}
          >
            View Subscription Details
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}