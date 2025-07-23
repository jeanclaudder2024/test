import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Crown, Star, CheckCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function TrialExpired() {
  const { logout, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSignOut = () => {
    logout();
  };

  const handleSubscription = async (interval: 'month' | 'year') => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to continue",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiRequest(
        'POST',
        '/api/create-checkout-session',
        { 
          planId: 2, // Professional Plan
          interval 
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create checkout session');
      }

      const data = await response.json();
      
      // Redirect to Stripe checkout
      const checkoutUrl = data.url || data.redirectUrl;
      
      if (checkoutUrl) {
        // Try different methods for navigation
        try {
          if (window.parent && window.parent !== window) {
            window.parent.location.href = checkoutUrl;
          } else if (window.top && window.top !== window) {
            window.top.location.href = checkoutUrl;
          } else {
            window.location.href = checkoutUrl;
          }
        } catch (securityError) {
          // Fallback to new window
          const newWindow = window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
          if (newWindow) {
            toast({
              title: "Checkout Opened",
              description: "Stripe checkout opened in a new tab. Please complete your payment there.",
            });
          }
        }
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to start checkout process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,111,0,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(0,51,102,0.15),transparent_50%)]"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <img src="/assets/petrodealhub-logo.png" alt="PetroDealHub" className="h-8 w-auto" />
              <span className="text-xl font-bold text-white">PetroDealHub</span>
            </div>

            <div className="flex justify-center">
              <div className="bg-orange-500/20 p-4 rounded-full">
                <Clock className="h-12 w-12 text-orange-400" />
              </div>
            </div>

            <CardTitle className="text-3xl font-bold text-white">
              Your Free Trial Has Ended
            </CardTitle>
            <CardDescription className="text-white/70 text-lg">
              {user && (
                <>
                  Your 3-day trial has ended. Please upgrade to continue using PetroDealHub.
                </>
              )}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* What You've Experienced */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-4">
                What you experienced during your trial:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
                  <p className="text-white/80 text-sm">Real-time vessel tracking</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
                  <p className="text-white/80 text-sm">Market intelligence</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
                  <p className="text-white/80 text-sm">Trading dashboard</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
                  <p className="text-white/80 text-sm">Document management</p>
                </div>
              </div>
            </div>

            {/* Upgrade Plans */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-6">
                Continue with a Pro Plan
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Monthly Plan */}
                <div className="bg-white/5 p-6 rounded-lg border border-white/10 hover:border-orange-500/30 transition-colors">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-white mb-2">Monthly</h4>
                    <div className="text-3xl font-bold text-orange-400 mb-1">$350</div>
                    <p className="text-white/60 text-sm mb-4">per month</p>
                    
                    <Button 
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => handleSubscription('month')}
                      disabled={isLoading}
                    >
                      Choose Monthly
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Annual Plan */}
                <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 p-6 rounded-lg border border-orange-500/30 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                      <Star className="h-3 w-3 mr-1" />
                      Best Value
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-white mb-2">Annual</h4>
                    <div className="text-3xl font-bold text-orange-400 mb-1">$3,360</div>
                    <p className="text-white/60 text-sm mb-2">per year</p>
                    <p className="text-green-400 text-xs mb-4">Save $840 (2 months free)</p>
                    
                    <Button 
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => handleSubscription('year')}
                      disabled={isLoading}
                    >
                      <Crown className="mr-2 h-4 w-4" />
                      Choose Annual
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Support */}
            <div className="text-center space-y-4">
              <p className="text-white/60">
                Need help choosing a plan or have questions?
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Contact Support
                </Button>
                <Button variant="ghost" onClick={handleSignOut} className="text-white/60 hover:text-white">
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}