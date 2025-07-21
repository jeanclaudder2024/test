import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  MapPin, 
  Ship, 
  Factory, 
  Globe, 
  CheckCircle2, 
  ArrowRight,
  ArrowLeft,
  Waves,
  Anchor,
  Building2,
  Users,
  Fuel,
  Zap,
  Star,
  Crown,
  CreditCard,
  Lock,
  Calendar,
  Shield,
  ExternalLink,
  UserCheck,
  User,
  Loader2,
  Eye,
  EyeOff,
  Mail,
  AlertTriangle,
  CheckCircle
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
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  interval: string;
  features: string[];
  isPopular: boolean;
  trialDays: number;
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
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation function
  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push("At least 8 characters long");
    if (!/[A-Z]/.test(password)) errors.push("One uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("One lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("One number");
    if (!/[!@#$%^&*]/.test(password)) errors.push("One special character (!@#$%^&*)");
    return errors;
  };

  // Update password errors when password changes
  React.useEffect(() => {
    if (userPassword) {
      setPasswordErrors(validatePassword(userPassword));
    } else {
      setPasswordErrors([]);
    }
  }, [userPassword]);

  // Fetch ports from public endpoint for registration
  const { data: portsResponse, isLoading: portsLoading } = useQuery({
    queryKey: ['/api/public/ports'],
    staleTime: 0,
  });
  
  const ports = (portsResponse as any)?.ports || [];

  // Fetch subscription plans from API
  const { data: plans, isLoading: plansLoading, error: plansError } = useQuery({
    queryKey: ['/api/subscription-plans'],
    staleTime: 0,
  });

  // Format currency helper
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Get unique regions from ports
  const regions: string[] = Array.from(new Set(ports.map((port: Port) => port.region))).filter(Boolean) as string[];

  // Get regions based on selected plan limits
  const getRegionsForPlan = (planId: number): string[] => {
    const plan = (plans as SubscriptionPlan[])?.find((p: SubscriptionPlan) => p.id === planId);
    if (!plan) return regions; // Show all regions if no plan found
    
    // Show all available regions during registration
    return regions;
  };

  // Get maximum regions allowed for a plan (for display purposes)
  const getMaxRegionsForPlan = (planId: number) => {
    if (planId === 1) return 2; // Basic - 2 regions
    if (planId === 2) return 6; // Professional - 6 regions
    return regions.length; // Enterprise - all regions
  };

  // Filter ports by selected region (show all ports in selected region)
  const filteredPorts = selectedRegions.length > 0
    ? ports.filter((port: Port) => selectedRegions.includes(port.region))
    : [];

  // Generate preview data when ports and plan are selected
  useEffect(() => {
    if (selectedPorts.length > 0 && selectedPlan && plans) {
      const plan = (plans as SubscriptionPlan[])?.find((p: SubscriptionPlan) => p.id === selectedPlan);
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
  }, [selectedPorts, selectedPlan, selectedRegions, ports, plans]);

  // Step 1: Select Subscription Plan (Beautiful Design Matching Pricing Page)
  const PlanStep = () => {
    if (plansLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      );
    }

    if (plansError || !plans) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-red-600">Failed to load subscription plans</p>
        </div>
      );
    }

    return (
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
            Start your petroleum trading journey with professional maritime tracking and analytics. All plans include {(plans as SubscriptionPlan[])?.[0]?.trialDays || 5}-day free trial.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4 bg-gray-100 p-1 rounded-lg">
            <Label 
              htmlFor="billing-monthly" 
              className={`cursor-pointer px-4 py-2 rounded-md transition-all ${
                billingInterval === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              <span>Monthly Billing</span>
            </Label>
            <Switch
              id="billing-toggle"
              checked={billingInterval === 'year'}
              onCheckedChange={(checked) => setBillingInterval(checked ? 'year' : 'month')}
            />
            <Label 
              htmlFor="billing-yearly" 
              className={`cursor-pointer px-4 py-2 rounded-md transition-all flex items-center space-x-2 ${
                billingInterval === 'year' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              <span>Annual Billing</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Save 20%
              </Badge>
            </Label>
          </div>
        </div>

        {/* Professional Plan Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {(plans as SubscriptionPlan[])?.map((plan: SubscriptionPlan, index: number) => {
            const price = billingInterval === 'month' 
              ? plan.monthlyPrice 
              : plan.yearlyPrice;
              
            return (
              <Card key={plan.id} className={`flex flex-col ${
                plan.isPopular ? "border-primary shadow-md" : ""
              } ${
                selectedPlan === plan.id 
                  ? 'ring-4 ring-blue-500 shadow-2xl scale-105' 
                  : 'hover:shadow-xl'
              } cursor-pointer transition-all duration-500 hover:scale-105 transform`}
              onClick={() => setSelectedPlan(plan.id)}>
                <CardHeader>
                  {plan.isPopular && (
                    <Badge className="w-fit bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-lg mb-2">
                      ⭐ Most Popular
                    </Badge>
                  )}
                  <div className="flex items-center space-x-2">
                    {index === 0 && <Zap className="w-6 h-6 text-orange-500" />}
                    {index === 1 && <Star className="w-6 h-6 text-blue-500" />}
                    {index === 2 && <Crown className="w-6 h-6 text-purple-500" />}
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-primary">
                      {formatCurrency(price, plan.currency)}
                    </span>
                    <span className="text-muted-foreground">/{billingInterval}</span>
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    {plan.trialDays}-day free trial included
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <CardDescription className="text-base mb-6">
                    {plan.description}
                  </CardDescription>
                  <ul className="space-y-2">
                    {plan.features.map((feature: string, featureIndex: number) => (
                      <li key={featureIndex} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center mt-8">
          <Button 
            size="lg" 
            onClick={() => selectedPlan && setStep(2)}
            disabled={!selectedPlan}
            className="px-8 py-3 text-lg"
          >
            Continue to Regional Selection
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  // Step 2: Select Maritime Regions
  const RegionStep = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">
          Select Your Maritime Regions
        </h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Choose the maritime regions you want to focus on based on your selected plan.
        </p>
        
        {selectedPlan && plans && Array.isArray(plans) && plans.length > 0 ? (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800 font-semibold">
                Your {(plans as SubscriptionPlan[])?.find((p: SubscriptionPlan) => p.id === selectedPlan)?.name || 'Selected'} plan allows access to{' '}
                {getMaxRegionsForPlan(selectedPlan)} of {regions.length} available maritime regions.
              </p>
            </div>
            
            {selectedRegions.length > 0 && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-800 font-semibold">
                  Selected: {selectedRegions.length} / {getMaxRegionsForPlan(selectedPlan)} regions
                </p>
                {selectedRegions.length >= getMaxRegionsForPlan(selectedPlan) && selectedPlan !== 3 && (
                  <p className="text-green-600 text-sm mt-1">
                    You've reached your plan limit. Upgrade to access more regions.
                  </p>
                )}
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getRegionsForPlan(selectedPlan || 1).map((region: string) => {
          const isSelected = selectedRegions.includes(region);
          const maxRegions = getMaxRegionsForPlan(selectedPlan || 1);
          const isAtLimit = selectedRegions.length >= maxRegions && !isSelected;
          
          return (
            <Card 
              key={region}
              className={`transition-all duration-300 ${
                isSelected
                  ? 'ring-4 ring-blue-500 bg-blue-50 border-blue-200' 
                  : isAtLimit
                    ? 'opacity-50 cursor-not-allowed bg-gray-50'
                    : 'cursor-pointer hover:shadow-lg hover:shadow-xl'
              }`}
            onClick={() => {
              setSelectedRegions((prev: string[]) => {
                if (prev.includes(region)) {
                  // Remove region if already selected
                  return prev.filter((r: string) => r !== region);
                } else {
                  // Add region if under limit
                  const maxRegions = getMaxRegionsForPlan(selectedPlan || 1);
                  if (prev.length < maxRegions) {
                    return [...prev, region];
                  }
                  return prev; // Don't add if at limit
                }
              });
            }}
          >
            <CardHeader className="text-center">
              <div className="flex justify-center mb-3">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Globe className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-xl text-slate-800">{region}</CardTitle>
              <p className="text-slate-600">
                {ports.filter((p: Port) => p.region === region).length} ports available
              </p>
            </CardHeader>
            
            <CardContent className="text-center">
              <Button 
                variant={isSelected ? "default" : "outline"}
                className={`w-full ${
                  isSelected 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : isAtLimit
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-blue-50'
                }`}
                disabled={isAtLimit}
              >
                {isSelected ? (
                  <span className="flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Selected
                  </span>
                ) : isAtLimit ? (
                  "Plan Limit Reached"
                ) : (
                  "Select Region"
                )}
              </Button>
            </CardContent>
          </Card>
          );
        })}
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={() => setStep(1)}>
          Back to Plans
        </Button>
        <Button 
          onClick={() => setStep(3)}
          disabled={selectedRegions.length === 0}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Continue to Port Selection
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );

  // Step 3: Select Strategic Ports
  const PortStep = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">
          Select Strategic Ports
        </h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Choose the ports that align with your trading focus and operational needs.
        </p>
      </div>

      {selectedRegions.map((region) => (
        <div key={region} className="mb-12">
          <h3 className="text-2xl font-bold mb-6 text-slate-800 flex items-center">
            <Waves className="w-6 h-6 mr-3 text-blue-600" />
            {region}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ports
              .filter((port: Port) => port.region === region)
              .map((port: Port) => (
                <Card 
                  key={port.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    selectedPorts.includes(port.id) 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => {
                    setSelectedPorts(prev => 
                      prev.includes(port.id) 
                        ? prev.filter(id => id !== port.id)
                        : [...prev, port.id]
                    );
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-slate-800">{port.name}</CardTitle>
                      {selectedPorts.includes(port.id) && (
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex items-center text-slate-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{port.country}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>Lat: {port.lat}</span>
                      <span>Lng: {port.lng}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={() => setStep(2)}>
          Back to Regions
        </Button>
        <Button 
          onClick={() => setStep(4)}
          disabled={selectedPorts.length === 0}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Create Account
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );

  // Step 5: Complete Registration - Simple without account setup
  const CompleteRegistrationStep = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleCompleteRegistration = async () => {
      setIsLoading(true);

      try {
        // Complete registration with all collected data
        const registrationData = {
          email: userEmail,
          password: userPassword,
          firstName: firstName,
          lastName: lastName,
          selectedPlan: selectedPlan,
          selectedRegions: selectedRegions,
          selectedPorts: selectedPorts,
          billingInterval: billingInterval
        };

        console.log('Creating account with data:', registrationData);

        // Call the registration API to create account
        const response = await fetch('/api/complete-registration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registrationData),
        });
        
        const result = await response.json();

        if (response.ok) {
          toast({
            title: "Registration Successful!",
            description: "Your account has been created successfully with a free trial.",
          });

          // Redirect to dashboard
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
        } else {
          throw new Error(result.message || 'Registration failed');
        }
      } catch (error) {
        console.error('Registration error:', error);
        toast({
          title: "Registration Failed",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">
            Complete Registration
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Review your selections and create your maritime trading account.
          </p>
        </div>

        {/* Registration Summary */}
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <CheckCircle2 className="w-6 h-6 text-green-600 mr-2" />
            Registration Summary
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Account Details</label>
                <div className="mt-1 space-y-1">
                  <p className="text-gray-900">{firstName} {lastName}</p>
                  <p className="text-gray-600">{userEmail}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Selected Plan</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {(plans as SubscriptionPlan[])?.find((p: SubscriptionPlan) => p.id === selectedPlan)?.name || 'Selected Plan'}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Maritime Coverage</label>
                <div className="mt-1">
                  <p className="text-gray-900">{selectedRegions.length} regions selected</p>
                  <p className="text-gray-600">{selectedPorts.length} strategic ports</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Billing Cycle</label>
                <p className="text-gray-900 mt-1 capitalize">{billingInterval}ly billing</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm text-green-800 font-medium">
                Your account will be created with a 5-day free trial. Add payment method when ready.
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(3)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Ports
          </Button>
          <Button 
            onClick={handleCompleteRegistration}
            disabled={!selectedPlan || isLoading}
            className="bg-green-600 hover:bg-green-700 px-8"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <CheckCircle2 className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  // Step 5: Preview and Confirm
  const PreviewStep = () => {
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">
            Review Your Selection
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Confirm your choices before proceeding to registration.
          </p>
        </div>

        {previewData && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Selected Plan */}
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-xl text-blue-800 flex items-center">
                    <Star className="w-6 h-6 mr-2" />
                    Selected Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-white rounded-lg">
                      <h3 className="text-2xl font-bold text-blue-800 mb-2">
                        {previewData.selectedPlan.name}
                      </h3>
                      <p className="text-3xl font-bold text-blue-600 mb-2">
                        {formatCurrency(billingInterval === 'month' ? previewData.selectedPlan.monthlyPrice : previewData.selectedPlan.yearlyPrice)}/{billingInterval}
                      </p>
                      <p className="text-slate-600">
                        {previewData.selectedPlan.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Selected Regions and Ports */}
              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-xl text-green-800 flex items-center">
                    <Globe className="w-6 h-6 mr-2" />
                    Selected Coverage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-white p-4 rounded-lg">
                      <h4 className="font-bold text-green-800 mb-2">Maritime Regions ({previewData.totalRegionsSelected})</h4>
                      <div className="flex flex-wrap gap-2">
                        {previewData.selectedRegions.map((region: string) => (
                          <Badge key={region} variant="outline" className="bg-green-100 text-green-700 border-green-300">
                            {region}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg">
                      <h4 className="font-bold text-green-800 mb-2">Strategic Ports ({previewData.totalPortsSelected})</h4>
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {previewData.selectedPorts.map((port: Port) => (
                          <div key={port.id} className="flex items-center justify-between text-sm border-b border-green-100 pb-1">
                            <span className="font-medium">{port.name}</span>
                            <span className="text-green-600">{port.country}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Registration Summary */}
            <Card className="border-2 border-green-200 bg-green-50 mt-8">
              <CardHeader>
                <CardTitle className="text-xl text-green-800 flex items-center">
                  <CheckCircle2 className="w-6 h-6 mr-2" />
                  Ready to Complete Registration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-6 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Selected Plan</Label>
                      <p className="text-lg font-semibold text-gray-900">{previewData?.selectedPlan.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Billing Cycle</Label>
                      <p className="text-lg font-semibold text-gray-900">{billingInterval}ly</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Regions Selected</Label>
                      <p className="text-lg font-semibold text-gray-900">{selectedRegions.length} regions</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Ports Selected</Label>
                      <p className="text-lg font-semibold text-gray-900">{selectedPorts.length} ports</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-green-100 rounded-lg">
                    <p className="text-sm text-green-800">
                      <CheckCircle2 className="w-4 h-4 inline mr-1" />
                      Complete registration now and add your payment method when ready to upgrade.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={() => setStep(4)}>
                Back to Account Setup
              </Button>
              <Button 
                onClick={() => {
                  if (previewData && selectedPlan) {
                    onComplete({
                      selectedPlan,
                      selectedPort: selectedPorts[0], // Pass first selected port
                      previewData
                    });
                  }
                }}
                disabled={!previewData}
                className="bg-green-600 hover:bg-green-700 px-8"
              >
                Complete Registration
                <CheckCircle2 className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </>
        )}
      </div>
    );
  };

  // Step 4: Account Creation - Login Page Style Design
  const AccountCreationStep = () => {
    const isFormValid = firstName.trim() && lastName.trim() && userEmail.trim() && 
                       userPassword && confirmPassword && 
                       passwordErrors.length === 0 && 
                       userPassword === confirmPassword;

    return (
      <div className="registration-container bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center relative">
        {/* Background Pattern - Exactly like login */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
          <div className="absolute -bottom-8 left-20 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        </div>

        {/* Floating Elements - Exactly like login */}
        <div className="absolute top-20 left-1/4 opacity-20">
          <Ship className="h-16 w-16 text-blue-300 animate-float" />
        </div>
        <div className="absolute bottom-32 right-1/4 opacity-20">
          <Waves className="h-12 w-12 text-cyan-300 animate-bounce" />
        </div>

        <div className="relative z-10 w-full max-w-md mx-auto p-4">
          {/* Logo and Header - Exactly like login */}
          <div className="text-center mb-6 space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Ship className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-30"></div>
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                Create Account
              </h1>
              <p className="text-slate-300 text-lg">Join your maritime trading hub</p>
            </div>
          </div>

          {/* Account Creation Form - Login Style */}
          <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl stable-form">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl text-white">Account Setup</CardTitle>
              <CardDescription className="text-slate-300">
                Create your oil trading account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-white font-medium">
                    First Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="w-full pl-12 h-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none backdrop-blur-sm transition-colors"
                      required
                      autoComplete="given-name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-white font-medium">
                    Last Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full pl-12 h-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none backdrop-blur-sm transition-colors"
                      required
                      autoComplete="family-name"
                    />
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="your@company.com"
                    className="w-full pl-12 h-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none backdrop-blur-sm transition-colors"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder="Create strong password"
                    className="w-full pl-12 pr-12 h-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 focus:outline-none backdrop-blur-sm transition-colors"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 h-5 w-5 text-slate-400 hover:text-green-400 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                
                {/* Compact Password Requirements */}
                {userPassword && passwordErrors.length > 0 && (
                  <div className="mt-2 p-3 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-xs text-slate-300 mb-2 flex items-center">
                      <Shield className="h-3 w-3 text-blue-400 mr-1" />
                      Missing requirements:
                    </p>
                    <div className="space-y-1">
                      {passwordErrors.slice(0, 3).map((error, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <AlertTriangle className="h-3 w-3 text-red-400" />
                          <span className="text-xs text-red-300">{error}</span>
                        </div>
                      ))}
                      {passwordErrors.length > 3 && (
                        <p className="text-xs text-slate-400">+{passwordErrors.length - 3} more...</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full pl-12 pr-12 h-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 focus:outline-none backdrop-blur-sm transition-colors"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-3.5 h-5 w-5 text-slate-400 hover:text-orange-400 transition-colors focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                
                {/* Password Match Status */}
                {confirmPassword && (
                  <div className={`mt-2 p-2 rounded-lg border ${
                    userPassword === confirmPassword 
                      ? 'bg-green-500/10 border-green-400/20' 
                      : 'bg-red-500/10 border-red-400/20'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {userPassword === confirmPassword ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                      )}
                      <span className={`text-sm ${
                        userPassword === confirmPassword ? 'text-green-300' : 'text-red-300'
                      }`}>
                        {userPassword === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Trial Info */}
              <div className="p-4 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-lg border border-blue-400/20">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {(plans as SubscriptionPlan[])?.find(p => p.id === selectedPlan)?.trialDays || 5}-Day Free Trial
                    </p>
                    <p className="text-xs text-slate-300">
                      No credit card required • Cancel anytime
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(3)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
                >
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(5)}
                  disabled={!isFormValid}
                  className={`px-6 ${
                    isFormValid 
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white' 
                      : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Special full-screen handling for Step 4 (Account Creation)
  if (step === 4) {
    return <AccountCreationStep />;
  }

  return (
    <div className="min-h-screen w-full">
      <div className="w-full">
        {/* Progress Indicator */}
        <div className="w-full bg-white border-b border-gray-200 py-8">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center justify-center space-x-4 mb-6">
              {[1, 2, 3, 4, 5].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    step >= stepNumber 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 5 && (
                    <div className={`w-16 h-1 mx-2 transition-all duration-300 ${
                      step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-800">
                {step === 1 && "Choose Your Plan"}
                {step === 2 && "Select Regions"}
                {step === 3 && "Choose Ports"}
                {step === 5 && "Complete Registration"}
              </h1>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="w-full min-h-[calc(100vh-200px)] bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 py-12">
            {step === 1 && <PlanStep />}
            {step === 2 && <RegionStep />}
            {step === 3 && <PortStep />}
            {step === 5 && <CompleteRegistrationStep />}
          </div>
        </div>
      </div>
    </div>
  );
}