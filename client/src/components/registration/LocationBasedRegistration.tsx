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
  latitude: number;
  longitude: number;
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
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedPort, setSelectedPort] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);

  // Fetch ports from public endpoint for registration
  const { data: portsResponse, isLoading: portsLoading } = useQuery({
    queryKey: ['/api/public/ports'],
    staleTime: 0,
  });
  
  const ports = portsResponse?.ports || [];

  // Fetch vessels near selected port
  const { data: nearbyVessels = [], isLoading: vesselsLoading } = useQuery({
    queryKey: [`/api/port-proximity/vessels/${selectedPort}`],
    enabled: !!selectedPort,
    staleTime: 0,
  });

  // Fetch refineries near selected port
  const { data: nearbyRefineries = [], isLoading: refineriesLoading } = useQuery({
    queryKey: [`/api/port-proximity/refineries/${selectedPort}`],
    enabled: !!selectedPort,
    staleTime: 0,
  });

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

  // Filter ports by selected region
  const filteredPorts = selectedRegion 
    ? ports.filter((port: Port) => port.region === selectedRegion)
    : ports;

  // Generate preview data when port and plan are selected
  useEffect(() => {
    if (selectedPort && selectedPlan) {
      const plan = subscriptionPlans.find(p => p.id === selectedPlan);
      const port = ports.find((p: Port) => p.id === selectedPort);
      
      if (plan && port) {
        // Apply subscription limits to show exactly what user will get
        const limitedVessels = nearbyVessels.slice(0, plan.maxVessels);
        const limitedRefineries = nearbyRefineries.slice(0, plan.maxRefineries);
        
        setPreviewData({
          selectedPort: port,
          selectedPlan: plan,
          vessels: limitedVessels,
          refineries: limitedRefineries,
          totalNearbyVessels: nearbyVessels.length,
          totalNearbyRefineries: nearbyRefineries.length
        });
      }
    }
  }, [selectedPort, selectedPlan, nearbyVessels, nearbyRefineries, ports]);

  // Step 1: Select Region and Port
  const LocationStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Primary Port Location
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select your main port of operations to see exactly what vessels, refineries, 
          and trading opportunities you'll have access to with each subscription plan.
        </p>
      </div>

      {/* Region Selection */}
      <div className="space-y-4">
        <label className="text-lg font-semibold text-gray-900">
          <Globe className="inline-block w-5 h-5 mr-2" />
          Select Your Region
        </label>
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a maritime region..." />
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Port Selection */}
      {selectedRegion && (
        <div className="space-y-4">
          <label className="text-lg font-semibold text-gray-900">
            <Anchor className="inline-block w-5 h-5 mr-2" />
            Select Your Primary Port
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPorts.map((port: Port) => (
              <Card 
                key={port.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedPort === port.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedPort(port.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{port.name}</h3>
                      <p className="text-sm text-gray-600">{port.country}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {port.latitude.toFixed(2)}, {port.longitude.toFixed(2)}
                      </div>
                    </div>
                    {selectedPort === port.id && (
                      <CheckCircle2 className="w-6 h-6 text-blue-500" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedPort && (
        <div className="flex justify-center">
          <Button 
            onClick={() => setStep(2)}
            className="px-8 py-3 text-lg"
          >
            See Available Plans
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );

  // Step 2: Select Subscription Plan with Preview
  const PlanStep = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Subscription Plan
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          See exactly what you'll get access to at your selected port location.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {subscriptionPlans.map((plan) => (
          <Card 
            key={plan.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-xl ${
              selectedPlan === plan.id 
                ? 'ring-2 ring-blue-500 transform scale-105' 
                : 'hover:transform hover:scale-102'
            } ${plan.id === 2 ? 'ring-1 ring-orange-400' : ''}`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            {plan.id === 2 && (
              <div className="bg-orange-500 text-white text-center py-2 text-sm font-semibold">
                MOST POPULAR
              </div>
            )}
            
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center justify-between">
                {plan.name}
                {selectedPlan === plan.id && (
                  <CheckCircle2 className="w-6 h-6 text-blue-500" />
                )}
              </CardTitle>
              <div className="text-3xl font-bold text-blue-600">{plan.price}</div>
              <div className="text-sm text-gray-600">/month</div>
              <CardDescription className="text-sm">
                {plan.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* What you'll get at selected port */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">
                  At your selected port:
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Ship className="w-4 h-4 mr-2 text-blue-500" />
                      Vessels
                    </span>
                    <Badge variant="secondary">
                      {Math.min(nearbyVessels.length, plan.maxVessels)} of {nearbyVessels.length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Factory className="w-4 h-4 mr-2 text-green-500" />
                      Refineries
                    </span>
                    <Badge variant="secondary">
                      {Math.min(nearbyRefineries.length, plan.maxRefineries)} of {nearbyRefineries.length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Anchor className="w-4 h-4 mr-2 text-purple-500" />
                      Total Ports
                    </span>
                    <Badge variant="secondary">
                      Up to {plan.maxPorts}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Plan features */}
              <div className="space-y-2">
                {plan.features.slice(0, 3).map((feature, idx) => (
                  <div key={idx} className="flex items-start text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedPlan && (
        <div className="flex justify-center">
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

  // Step 3: Preview what user will get
  const PreviewStep = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Your Access Preview
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Here's exactly what you'll have access to with your selected plan and location.
        </p>
      </div>

      {previewData && (
        <div className="space-y-6">
          {/* Selected Plan and Port Summary */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-blue-900">
                    {previewData.selectedPlan.name} Plan
                  </h3>
                  <p className="text-blue-700">
                    Primary Port: {previewData.selectedPort.name}, {previewData.selectedPort.country}
                  </p>
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

          {/* Access Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vessels */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Ship className="w-5 h-5 mr-2 text-blue-500" />
                  Vessels You'll Access
                </CardTitle>
                <CardDescription>
                  {previewData.vessels.length} of {previewData.totalNearbyVessels} vessels near your port
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {previewData.vessels.slice(0, 8).map((vessel: Vessel) => (
                    <div key={vessel.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{vessel.name}</div>
                        <div className="text-xs text-gray-600">
                          {vessel.vesselType} • {vessel.oilType}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {vessel.cargoCapacity?.toLocaleString()} tons
                      </Badge>
                    </div>
                  ))}
                  {previewData.vessels.length > 8 && (
                    <div className="text-center text-sm text-gray-500 pt-2">
                      ...and {previewData.vessels.length - 8} more vessels
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Refineries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Factory className="w-5 h-5 mr-2 text-green-500" />
                  Refineries You'll Access
                </CardTitle>
                <CardDescription>
                  {previewData.refineries.length} of {previewData.totalNearbyRefineries} refineries near your port
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {previewData.refineries.slice(0, 8).map((refinery: Refinery) => (
                    <div key={refinery.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{refinery.name}</div>
                        <div className="text-xs text-gray-600">
                          {refinery.country} • {refinery.region}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {refinery.processingCapacity?.toLocaleString()} bpd
                      </Badge>
                    </div>
                  ))}
                  {previewData.refineries.length > 8 && (
                    <div className="text-center text-sm text-gray-500 pt-2">
                      ...and {previewData.refineries.length - 8} more refineries
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Complete Registration Button */}
          <div className="flex justify-center pt-6">
            <Button 
              onClick={() => onComplete({
                selectedPlan: selectedPlan!,
                selectedPort: selectedPort!,
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
              step === 1 ? 'Choose Location' : 
              step === 2 ? 'Select Plan' : 
              'Preview Access'
            }
          </p>
        </div>
      </div>

      {/* Step Content */}
      {step === 1 && <LocationStep />}
      {step === 2 && <PlanStep />}
      {step === 3 && <PreviewStep />}
    </div>
  );
}