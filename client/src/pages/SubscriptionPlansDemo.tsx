import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Crown, Zap, Users, ArrowRight } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';

const demoPlans = [
  {
    id: 1,
    name: "Free Trial",
    description: "3-day free trial with full access",
    price: 0,
    interval: "trial",
    trialDays: 3,
    features: [
      "Real-time vessel tracking",
      "Basic port information", 
      "Limited refinery data",
      "Standard support"
    ],
    maxVessels: 10,
    maxPorts: 10,
    maxRefineries: 5,
    canAccessBrokerFeatures: false,
    canAccessAnalytics: false,
    canExportData: false
  },
  {
    id: 2,
    name: "Professional",
    description: "Advanced features for maritime professionals",
    price: 29,
    interval: "month",
    trialDays: 0,
    features: [
      "Unlimited vessel tracking",
      "Complete port database",
      "Full refinery access",
      "Advanced analytics",
      "Document generation",
      "Priority support"
    ],
    maxVessels: -1,
    maxPorts: -1,
    maxRefineries: -1,
    canAccessBrokerFeatures: true,
    canAccessAnalytics: true,
    canExportData: true
  },
  {
    id: 3,
    name: "Enterprise",
    description: "Full-scale solution for large operations",
    price: 99,
    interval: "month",
    trialDays: 0,
    features: [
      "Everything in Professional",
      "Dedicated account manager",
      "Custom integrations",
      "24/7 phone support",
      "SLA guarantee",
      "White-label options"
    ],
    maxVessels: -1,
    maxPorts: -1,
    maxRefineries: -1,
    canAccessBrokerFeatures: true,
    canAccessAnalytics: true,
    canExportData: true
  }
];

export default function SubscriptionPlansDemo() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSelectPlan = async (planId: number) => {
    try {
      // Store selected plan in localStorage for payment page
      localStorage.setItem('selectedPlanId', planId.toString());
      // Redirect to payment methods page
      setLocation('/payment');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start checkout process. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free trial':
        return <Star className="h-6 w-6 text-blue-600" />;
      case 'professional':
        return <Zap className="h-6 w-6 text-purple-600" />;
      case 'enterprise':
        return <Crown className="h-6 w-6 text-orange-600" />;
      default:
        return <Check className="h-6 w-6 text-gray-600" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free trial':
        return 'from-blue-500 to-blue-600';
      case 'professional':
        return 'from-purple-500 to-purple-600';
      case 'enterprise':
        return 'from-orange-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getPopularBadge = (planName: string) => {
    return planName.toLowerCase() === 'professional';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Unlock the full potential of maritime operations with our comprehensive tracking and management platform
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-green-600">
              <Check className="h-4 w-4" />
              <span>30-day money-back guarantee</span>
            </div>
          </motion.div>

          {/* Plans Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {demoPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="relative"
              >
                <Card className={`h-full shadow-xl border-0 bg-white/90 backdrop-blur-sm relative overflow-hidden ${
                  getPopularBadge(plan.name) ? 'ring-2 ring-purple-500' : ''
                }`}>
                  {getPopularBadge(plan.name) && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-purple-500 text-white px-3 py-1">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-8">
                    <div className="mb-4 flex justify-center">
                      {getPlanIcon(plan.name)}
                    </div>
                    <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
                    <CardDescription className="text-gray-600 mb-4">
                      {plan.description}
                    </CardDescription>
                    
                    {/* Pricing */}
                    <div className="mb-6">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-gray-900">
                          ${plan.price}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-gray-600">/{plan.interval}</span>
                        )}
                      </div>
                      {plan.price === 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          Then ${demoPlans[1].price}/month
                        </p>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Features List */}
                    <div className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <Check className="h-4 w-4 text-green-500" />
                          </div>
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Resource Limits */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Resource Limits</h4>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">
                            {plan.maxVessels === -1 ? '∞' : plan.maxVessels}
                          </div>
                          <div className="text-gray-600">Vessels</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">
                            {plan.maxPorts === -1 ? '∞' : plan.maxPorts}
                          </div>
                          <div className="text-gray-600">Ports</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">
                            {plan.maxRefineries === -1 ? '∞' : plan.maxRefineries}
                          </div>
                          <div className="text-gray-600">Refineries</div>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="mt-6"
                    >
                      <Button
                        onClick={() => handleSelectPlan(plan.id)}
                        className={`w-full bg-gradient-to-r ${getPlanColor(plan.name)} hover:opacity-90 transition-opacity text-white`}
                        size="lg"
                      >
                        {plan.price === 0 ? 'Start Free Trial' : `Upgrade to ${plan.name}`}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* FAQ Section */}
          <motion.div variants={itemVariants} className="mt-16 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Frequently Asked Questions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Can I change plans later?</h3>
                  <p className="text-gray-600 text-sm">
                    Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">What happens after my trial ends?</h3>
                  <p className="text-gray-600 text-sm">
                    Your account will be restricted until you choose a paid plan. Your data remains safe.
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Do you offer refunds?</h3>
                  <p className="text-gray-600 text-sm">
                    Yes, we offer a 30-day money-back guarantee for all paid plans.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Is my data secure?</h3>
                  <p className="text-gray-600 text-sm">
                    Absolutely. We use enterprise-grade security and comply with maritime industry standards.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}