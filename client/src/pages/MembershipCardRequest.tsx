import { useState, useTransition, startTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, Ship, CreditCard, User, Mail, Calendar, IdCard } from 'lucide-react';
import { useLocation } from 'wouter';

export default function MembershipCardRequest() {
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isRequesting, setIsRequesting] = useState(false);
  const [cardRequested, setCardRequested] = useState(false);
  const [isPending, startTransitionLocal] = useTransition();

  // Show loading state if auth is loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading membership card request...</p>
        </div>
      </div>
    );
  }

  // If no user, show message instead of redirect
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="mb-4">Please log in to access membership card request.</p>
          <Button onClick={() => setLocation('/login')} className="bg-blue-600 hover:bg-blue-700">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  const handleRequestCard = async () => {
    setIsRequesting(true);

    try {
      // Request membership card generation
      const response = await fetch('/api/broker/request-membership-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to request membership card');
      }

      toast({
        title: "Membership Card Requested!",
        description: "Your Professional Oil Broker membership card has been requested. You now have full broker access!",
        variant: "default",
      });

      setCardRequested(true);

      // Show success message instead of automatic redirect
      toast({
        title: "Membership Card Requested! 🎉",
        description: "Click the button below to access your broker dashboard.",
        variant: "default",
      });

    } catch (error: any) {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to request membership card",
        variant: "destructive",
      });
    } finally {
      setIsRequesting(false);
    }
  };

  if (cardRequested) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-green-600">
            Membership Card Requested!
          </h1>
          <p className="text-lg text-muted-foreground">
            Your Professional Oil Broker membership card has been requested successfully.
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting to Broker Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
          Request Your Membership Card
        </h1>
        <p className="text-lg text-muted-foreground">
          Complete your broker membership by requesting your official membership card
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Payment Confirmation */}
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              Payment Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">$299 Payment Successful</p>
                  <p className="text-sm text-muted-foreground">One-time broker membership fee</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Account: {user?.email || 'Loading...'}</p>
                  <p className="text-sm text-muted-foreground">{user?.hasBrokerMembership ? 'Verified broker member' : 'Payment completed'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Lifetime Membership</p>
                  <p className="text-sm text-muted-foreground">No recurring payments required</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Membership Card Request */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IdCard className="h-6 w-6 text-blue-600" />
              Request Membership Card
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Your official Professional Oil Broker membership card will include:
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Professional membership ID</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Broker certification number</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Lifetime access credentials</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Professional oil trading authorization</span>
                </div>
              </div>
            </div>

            {cardRequested ? (
              <Button
                onClick={() => {
                  startTransition(() => {
                    setLocation('/broker-dashboard');
                  });
                }}
                className="w-full bg-gradient-to-r from-green-600 to-purple-600 hover:from-green-700 hover:to-purple-700 text-white font-semibold py-3 px-6 text-lg"
              >
                Access Broker Dashboard →
              </Button>
            ) : (
              <Button
                onClick={handleRequestCard}
                disabled={isRequesting}
                className="w-full bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white font-semibold py-3 px-6 text-lg"
              >
                {isRequesting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Requesting Card...
                  </>
                ) : (
                  <>
                    <IdCard className="h-5 w-5 mr-2" />
                    Request Membership Card
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Next Steps */}
      <Card className="border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-6 w-6 text-purple-600" />
            What Happens Next
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <IdCard className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-semibold">1. Request Card</h4>
              <p className="text-sm text-muted-foreground">Click the button to request your membership card</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold">2. Instant Activation</h4>
              <p className="text-sm text-muted-foreground">Your broker access is activated immediately</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <Ship className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-semibold">3. Broker Dashboard</h4>
              <p className="text-sm text-muted-foreground">Access your full broker features forever</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}