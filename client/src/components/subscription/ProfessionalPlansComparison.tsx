import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Star, Crown, Zap, Users, ArrowRight, TestTube } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            💼 Choose the Plan That Fits Your Petroleum Trading Needs
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
            Whether you're an individual broker or a global trading company, PetroDealHub provides 
            flexible subscription plans tailored to your scale of operations, market access, and trading goals.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                plan.isPopular ? 'ring-2 ring-purple-500 shadow-2xl' : 'shadow-lg'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 left-0 right-0">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-center py-2 px-4 text-sm font-semibold">
                    ⭐ MOST POPULAR
                  </div>
                </div>
              )}
              
              <CardHeader className={`bg-gradient-to-r ${plan.gradient} text-white ${plan.isPopular ? 'pt-12' : 'pt-6'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{plan.emoji}</span>
                    <div className="bg-white/20 p-2 rounded-lg">
                      {plan.icon}
                    </div>
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-white/90">
                  {plan.description}
                </CardDescription>
                
                <div className="mt-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">${plan.monthlyPrice}</span>
                    <span className="text-white/80 ml-2">/ month</span>
                  </div>
                  <div className="text-white/80 text-sm mt-1">
                    ${plan.annualPrice} / year ({plan.annualSavings})
                  </div>
                  <div className="text-white/90 text-sm mt-2 font-medium">
                    {plan.trial}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="space-y-4 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-1 rounded">
                        <Check className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">🌍 Marine Zones</div>
                        <div className="text-sm text-gray-600">{plan.features.marineZones}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-100 p-1 rounded">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">🚢 Vessel Tracking</div>
                        <div className="text-sm text-gray-600">{plan.features.vesselTracking}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="bg-purple-100 p-1 rounded">
                        <Check className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">📄 Documentation</div>
                        <div className="text-sm text-gray-600">{plan.features.documentation}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="bg-orange-100 p-1 rounded">
                        <Check className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">👥 Users</div>
                        <div className="text-sm text-gray-600">{plan.features.users}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  className={`w-full bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white font-semibold py-3 rounded-lg transition-all duration-200`}
                  onClick={() => handleStartTrial(plan.id, plan.name)}
                >
                  🔹 Start Free Trial
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                
                <Link href="/pricing">
                  <Button variant="outline" className="w-full mt-2">
                    Compare All Plans
                  </Button>
                </Link>
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