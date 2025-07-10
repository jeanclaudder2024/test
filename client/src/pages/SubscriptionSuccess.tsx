import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { CheckCircle, ArrowRight, Ship, Shield, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function SubscriptionSuccess() {
  const [location, navigate] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get session ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const session = urlParams.get('session_id');
    setSessionId(session);
    
    // Simulate processing delay
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-16 mx-auto">
        <div className="text-center space-y-6">
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-96 mx-auto" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mx-auto" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-16 mx-auto">
      <div className="text-center space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Payment Successful!</h1>
          <p className="text-lg text-gray-600">
            Welcome to PetroDealHub! Your subscription has been activated.
          </p>
          {sessionId && (
            <p className="text-sm text-gray-500">
              Transaction ID: {sessionId.slice(-12)}
            </p>
          )}
        </div>

        {/* What's Next Card */}
        <Card className="text-left">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5 text-blue-600" />
              What's available now
            </CardTitle>
            <CardDescription>
              Your subscription gives you access to these features:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Ship className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Real-time Vessel Tracking</p>
                <p className="text-sm text-gray-600">Monitor vessel movements across global maritime routes</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Professional Document Generation</p>
                <p className="text-sm text-gray-600">Create professional maritime documents and certificates</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <BarChart3 className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium">Advanced Analytics</p>
                <p className="text-sm text-gray-600">Access detailed vessel performance and market insights</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate("/login")}
            className="flex items-center gap-2"
          >
            Sign In to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <Ship className="h-4 w-4" />
            Back to Home
          </Button>
        </div>

        {/* Contact Support */}
        <div className="pt-8 border-t">
          <p className="text-sm text-gray-600">
            Need help getting started? Contact our support team at{" "}
            <a href="mailto:support@petrodealhub.com" className="text-blue-600 hover:underline">
              support@petrodealhub.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}