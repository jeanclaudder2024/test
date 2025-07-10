import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, 
  Crown, 
  ArrowRight, 
  CheckCircle, 
  Zap,
  Star,
  CreditCard,
  Shield,
  Users,
  FileText,
  Globe,
  BarChart3
} from 'lucide-react';

export default function BrokerLocked() {
  const [, setLocation] = useLocation();

  const handleUpgrade = () => {
    setLocation('/pricing');
  };

  const handleLogin = () => {
    setLocation('/login');
  };

  const plans = [
    {
      name: "Professional",
      price: "$150",
      icon: <Star className="w-6 h-6" />,
      color: "from-blue-500 to-purple-600",
      features: [
        "Broker Dashboard Access",
        "Deal Management",
        "Document Generation",
        "Client Communications",
        "Performance Analytics",
        "20 Maritime Zones"
      ]
    },
    {
      name: "Enterprise",
      price: "$399",
      icon: <Crown className="w-6 h-6" />,
      color: "from-purple-500 to-pink-600",
      features: [
        "Everything in Professional",
        "Unlimited Maritime Zones",
        "Priority Support",
        "Custom Integrations",
        "Advanced Analytics",
        "Legal Protection"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Broker Features Locked</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your trial has expired. Upgrade to a Professional or Enterprise plan to continue accessing broker features.
          </p>
        </div>

        {/* Trial Expired Message */}
        <Card className="border-2 border-red-200 bg-red-50 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800">Trial Period Ended</h3>
                <p className="text-red-600">
                  Your broker trial has expired. Please upgrade to continue using broker features like deal management, document generation, and client communications.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {plans.map((plan, index) => (
            <Card key={plan.name} className="border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center text-white`}>
                      {plan.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-900">{plan.name}</CardTitle>
                      <p className="text-gray-600">Perfect for maritime brokers</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{plan.price}</div>
                    <div className="text-sm text-gray-500">per month</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={handleUpgrade}
                  className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white font-semibold py-3`}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Upgrade to {plan.name}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Preview */}
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-center text-gray-900">What You'll Get With Broker Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Deal Management</h4>
                <p className="text-sm text-gray-600">Track deals, manage pipelines, and monitor performance with advanced analytics.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Document Generation</h4>
                <p className="text-sm text-gray-600">Generate professional maritime documents, contracts, and certificates.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Client Communications</h4>
                <p className="text-sm text-gray-600">Manage client relationships and communications through our platform.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">
            Need help choosing the right plan? 
            <a href="mailto:support@petrodealhub.com" className="text-blue-600 hover:underline ml-1">
              Contact our sales team
            </a>
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={handleLogin}>
              <Users className="w-4 h-4 mr-2" />
              Login to Different Account
            </Button>
            <Button onClick={handleUpgrade} className="bg-blue-600 hover:bg-blue-700">
              <CreditCard className="w-4 h-4 mr-2" />
              View All Plans
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}