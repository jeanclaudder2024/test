import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Check, X, Star, Crown, Zap, Users, ArrowRight, TestTube, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

interface Plan {
  id: number;
  name: string;
  emoji: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  annualSavings: string;
  trial: string;
  icon: React.ReactNode;
  gradient: string;
  isPopular: boolean;
  features: {
    marineZones: string;
    vesselTracking: string;
    refineryAccess: string;
    portCoverage: string;
    documentation: string;
    dealParticipation: string;
    users: string;
    support: string;
    brokerMembership: boolean;
    directSellerAccess: boolean;
    legalProtection: boolean;
    realContractAccess: boolean;
    dealAlerts: boolean;
    marketExpansion: boolean;
    preContractReview: boolean;
  };
}

const plans: Plan[] = [
  {
    id: 1,
    name: "Basic",
    emoji: "🧪",
    description: "\"Basically\" - Essential tracking for small operators",
    monthlyPrice: 69,
    annualPrice: 662,
    annualSavings: "save 20%",
    trial: "✅ 5-Day Free Trial",
    icon: <TestTube className="h-6 w-6" />,
    gradient: "from-blue-500 to-blue-600",
    isPopular: false,
    features: {
      marineZones: "Access to 2 zones",
      vesselTracking: "Up to 250 tankers",
      refineryAccess: "Up to 25 refineries",
      portCoverage: "5 major ports",
      documentation: "LOI, B/L only",
      dealParticipation: "View-only access",
      users: "1 user",
      support: "Email support only",
      brokerMembership: false,
      directSellerAccess: false,
      legalProtection: false,
      realContractAccess: false,
      dealAlerts: false,
      marketExpansion: false,
      preContractReview: false,
    }
  },
  {
    id: 2,
    name: "Professional",
    emoji: "📈",
    description: "Advanced features for growing petroleum trading operations",
    monthlyPrice: 150,
    annualPrice: 1350,
    annualSavings: "save 25%",
    trial: "✅ 5-Day Free Trial",
    icon: <Zap className="h-6 w-6" />,
    gradient: "from-purple-500 to-purple-600",
    isPopular: true,
    features: {
      marineZones: "Access to 6 strategic zones",
      vesselTracking: "Unlimited tracking with vessel status",
      refineryAccess: "Expanded refinery data + operational info",
      portCoverage: "Access to 20+ international ports",
      documentation: "Includes SPA, ICPO, NCNDA",
      dealParticipation: "Limited participation in active deals",
      users: "Up to 3 users",
      support: "Direct support + onboarding session",
      brokerMembership: true,
      directSellerAccess: true,
      legalProtection: true,
      realContractAccess: true,
      dealAlerts: true,
      marketExpansion: true,
      preContractReview: true,
    }
  },
  {
    id: 3,
    name: "Enterprise",
    emoji: "🏢",
    description: "Full-scale solution for large petroleum trading corporations",
    monthlyPrice: 399,
    annualPrice: 3591,
    annualSavings: "save 25%",
    trial: "✅ 5-Day Free Trial",
    icon: <Crown className="h-6 w-6" />,
    gradient: "from-orange-500 to-orange-600",
    isPopular: false,
    features: {
      marineZones: "Access to 9 major global maritime zones",
      vesselTracking: "Full live tracking with verified activity",
      refineryAccess: "Full access including internal documentation (e.g., gate passes)",
      portCoverage: "Access to 100+ strategic global ports",
      documentation: "Full set: SGS, SDS, Q88, ATB, customs and compliance documentation",
      dealParticipation: "Full participation + contract management",
      users: "Full team access with user permission control",
      support: "24/7 premium support + dedicated account manager",
      brokerMembership: true,
      directSellerAccess: true,
      legalProtection: true,
      realContractAccess: true,
      dealAlerts: true,
      marketExpansion: true,
      preContractReview: true,
    }
  }
];

const exclusiveFeatures = [
  {
    name: "🪪 International Broker Membership",
    basic: false,
    professional: "Eligible for PetroDealHub International Broker ID",
    enterprise: "Included with official registration"
  },
  {
    name: "📞 Direct Seller Access",
    basic: false,
    professional: "Contact with oil sales teams at major companies",
    enterprise: "Full direct access to official seller departments"
  },
  {
    name: "🛡️ Legal Broker Protection",
    basic: false,
    professional: "Entry into verified contract environments",
    enterprise: "Legal recognition and dispute protection"
  },
  {
    name: "📝 Real Contract Access",
    basic: false,
    professional: "Join live deal rooms and bid on contracts",
    enterprise: "Participate in real contract execution with sellers"
  },
  {
    name: "🔔 Deal and Supply Alerts",
    basic: false,
    professional: "Alerts on refinery availability and vessel movements",
    enterprise: "Priority alerts for new international supply opportunities"
  },
  {
    name: "🌍 Market Expansion Insights",
    basic: false,
    professional: "Weekly opportunity recommendations based on region or product",
    enterprise: "Country-based lead targeting + document review assistance"
  },
  {
    name: "📑 Pre-Contract Review",
    basic: false,
    professional: "Contract terms review before commitment",
    enterprise: "Dedicated advisors for deal compliance and risk reduction"
  }
];

export default function ProfessionalPlansComparison() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const handleStartTrial = async (planId: number, planName: string) => {
    try {
      // Check if user is authenticated - if not, redirect to registration
      if (!user) {
        toast({
          title: "Start Your 5-Day Free Trial",
          description: "Register now to access all subscription features. No credit card required!",
          variant: "default",
        });
        
        // Store the selected plan and redirect to registration
        localStorage.setItem('selectedTrialPlan', planId.toString());
        navigate(`/register?trial=true&plan=${planId}`);
        return;
      }

      // User is authenticated - proceed with checkout
      toast({
        title: "Creating checkout...",
        description: "Setting up your subscription payment...",
      });

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          planId: planId,
          priceId: `price_${planId}_monthly`,
          billingInterval: 'month'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      
      // Redirect to Stripe checkout with improved iframe handling
      const checkoutUrl = data.url || data.redirectUrl;
      
      console.log('Checkout response data:', data);
      console.log('Attempting to redirect to:', checkoutUrl);
      console.log('Window context check - parent:', window.parent !== window, 'top:', window.top !== window);
      
      if (checkoutUrl && typeof checkoutUrl === 'string' && checkoutUrl.length > 0) {
        // Check if we're in a restricted environment (like Replit iframe)
        try {
          // Force immediate top-level navigation to prevent iFrame issues
          if (window.parent && window.parent !== window) {
            // We're in an iframe - force parent navigation
            console.log('Detected iframe - using parent.location');
            window.parent.location.href = checkoutUrl;
          } else if (window.top && window.top !== window) {
            // Alternative iframe detection
            console.log('Detected iframe - using top.location');
            window.top.location.href = checkoutUrl;
          } else {
            // Direct navigation for non-iframe context
            console.log('Using direct navigation - window.location.replace');
            window.location.replace(checkoutUrl);
          }
        } catch (securityError) {
          console.warn('Security error with iframe navigation, opening in new tab:', securityError);
          // If we can't access parent/top due to security restrictions, open in new tab
          const newWindow = window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
          if (newWindow) {
            toast({
              title: "Checkout Opened",
              description: "Stripe checkout opened in a new tab. Please complete your payment there.",
            });
          } else {
            toast({
              title: "Popup Blocked",
              description: "Please allow popups and try again, or copy this URL to complete payment: " + checkoutUrl,
              variant: "destructive",
            });
          }
        }
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error starting trial:', error);
      toast({
        title: "Payment Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Fetch real subscription plans from database
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['/api/subscription-plans'],
    staleTime: 0,
  });

  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [showComparison, setShowComparison] = useState(false);

  if (plansLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-16">
      <div className="container mx-auto px-4">
        {/* Professional Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="px-4 py-1 bg-blue-500/20 text-blue-700 border-blue-500/30 backdrop-blur-sm mb-6 inline-flex items-center">
            <div className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></div>
            Professional Maritime Plans
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">
            Choose Your Maritime Trading Plan
          </h1>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Professional subscription plans designed for petroleum trading operations. All plans include 5-day free trial with full access.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-full p-1 shadow-lg border border-gray-200">
            <Button
              variant={billingInterval === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setBillingInterval('month')}
              className="rounded-full px-6 py-2"
            >
              Monthly
            </Button>
            <Button
              variant={billingInterval === 'year' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setBillingInterval('year')}
              className="rounded-full px-6 py-2"
            >
              Annual
              <Badge variant="secondary" className="ml-2 text-xs">Save 20%</Badge>
            </Button>
          </div>
        </div>

        {/* Beautiful Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {Array.isArray(plans) && plans.map((plan: any, index: number) => (
            <Card 
              key={plan.id}
              className={`relative overflow-hidden transition-all duration-500 hover:scale-105 transform shadow-xl ${
                index === 1 ? 'ring-4 ring-blue-500 scale-105' : ''
              } ${
                index === 0 && 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200'
              } ${
                index === 1 && 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
              } ${
                index === 2 && 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
              }`}
            >
              {/* Popular Badge */}
              {index === 1 && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1 text-sm font-semibold shadow-lg">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4 pt-8">
                <div className="flex justify-center mb-4">
                  {index === 0 && <div className="text-4xl">🧪</div>}
                  {index === 1 && <div className="text-4xl">📈</div>}
                  {index === 2 && <div className="text-4xl">🏢</div>}
                </div>
                <CardTitle className="text-2xl font-bold text-slate-800 mb-2">
                  {plan.name.replace(' Plan', '')}
                </CardTitle>
                <div className="flex items-baseline justify-center">
                  <span className={`text-5xl font-bold ${
                    index === 0 && 'bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent'
                  } ${
                    index === 1 && 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'
                  } ${
                    index === 2 && 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'
                  }`}>
                    ${billingInterval === 'month' ? plan.monthlyPrice : Math.round(plan.monthlyPrice * 0.8)}
                  </span>
                  <span className="text-xl text-slate-500 ml-2">/{billingInterval === 'month' ? 'month' : 'year'}</span>
                </div>
                <div className="text-sm text-slate-500 mt-2">
                  5-day free trial included
                </div>
              </CardHeader>

              <CardContent className="space-y-6 px-6 pb-8">
                <p className="text-slate-600 text-center leading-relaxed">
                  {plan.description}
                </p>
                
                {/* Key Features */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      index === 0 && 'bg-orange-100'
                    } ${
                      index === 1 && 'bg-blue-100'
                    } ${
                      index === 2 && 'bg-purple-100'
                    }`}>
                      <Check className={`w-4 h-4 ${
                        index === 0 && 'text-orange-600'
                      } ${
                        index === 1 && 'text-blue-600'
                      } ${
                        index === 2 && 'text-purple-600'
                      }`} />
                    </div>
                    <span className="font-semibold text-slate-700">
                      {index === 0 ? '2 Maritime Regions' : 
                       index === 1 ? '6 Maritime Regions' : 
                       '9+ Global Maritime Regions'}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      index === 0 && 'bg-orange-100'
                    } ${
                      index === 1 && 'bg-blue-100'
                    } ${
                      index === 2 && 'bg-purple-100'
                    }`}>
                      <Check className={`w-4 h-4 ${
                        index === 0 && 'text-orange-600'
                      } ${
                        index === 1 && 'text-blue-600'
                      } ${
                        index === 2 && 'text-purple-600'
                      }`} />
                    </div>
                    <span className="text-slate-700">
                      {index === 0 ? 'Basic vessel tracking' : 
                       index === 1 ? 'Enhanced vessel tracking' : 
                       'Full live vessel tracking'}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      index === 0 && 'bg-orange-100'
                    } ${
                      index === 1 && 'bg-blue-100'
                    } ${
                      index === 2 && 'bg-purple-100'
                    }`}>
                      <Check className={`w-4 h-4 ${
                        index === 0 && 'text-orange-600'
                      } ${
                        index === 1 && 'text-blue-600'
                      } ${
                        index === 2 && 'text-purple-600'
                      }`} />
                    </div>
                    <span className="text-slate-700">
                      {index === 0 ? 'Basic documentation' : 
                       index === 1 ? 'Professional documentation' : 
                       'Complete documentation suite'}
                    </span>
                  </div>
                </div>

                {/* Enhanced CTA Button */}
                <Button 
                  className={cn(
                    "w-full py-3 px-6 text-lg font-semibold shadow-lg transition-all duration-300 transform hover:scale-105",
                    index === 0 && "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
                    index === 1 && "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600",
                    index === 2 && "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  )}
                  onClick={() => handleStartTrial(plan.id, plan.name)}
                >
                  Choose {plan.name.replace(' Plan', '')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <h2 className="text-2xl font-bold mb-2">📊 Feature Comparison Table</h2>
            <p className="text-blue-100">Compare all features across our subscription plans</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">🧪 Basic</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">📈 Professional</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">🏢 Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { name: "🌍 Marine Zones", basic: "2 zones", professional: "6 strategic zones", enterprise: "9 major global maritime zones" },
                  { name: "🚢 Vessel Tracking", basic: "Up to 250 tankers", professional: "Unlimited with status", enterprise: "Full live tracking with verified activity" },
                  { name: "🏭 Refinery Access", basic: "Up to 25 refineries", professional: "Expanded data + operational info", enterprise: "Full access including internal documentation" },
                  { name: "⚓ Port Coverage", basic: "5 major ports", professional: "20+ international ports", enterprise: "100+ strategic global ports" },
                  { name: "📄 Documentation", basic: "LOI, B/L only", professional: "Includes SPA, ICPO, NCNDA", enterprise: "Full set: SGS, SDS, Q88, ATB, customs" },
                  { name: "📈 Deal Participation", basic: "View-only access", professional: "Limited participation in active deals", enterprise: "Full participation + contract management" },
                  { name: "👥 Users", basic: "1 user", professional: "Up to 3 users", enterprise: "Full team access with permissions" },
                  { name: "📬 Support", basic: "Email support only", professional: "Direct support + onboarding", enterprise: "24/7 premium + dedicated manager" },
                ].map((feature, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{feature.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">{feature.basic}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">{feature.professional}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">{feature.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Exclusive Features Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-16">
          <div className="bg-gradient-to-r from-purple-600 to-orange-600 text-white p-6">
            <h2 className="text-2xl font-bold mb-2">🏅 Exclusive Features (Professional & Enterprise)</h2>
            <p className="text-purple-100">Advanced capabilities for serious petroleum traders</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Exclusive Feature</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">🧪 Basic</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">📈 Professional</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">🏢 Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {exclusiveFeatures.map((feature, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{feature.name}</td>
                    <td className="px-6 py-4 text-center">
                      {feature.basic ? (
                        <span className="text-sm text-gray-600">{feature.basic}</span>
                      ) : (
                        <X className="h-5 w-5 text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">
                      <Check className="h-5 w-5 text-green-500 mx-auto mb-1" />
                      <div className="text-xs">{feature.professional}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">
                      <Check className="h-5 w-5 text-green-500 mx-auto mb-1" />
                      <div className="text-xs">{feature.enterprise}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Plans Include Section */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl text-white p-8 mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">✅ All Plans Include:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "Full access to your dashboard within minutes",
              "Support in Arabic, English, French, Turkish, and more",
              "Full transparency in all deal steps",
              "Secure infrastructure",
              "No long-term commitment — upgrade, downgrade, or cancel anytime",
              "5-Day free trial for every plan — no credit card required"
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-200 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">🚀 Start Trading Smarter</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Gain access to trusted documentation, refinery profiles, real-time vessel movement, 
            and global petroleum contracts – all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white px-8 py-3"
              onClick={() => handleStartTrial(2, "Professional")}
            >
              🔹 Start Free Trial
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="px-8 py-3">
                🔹 Compare All Plans
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="px-8 py-3">
                🔹 Book a Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}