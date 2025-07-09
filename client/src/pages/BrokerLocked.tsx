import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { 
  Lock, 
  Crown, 
  Shield, 
  Star, 
  CheckCircle, 
  ArrowRight,
  Building2,
  TrendingUp,
  FileText,
  Users,
  BarChart3,
  Handshake
} from 'lucide-react';

const PREMIUM_FEATURES = [
  {
    icon: Handshake,
    title: 'Deal Management',
    description: 'Track and manage oil trading deals with real-time progress monitoring'
  },
  {
    icon: FileText,
    title: 'Document Center',
    description: 'Secure document storage and sharing with admin team'
  },
  {
    icon: Building2,
    title: 'Company Network',
    description: 'Access to exclusive oil company partnerships and connections'
  },
  {
    icon: TrendingUp,
    title: 'Market Analytics',
    description: 'Advanced market insights and trading analytics dashboard'
  },
  {
    icon: BarChart3,
    title: 'Performance Reports',
    description: 'Comprehensive reporting on deal performance and commission tracking'
  },
  {
    icon: Users,
    title: 'VIP Support',
    description: 'Priority customer support and dedicated account management'
  }
];

export default function BrokerLocked() {
  const [, setLocation] = useLocation();

  const handleUpgrade = () => {
    setLocation('/broker-upgrade');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 pt-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Crown className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Broker Dashboard
          </h1>
          <p className="text-xl text-slate-600 mb-4">
            Premium Feature - Subscription Required
          </p>
          <Badge variant="outline" className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 px-4 py-2">
            <Shield className="w-4 h-4 mr-2" />
            Professional Oil Specialists Union Membership
          </Badge>
        </div>

        {/* Lock Card */}
        <Card className="mb-8 border-2 border-blue-200 shadow-xl bg-white/70 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-slate-800">
              Unlock Professional Trading Features
            </CardTitle>
            <p className="text-slate-600 mt-2">
              Join the Professional Oil Specialists Union to access exclusive broker tools and trading opportunities
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-yellow-500 mr-2" />
                <span className="text-lg font-semibold text-slate-800">Annual Membership</span>
                <Star className="w-6 h-6 text-yellow-500 ml-2" />
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-2">$299</div>
              <p className="text-slate-600">per year</p>
            </div>
            
            <Button 
              onClick={handleUpgrade}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              Upgrade to Premium
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <p className="text-sm text-slate-500 mt-4">
              Secure payment processing via Stripe • Cancel anytime
            </p>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {PREMIUM_FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">{feature.title}</h3>
                      <p className="text-sm text-slate-600">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Benefits Section */}
        <Card className="border-2 border-green-200 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-slate-800 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
              Membership Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-slate-700">Exclusive oil trading deals</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-slate-700">Direct company connections</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-slate-700">Real-time market analytics</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-slate-700">Professional certification</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-slate-700">Priority customer support</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-slate-700">Commission tracking tools</span>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-6">
              <Button 
                onClick={handleUpgrade}
                variant="outline"
                className="border-green-500 text-green-600 hover:bg-green-50"
              >
                Start Your Membership Journey
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}