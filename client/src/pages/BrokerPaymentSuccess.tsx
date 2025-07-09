import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  Download, 
  Globe,
  Award,
  Calendar,
  User,
  CreditCard,
  Mail,
  QrCode
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function BrokerPaymentSuccess() {
  const [, setLocation] = useLocation();
  const [membershipCard, setMembershipCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Generate membership card
    const generateCard = async () => {
      try {
        const response = await apiRequest('POST', '/api/broker/generate-membership-card');
        setMembershipCard(response);
      } catch (error) {
        console.error('Failed to generate membership card:', error);
      } finally {
        setLoading(false);
      }
    };

    generateCard();
  }, []);

  const downloadCard = async () => {
    try {
      const response = await fetch('/api/broker/download-membership-card', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'GloboOil-Elite-Membership-Card.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Card Downloaded",
          description: "Your membership card has been downloaded successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download membership card. Please try again.",
        variant: "destructive",
      });
    }
  };

  const goToDashboard = () => {
    setLocation('/broker-dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Generating your membership card...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-4 shadow-2xl">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to GloboOil Elite!
          </h1>
          <p className="text-gray-600 text-lg">
            Your payment was successful and your elite membership is now active
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Membership Card Display */}
          <Card className="bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-700 text-white border-0 shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <CardContent className="p-8">
              {/* Card Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Globe className="h-10 w-10 mr-3" />
                  <div>
                    <h2 className="text-2xl font-bold">GloboOil</h2>
                    <p className="text-sm opacity-90">ELITE BROKER MEMBERSHIP</p>
                  </div>
                </div>
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <User className="h-12 w-12" />
                </div>
              </div>

              {/* Member Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-3xl font-bold mb-2">
                    {membershipCard?.firstName || 'Member'} {membershipCard?.lastName || 'Name'}
                  </h3>
                  <div className="flex items-center text-lg font-semibold">
                    <CreditCard className="h-5 w-5 mr-2" />
                    {membershipCard?.cardNumber || '123456'}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm opacity-90">Valid Until</p>
                    <p className="text-lg font-semibold">
                      {membershipCard?.expiryDate || '04/26'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <QrCode className="h-8 w-8" />
                  </div>
                </div>
              </div>

              {/* Card Features */}
              <div className="mt-6 pt-6 border-t border-yellow-400/30">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="opacity-90">Member Since</p>
                    <p className="font-semibold">{new Date().toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="opacity-90">Status</p>
                    <p className="font-semibold">Elite Active</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Membership Details */}
          <div className="space-y-6">
            {/* Membership Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-yellow-600" />
                  Membership Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Membership Type</span>
                  <Badge className="bg-yellow-100 text-yellow-800">Elite Broker</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Valid Until</span>
                  <span className="font-semibold">
                    {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Card Number</span>
                  <span className="font-mono">#{membershipCard?.cardNumber || '123456'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Payment Processed</p>
                      <p className="text-sm text-gray-600">Your $299 payment has been successfully processed</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Membership Card Generated</p>
                      <p className="text-sm text-gray-600">Your elite membership card is ready for download</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-semibold text-xs">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Access Your Dashboard</p>
                      <p className="text-sm text-gray-600">Start using your elite broker privileges</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={downloadCard}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-semibold py-3"
              >
                <Download className="h-5 w-5 mr-2" />
                Download Membership Card
              </Button>
              
              <Button 
                onClick={goToDashboard}
                variant="outline"
                className="w-full border-yellow-600 text-yellow-700 hover:bg-yellow-50 font-semibold py-3"
              >
                Access Broker Dashboard
              </Button>
            </div>

            {/* Contact Support */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Need Help?</p>
                    <p className="text-sm text-blue-700">
                      Contact our elite support team at elite@globooil.com for any assistance.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Welcome Message */}
        <Card className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Welcome to the Elite Community</h3>
            <p className="text-lg opacity-90 mb-6">
              You now have access to exclusive oil trading opportunities, premium market insights, 
              and direct connections with top-tier oil companies worldwide.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-sm opacity-90">Elite Support</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">$2.5B+</div>
                <div className="text-sm opacity-90">Annual Volume</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">150+</div>
                <div className="text-sm opacity-90">Partner Companies</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

