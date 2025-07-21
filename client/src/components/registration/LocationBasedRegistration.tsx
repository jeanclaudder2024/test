import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Ship, 
  Factory, 
  Globe, 
  CheckCircle2, 
  ArrowRight,
  Waves,
  Anchor,
  Building2,
  Users,
  Fuel
} from 'lucide-react';

interface Port {
  id: number;
  name: string;
  country: string;
  region: string;
  lat: string;
  lng: string;
}

interface Vessel {
  id: number;
  name: string;
  vesselType: string;
  oilType: string;
  cargoCapacity: number;
  currentLocation: string;
}

interface Refinery {
  id: number;
  name: string;
  country: string;
  region: string;
  processingCapacity: number;
}

interface SubscriptionPlan {
  id: number;
  name: string;
  price: string;
  maxPorts: number;
  maxVessels: number;
  maxRefineries: number;
  description: string;
  features: string[];
}

interface LocationBasedRegistrationProps {
  onComplete: (data: { selectedPlan: number; selectedPort: number; previewData: any }) => void;
}

export default function LocationBasedRegistration({ onComplete }: LocationBasedRegistrationProps) {
  const [step, setStep] = useState(1);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedPorts, setSelectedPorts] = useState<number[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);

  // Fetch ports from public endpoint for registration
  const { data: portsResponse, isLoading: portsLoading } = useQuery({
    queryKey: ['/api/public/ports'],
    staleTime: 0,
  });
  
  const ports = portsResponse?.ports || [];

  // No longer need vessel/refinery proximity queries for registration since we show selections instead

  // Subscription plans with limits
  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 1,
      name: "🧪 Basic",
      price: "$69",
      maxPorts: 5,
      maxVessels: 50,
      maxRefineries: 10,
      description: "Perfect for independent brokers starting in petroleum markets",
      features: [
        "Access to 2 major maritime zones",
        "Basic vessel tracking with verified activity",
        "Access to 5 regional ports",
        "Basic documentation: LOI, SPA",
        "Email support"
      ]
    },
    {
      id: 2,
      name: "📈 Professional",
      price: "$150",
      maxPorts: 20,
      maxVessels: 100,
      maxRefineries: 25,
      description: "Professional brokers and medium-scale petroleum trading companies",
      features: [
        "Access to 6 major maritime zones",
        "Enhanced tracking with real-time updates",
        "Access to 20+ strategic ports",
        "Enhanced documentation: LOI, B/L, SPA, ICPO",
        "Basic broker features + deal participation",
        "Priority email support"
      ]
    },
    {
      id: 3,
      name: "🏢 Enterprise",
      price: "$399",
      maxPorts: 999,
      maxVessels: 999,
      maxRefineries: 999,
      description: "Full-scale solution for large petroleum trading corporations",
      features: [
        "Access to 9 major global maritime zones",
        "Full live tracking with verified activity",
        "Access to 100+ strategic global ports",
        "Full documentation set",
        "International Broker ID eligibility",
        "Legal protection coverage",
        "24/7 priority support"
      ]
    }
  ];

  // Get unique regions from ports
  const regions = [...new Set(ports.map((port: Port) => port.region))].filter(Boolean);

  // Get regions based on selected plan limits
  const getRegionsForPlan = (planId: number) => {
    const plan = subscriptionPlans.find(p => p.id === planId);
    if (!plan) return [];
    
    if (plan.id === 1) { // Basic - 2 regions
      return regions.slice(0, 2);
    } else if (plan.id === 2) { // Professional - 6 regions
      return regions.slice(0, 6);
    } else { // Enterprise - all regions
      return regions;
    }
  };

  // Filter ports by selected regions (no plan limits during registration)
  const filteredPorts = selectedRegions.length > 0
    ? ports.filter((port: Port) => selectedRegions.includes(port.region))
    : [];

  // Generate preview data when ports and plan are selected
  useEffect(() => {
    if (selectedPorts.length > 0 && selectedPlan) {
      const plan = subscriptionPlans.find(p => p.id === selectedPlan);
      const selectedPortData = ports.filter((p: Port) => selectedPorts.includes(p.id));
      
      if (plan && selectedPortData.length > 0) {
        setPreviewData({
          selectedPorts: selectedPortData,
          selectedRegions: selectedRegions,
          selectedPlan: plan,
          totalPortsSelected: selectedPorts.length,
          totalRegionsSelected: selectedRegions.length
        });
      }
    }
  }, [selectedPorts, selectedPlan, selectedRegions, ports]);

  // Step 1: Select Subscription Plan (Beautiful Design Matching Pricing Page)
  const PlanStep = () => (
    <div className="space-y-8">
      {/* Professional Header */}
      <div className="text-center mb-12">
        <Badge variant="outline" className="px-4 py-1 bg-blue-500/20 text-blue-700 border-blue-500/30 backdrop-blur-sm mb-6 inline-flex items-center">
          <div className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></div>
          Free Trial Available
        </Badge>
        <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">
          Choose Your Maritime Plan
        </h2>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Start your petroleum trading journey with professional maritime tracking and analytics. All plans include 5-day free trial.
        </p>
      </div>

      {/* Professional Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {subscriptionPlans.map((plan, index) => (
          <Card 
            key={plan.id}
            className={`relative cursor-pointer transition-all duration-500 hover:scale-105 transform ${
              selectedPlan === plan.id 
                ? 'ring-4 ring-blue-500 shadow-2xl scale-105' 
                : 'hover:shadow-xl'
            } ${
              index === 0 && 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200'
            } ${
              index === 1 && 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 relative'
            } ${
              index === 2 && 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
            }`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            {/* Popular Badge for Professional Plan */}
            {index === 1 && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
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
                {plan.name.replace('🧪 ', '').replace('📈 ', '').replace('🏢 ', '')}
              </CardTitle>
              <div className="flex items-baseline justify-center">
                <span className={`text-5xl font-bold ${
                  index === 0 && 'bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent'
                } ${
                  index === 1 && 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'
                } ${
                  index === 2 && 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'
                }`}>
                  {plan.price}
                </span>
                <span className="text-xl text-slate-500 ml-2">/month</span>
              </div>
              <div className="text-sm text-slate-500 mt-2">
                5-day free trial included
              </div>
            </CardHeader>

            <CardContent className="space-y-6 px-6 pb-8">
              <p className="text-slate-600 text-center leading-relaxed">
                {plan.description}
              </p>
              
              {/* Enhanced Features List */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    index === 0 && 'bg-orange-100'
                  } ${
                    index === 1 && 'bg-blue-100'
                  } ${
                    index === 2 && 'bg-purple-100'
                  }`}>
                    <Globe className={`w-4 h-4 ${
                      index === 0 && 'text-orange-600'
                    } ${
                      index === 1 && 'text-blue-600'
                    } ${
                      index === 2 && 'text-purple-600'
                    }`} />
                  </div>
                  <span className="font-semibold text-slate-700">
                    {plan.id === 1 ? '2 Maritime Regions' : 
                     plan.id === 2 ? '6 Maritime Regions' : 
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
                    <Anchor className={`w-4 h-4 ${
                      index === 0 && 'text-orange-600'
                    } ${
                      index === 1 && 'text-blue-600'
                    } ${
                      index === 2 && 'text-purple-600'
                    }`} />
                  </div>
                  <span className="text-slate-700">
                    {plan.maxPorts === 999 ? 'Unlimited' : plan.maxPorts} Strategic Ports
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
                    <Ship className={`w-4 h-4 ${
                      index === 0 && 'text-orange-600'
                    } ${
                      index === 1 && 'text-blue-600'
                    } ${
                      index === 2 && 'text-purple-600'
                    }`} />
                  </div>
                  <span className="text-slate-700">
                    {plan.maxVessels === 999 ? 'Unlimited' : plan.maxVessels} Vessel Tracking
                  </span>
                </div>

                {/* Professional Features */}
                <div className="pt-3 space-y-2">
                  {plan.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-start">
                      <CheckCircle2 className={`w-4 h-4 mr-2 mt-0.5 ${
                        index === 0 && 'text-orange-500'
                      } ${
                        index === 1 && 'text-blue-500'
                      } ${
                        index === 2 && 'text-purple-500'
                      }`} />
                      <span className="text-sm text-slate-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selection Indicator */}
              {selectedPlan === plan.id && (
                <div className="pt-4 flex justify-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    index === 0 && 'bg-gradient-to-r from-orange-500 to-red-500'
                  } ${
                    index === 1 && 'bg-gradient-to-r from-blue-500 to-indigo-500'
                  } ${
                    index === 2 && 'bg-gradient-to-r from-purple-500 to-pink-500'
                  } shadow-lg animate-pulse`}>
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Continue Button */}
      {selectedPlan && (
        <div className="flex justify-center pt-8">
          <Button 
            onClick={() => setStep(2)}
            size="lg"
            className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Continue to Region Selection
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );

  // Step 2: Select Multiple Regions and Ports (no restrictions)
  const LocationStep = () => {
    const toggleRegion = (region: string) => {
      setSelectedRegions(prev => 
        prev.includes(region) 
          ? prev.filter(r => r !== region)
          : [...prev, region]
      );
    };

    const togglePort = (portId: number) => {
      const plan = subscriptionPlans.find(p => p.id === selectedPlan);
      if (!plan) return;

      setSelectedPorts(prev => {
        if (prev.includes(portId)) {
          // Remove port if already selected
          return prev.filter(p => p !== portId);
        } else {
          // Add port only if under plan limit
          if (prev.length < plan.maxPorts) {
            return [...prev, portId];
          } else {
            // Show user they've reached the limit
            alert(`You can only select up to ${plan.maxPorts} ports with your ${plan.name} plan`);
            return prev;
          }
        }
      });
    };

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Maritime Regions & Ports
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select as many regions and ports as you're interested in. Your subscription plan will determine how many you can actively access.
          </p>
        </div>

        {/* Region Selection - No Limits */}
        <div className="space-y-4">
          <label className="text-lg font-semibold text-gray-900">
            <Globe className="inline-block w-5 h-5 mr-2" />
            Select Your Regions
            <Badge className="ml-2" variant="outline">
              {selectedRegions.length} selected
            </Badge>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {regions.map((region) => (
              <Card 
                key={region}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedRegions.includes(region) 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => toggleRegion(region)}
              >
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="font-medium text-sm">{region}</span>
                    {selectedRegions.includes(region) && (
                      <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Port Selection */}
        {selectedRegions.length > 0 && (
          <div className="space-y-4">
            <label className="text-lg font-semibold text-gray-900">
              <MapPin className="inline-block w-5 h-5 mr-2" />
              Select Your Ports
              <Badge className="ml-2" variant="outline">
                {selectedPorts.length} / {subscriptionPlans.find(p => p.id === selectedPlan)?.maxPorts} selected
              </Badge>
              {selectedPorts.length >= (subscriptionPlans.find(p => p.id === selectedPlan)?.maxPorts || 0) && (
                <Badge className="ml-2 bg-orange-100 text-orange-800">
                  Plan limit reached
                </Badge>
              )}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {filteredPorts.map((port: Port) => {
                const plan = subscriptionPlans.find(p => p.id === selectedPlan);
                const isSelected = selectedPorts.includes(port.id);
                const canSelect = isSelected || selectedPorts.length < (plan?.maxPorts || 0);
                
                return (
                  <Card 
                    key={port.id}
                    className={`transition-all duration-200 ${
                      canSelect ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed opacity-50'
                    } ${
                      isSelected 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : canSelect ? 'hover:bg-gray-50' : 'bg-gray-100'
                    }`}
                    onClick={() => canSelect && togglePort(port.id)}
                  >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{port.name}</h3>
                        <p className="text-sm text-gray-600">{port.country}</p>
                        <p className="text-xs text-purple-600 font-medium">{port.region}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {parseFloat(port.lat).toFixed(2)}, {parseFloat(port.lng).toFixed(2)}
                        </div>
                      </div>
                      {selectedPorts.includes(port.id) && (
                        <CheckCircle2 className="w-6 h-6 text-blue-500" />
                      )}
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          </div>
        )}

        {selectedPorts.length > 0 && (
          <div className="flex justify-center space-x-4">
            <Button 
              variant="outline"
              onClick={() => setStep(1)}
              className="px-6 py-3"
            >
              Change Plan
            </Button>
            <Button 
              onClick={() => setStep(3)}
              className="px-8 py-3 text-lg"
            >
              Preview Your Access
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
      </div>
    );
  };



  // Step 3: Preview what user will get with their selections
  const PreviewStep = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Your Access Preview
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Based on your selections, here's what your subscription plan will give you access to.
        </p>
      </div>

      {previewData && (
        <div className="space-y-6">
          {/* Selected Plan Summary */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-blue-900">
                    {previewData.selectedPlan.name} Plan
                  </h3>
                  <div className="space-y-1 text-blue-700">
                    <p>{previewData.totalRegionsSelected} regions selected • {previewData.totalPortsSelected} ports selected</p>
                    <p className="text-sm">Your plan will give you access based on subscription limits</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-900">
                    {previewData.selectedPlan.price}
                  </div>
                  <div className="text-blue-700">/month</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Selections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Selected Regions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-purple-500" />
                  Selected Regions
                </CardTitle>
                <CardDescription>
                  {previewData.totalRegionsSelected} regions you're interested in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {previewData.selectedRegions.map((region: string, idx: number) => (
                    <div key={region} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-3" />
                      <span className="font-medium text-sm">{region}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Selected Ports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Anchor className="w-5 h-5 mr-2 text-blue-500" />
                  Selected Ports
                </CardTitle>
                <CardDescription>
                  {previewData.totalPortsSelected} ports you're interested in
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {previewData.selectedPorts.slice(0, 8).map((port: Port) => (
                    <div key={port.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{port.name}</div>
                        <div className="text-xs text-gray-600">{port.country} • {port.region}</div>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                  ))}
                  {previewData.selectedPorts.length > 8 && (
                    <div className="text-center text-sm text-gray-500 pt-2">
                      ...and {previewData.selectedPorts.length - 8} more ports
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Plan Limits Information */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-6">
              <h4 className="font-semibold text-yellow-900 mb-3">
                🔢 Your Plan Access Limits
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-900">
                    {previewData.selectedPlan.maxPorts}
                  </div>
                  <div className="text-yellow-700">Max Ports</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-900">
                    {previewData.selectedPlan.maxVessels}
                  </div>
                  <div className="text-yellow-700">Max Vessels</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-900">
                    {previewData.selectedPlan.maxRefineries}
                  </div>
                  <div className="text-yellow-700">Max Refineries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-900">
                    {previewData.selectedPlan.id === 1 ? '2' : 
                     previewData.selectedPlan.id === 2 ? '6' : '9+'}
                  </div>
                  <div className="text-yellow-700">Regions</div>
                </div>
              </div>
              <p className="text-xs text-yellow-700 mt-3 text-center">
                While you selected {previewData.totalPortsSelected} ports, your plan gives you access to up to {previewData.selectedPlan.maxPorts} ports with full features.
              </p>
            </CardContent>
          </Card>

          {/* Complete Registration Button */}
          <div className="flex justify-center pt-6">
            <Button 
              onClick={() => onComplete({
                selectedPlan: selectedPlan!,
                selectedPort: selectedPorts[0] || 1,
                previewData
              })}
              className="px-12 py-4 text-lg bg-blue-600 hover:bg-blue-700"
            >
              Complete Registration with This Plan
              <CheckCircle2 className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  if (portsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Waves className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading port locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= stepNumber 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`w-20 h-1 mx-2 ${
                  step > stepNumber ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-4">
          <p className="text-gray-600">
            Step {step} of 3: {
              step === 1 ? 'Choose Plan' : 
              step === 2 ? 'Select Location' : 
              'Preview Access'
            }
          </p>
        </div>
      </div>

      {/* Step Content */}
      {step === 1 && <PlanStep />}
      {step === 2 && <LocationStep />}
      {step === 3 && <PreviewStep />}
    </div>
  );
}