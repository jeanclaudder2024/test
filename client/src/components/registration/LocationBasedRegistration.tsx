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

  // Step 4: Account Creation with Email and Password (Advanced Professional Design)
  const AccountCreationStep = () => {
    const isFormValid = firstName.trim() && lastName.trim() && userEmail.trim() && 
                       userPassword && confirmPassword && 
                       passwordErrors.length === 0 && 
                       userPassword === confirmPassword;

    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center relative overflow-hidden z-50">
        {/* Advanced Background Pattern */}
        <div className="absolute inset-0">
          {/* Animated Grid */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              animation: 'gridMove 20s linear infinite'
            }}></div>
          </div>
          
          {/* Dynamic Floating Orbs */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
            <div className="absolute top-60 right-20 w-80 h-80 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 left-40 w-72 h-72 bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
            <div className="absolute bottom-40 right-60 w-64 h-64 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-500"></div>
          </div>

          {/* Particle Effects */}
          <div className="absolute inset-0 overflow-hidden opacity-40">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full opacity-60"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Advanced Floating Maritime Elements */}
        <div className="absolute top-16 left-16 opacity-30">
          <div className="relative">
            <Ship className="h-20 w-20 text-cyan-300 animate-pulse" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-ping"></div>
          </div>
        </div>
        <div className="absolute bottom-20 right-20 opacity-30">
          <Waves className="h-16 w-16 text-blue-300 animate-bounce" />
        </div>
        <div className="absolute top-1/3 right-16 opacity-25">
          <div className="w-12 h-12 border-2 border-cyan-300 rounded-full animate-spin"></div>
        </div>
        <div className="absolute bottom-1/3 left-16 opacity-25">
          <div className="w-8 h-8 border-2 border-blue-300 rounded-full animate-ping"></div>
        </div>

        <div className="relative z-10 w-full max-w-lg px-6">
          {/* Advanced Logo and Header */}
          <div className="text-center mb-10 space-y-8">
            <div className="flex justify-center">
              <div className="relative group">
                {/* Main Logo Container */}
                <div className="w-28 h-28 bg-gradient-to-br from-blue-500 via-cyan-400 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <Ship className="h-14 w-14 text-white drop-shadow-lg" />
                </div>
                
                {/* Success Badge */}
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-3xl blur-xl opacity-50 -z-10 animate-pulse"></div>
                
                {/* Orbital Rings */}
                <div className="absolute inset-0 border-2 border-blue-300/30 rounded-full w-36 h-36 -translate-x-4 -translate-y-4 animate-spin"></div>
                <div className="absolute inset-0 border-2 border-cyan-300/20 rounded-full w-40 h-40 -translate-x-6 -translate-y-6 animate-spin" style={{animationDirection: 'reverse', animationDuration: '8s'}}></div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl font-black bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent mb-3 tracking-tight">
                Create Account
              </h1>
              <div className="max-w-md mx-auto">
                <p className="text-blue-200 opacity-90 text-lg leading-relaxed">
                  Join the premier maritime oil trading platform
                </p>
                <div className="flex items-center justify-center space-x-2 mt-3">
                  <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-blue-400"></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-blue-400"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Form Card */}
          <Card className="bg-white/98 backdrop-blur-lg border-0 shadow-2xl ring-1 ring-white/20 overflow-hidden relative">
            {/* Card Header Glow */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
            <CardContent className="p-10 space-y-8">
              {/* Enhanced Name Fields */}
              <div className="space-y-6">
                <div className="text-center pb-4 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">Account Information</h3>
                  <p className="text-sm text-gray-500">Secure your maritime trading account</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3 group">
                    <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      First Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                      <Input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        className="pl-12 h-14 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300 bg-gray-50 focus:bg-white rounded-xl text-base"
                        required
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-focus-within:from-blue-500/5 group-focus-within:to-cyan-500/5 transition-all duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 group">
                    <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700 flex items-center">
                      <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
                      Last Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-cyan-500 transition-colors duration-200" />
                      <Input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        className="pl-12 h-14 border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-300 hover:border-gray-300 bg-gray-50 focus:bg-white rounded-xl text-base"
                        required
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-focus-within:from-cyan-500/5 group-focus-within:to-blue-500/5 transition-all duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Email Field */}
              <div className="space-y-3 group">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200" />
                  <Input
                    id="email"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="your@company.com"
                    className="pl-12 h-14 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 hover:border-gray-300 bg-gray-50 focus:bg-white rounded-xl text-base"
                    required
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 to-blue-500/0 group-focus-within:from-purple-500/5 group-focus-within:to-blue-500/5 transition-all duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Enhanced Password Field */}
              <div className="space-y-3 group">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="pl-12 pr-12 h-14 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 hover:border-gray-300 bg-gray-50 focus:bg-white rounded-xl text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-green-500 transition-colors duration-200 focus:outline-none"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/0 to-emerald-500/0 group-focus-within:from-green-500/5 group-focus-within:to-emerald-500/5 transition-all duration-300 pointer-events-none"></div>
                </div>
                
                {/* Enhanced Password Requirements */}
                {userPassword && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-100">
                    <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <Shield className="h-4 w-4 text-blue-500 mr-2" />
                      Security Requirements
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {['At least 8 characters long', 'One uppercase letter', 'One lowercase letter', 'One number', 'One special character (!@#$%^&*)'].map((requirement, index) => {
                        const isMet = !passwordErrors.includes(requirement);
                        return (
                          <div key={index} className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-300 ${isMet ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${isMet ? 'bg-green-500' : 'bg-red-500'}`}>
                              {isMet ? (
                                <CheckCircle className="h-3 w-3 text-white" />
                              ) : (
                                <AlertTriangle className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <span className={`text-sm font-medium ${isMet ? 'text-green-700' : 'text-red-700'}`}>
                              {requirement}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Confirm Password Field */}
              <div className="space-y-3 group">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="pl-12 pr-12 h-14 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 hover:border-gray-300 bg-gray-50 focus:bg-white rounded-xl text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-orange-500 transition-colors duration-200 focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/0 to-red-500/0 group-focus-within:from-orange-500/5 group-focus-within:to-red-500/5 transition-all duration-300 pointer-events-none"></div>
                </div>
                
                {/* Enhanced Password Match Indicator */}
                {confirmPassword && (
                  <div className={`mt-3 p-3 rounded-xl transition-all duration-300 ${
                    userPassword === confirmPassword 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        userPassword === confirmPassword ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {userPassword === confirmPassword ? (
                          <CheckCircle className="h-4 w-4 text-white" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <span className={`text-sm font-medium ${
                        userPassword === confirmPassword ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {userPassword === confirmPassword ? 'Passwords match perfectly' : 'Passwords do not match'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Trial Info */}
              <div className="relative overflow-hidden p-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 rounded-2xl border border-blue-200 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-green-500/5"></div>
                <div className="relative flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-800 mb-1">
                      {(plans as SubscriptionPlan[])?.find(p => p.id === selectedPlan)?.trialDays || 5}-Day Premium Trial
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Start trading immediately with full platform access
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                        No credit card required
                      </span>
                      <span className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                        Cancel anytime
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Navigation Buttons */}
          <div className="flex justify-between items-center mt-10">
            <Button 
              variant="outline" 
              onClick={() => setStep(3)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 px-6 py-3 rounded-xl transition-all duration-300 backdrop-blur-sm"
            >
              <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
              Back to Ports
            </Button>
            
            <Button 
              onClick={() => setStep(5)}
              disabled={!isFormValid}
              className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform ${
                isFormValid 
                  ? 'bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 hover:from-blue-700 hover:via-cyan-700 hover:to-blue-800 text-white shadow-2xl hover:shadow-cyan-500/25 hover:scale-105 active:scale-95' 
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              Complete Registration
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Step 5: Complete Registration
  const CompleteRegistrationStep = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleCompleteRegistration = async () => {
      setIsCreatingAccount(true);

      try {
        // Complete registration with account creation
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

        // Call the actual registration API to create account
        const response = await fetch('/api/complete-registration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registrationData),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.message || 'Account creation failed');
        }
        
        toast({
          title: "Account Created Successfully!",
          description: "Your account has been created with a free trial. Redirecting to payment setup...",
        });

        // Store user data for automatic login
        if (result.user) {
          localStorage.setItem('tempUserData', JSON.stringify(result.user));
        }

        // Redirect to the pricing page where they can add payment
        setTimeout(() => {
          window.location.href = '/pricing?setup_payment=true';
        }, 2000);

      } catch (error) {
        console.error('Registration error:', error);
        toast({
          title: "Registration Failed",
          description: error instanceof Error ? error.message : 'Failed to complete registration. Please try again.',
          variant: "destructive",
        });
      } finally {
        setIsCreatingAccount(false);
      }
    };

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600 mr-3" />
            <h2 className="text-2xl font-bold text-slate-800">Complete Your Registration</h2>
          </div>

          <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="flex items-start">
              <UserCheck className="w-6 h-6 text-green-600 mt-1 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  You're Almost Ready!
                </h3>
                <p className="text-green-700 mb-3">
                  Complete your registration now and add your payment method when you're ready to upgrade.
                </p>
                <ul className="text-sm text-green-600 space-y-1">
                  <li>• Access basic features immediately</li>
                  <li>• Upgrade to premium features anytime</li>
                  <li>• Your preferences are saved</li>
                  <li>• No payment required now</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Registration Summary */}
          {selectedPlan && plans ? (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-semibold text-gray-800 mb-2">Registration Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Preferred Plan:</span>
                  <span className="ml-2 font-medium">
                    {(plans as SubscriptionPlan[])?.find((p: SubscriptionPlan) => p.id === selectedPlan)?.name || 'Selected Plan'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Billing:</span>
                  <span className="ml-2 font-medium">{billingInterval}ly</span>
                </div>
                <div>
                  <span className="text-gray-600">Regions:</span>
                  <span className="ml-2 font-medium">{selectedRegions.length} selected</span>
                </div>
                <div>
                  <span className="text-gray-600">Ports:</span>
                  <span className="ml-2 font-medium">{selectedPorts.length} selected</span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Benefits */}
          <div className="mb-8 space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <Zap className="w-4 h-4 mr-2 text-blue-500" />
              <span>Start exploring immediately</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Shield className="w-4 h-4 mr-2 text-green-500" />
              <span>Secure account protection</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CreditCard className="w-4 h-4 mr-2 text-purple-500" />
              <span>Add payment method later when ready</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={() => setStep(3)}>
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
                Completing registration...
              </>
            ) : (
              <>
                Complete Registration
                <ArrowRight className="w-5 h-5 ml-2" />
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