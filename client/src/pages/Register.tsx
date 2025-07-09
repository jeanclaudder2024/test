import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@shared/schema';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, Lock, User, Ship, Waves, Eye, EyeOff, Anchor, Star, CheckCircle2, ArrowLeft } from 'lucide-react';

// Subscription plans data
const subscriptionPlans = [
  {
    id: 1,
    name: "🧪 Basic",
    price: "$69",
    originalPrice: "$87",
    period: "/month",
    savings: "20% OFF",
    description: "Perfect for independent brokers starting in petroleum markets",
    features: [
      "Access to 2 major maritime zones",
      "Basic vessel tracking with verified activity", 
      "Access to 5 regional ports",
      "Basic documentation: LOI, SPA",
      "Email support"
    ],
    buttonText: "Start 5-Day Free Trial",
    popular: false
  },
  {
    id: 2,
    name: "📈 Professional", 
    price: "$150",
    originalPrice: "$188",
    period: "/month",
    savings: "20% OFF",
    description: "Professional brokers and medium-scale petroleum trading companies",
    features: [
      "Access to 6 major maritime zones",
      "Enhanced tracking with real-time updates",
      "Access to 20+ strategic ports", 
      "Enhanced documentation: LOI, B/L, SPA, ICPO",
      "Basic broker features + deal participation",
      "Priority email support"
    ],
    buttonText: "Start 5-Day Free Trial",
    popular: true
  },
  {
    id: 3,
    name: "🏢 Enterprise",
    price: "$399", 
    originalPrice: "$532",
    period: "/month",
    savings: "25% OFF",
    description: "Full-scale solution for large petroleum trading corporations",
    features: [
      "Access to 9 major global maritime zones",
      "Full live tracking with verified activity",
      "Access to 100+ strategic global ports",
      "Full set: SGS, SDS, Q88, ATB, customs",
      "International Broker ID included",
      "Legal recognition and dispute protection",
      "24/7 premium support + account manager"
    ],
    buttonText: "Start 5-Day Free Trial",
    popular: false
  }
];

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState<'plans' | 'registration'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser } = useAuth();
  const { toast } = useToast();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
    },
  });

  const handlePlanSelection = (planId: number) => {
    setSelectedPlan(planId);
    setCurrentStep('registration');
  };

  const onSubmit = async (data: RegisterInput) => {
    if (!selectedPlan) {
      toast({
        title: "Plan Required",
        description: "Please select a subscription plan first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Add selected plan to registration data
      const registrationData = { ...data, planId: selectedPlan };
      await registerUser(registrationData);
      
      const selectedPlanName = subscriptionPlans.find(p => p.id === selectedPlan)?.name || "plan";
      toast({
        title: "Welcome aboard!",
        description: `Your account has been created with ${selectedPlanName}. Your 5-day free trial starts now!`,
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Unable to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Plan selection step component
  const PlanSelectionStep = () => (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12 space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <img 
              src="/assets/petrodealhub-logo.png" 
              alt="PetroDealHub" 
              className="h-20 w-auto filter drop-shadow-2xl"
              onError={(e) => {
                e.currentTarget.src = "/assets/petrodealhub-logo.svg";
              }}
            />
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-30"></div>
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-slate-300 text-lg">Start your 5-day free trial with any plan</p>
        </div>
        <Badge variant="outline" className="px-4 py-2 bg-orange-500/20 text-white border-orange-500/30">
          ✅ 5-Day free trial • No credit card required • Cancel anytime
        </Badge>
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {subscriptionPlans.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative backdrop-blur-xl border-2 shadow-2xl transition-all duration-300 hover:transform hover:scale-105 cursor-pointer ${
              plan.popular 
                ? 'bg-gradient-to-br from-[#003366]/90 to-[#00264d]/90 border-orange-500/50' 
                : 'bg-white/10 border-white/20'
            }`}
            onClick={() => handlePlanSelection(plan.id)}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-orange-500 text-white px-6 py-1 text-sm font-semibold">
                  MOST POPULAR
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-white mb-2">{plan.name}</CardTitle>
              <div className="mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <div className="text-left">
                    <div className="text-white/60 text-sm">{plan.period}</div>
                    <div className="text-xs text-slate-400 line-through">{plan.originalPrice}</div>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                  {plan.savings}
                </Badge>
              </div>
              <CardDescription className="text-white/70 text-sm">
                {plan.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-white/80 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className={`w-full py-3 transition-all duration-300 ${
                  plan.popular
                    ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-600/50'
                    : 'bg-white/10 hover:bg-white/20 border border-white/20 text-white'
                }`}
                onClick={() => handlePlanSelection(plan.id)}
              >
                {plan.buttonText}
              </Button>
              <p className="text-xs text-center text-white/50">No credit card required</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-white/70 mb-4">
          Already have an account?{" "}
          <Link href="/auth" className="text-orange-500 hover:text-orange-400 font-medium">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );

  // Registration form step component  
  const RegistrationFormStep = () => {
    const selectedPlanData = subscriptionPlans.find(p => p.id === selectedPlan);
    
    return (
      <div className="w-full max-w-lg">
        {/* Logo and Header */}
        <div className="text-center mb-8 space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <img 
                src="/assets/petrodealhub-logo.png" 
                alt="PetroDealHub" 
                className="h-20 w-auto filter drop-shadow-2xl"
                onError={(e) => {
                  e.currentTarget.src = "/assets/petrodealhub-logo.svg";
                }}
              />
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-30"></div>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="text-slate-300 text-lg">Complete your registration</p>
          </div>
          
          {/* Selected Plan Display */}
          {selectedPlanData && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-white font-medium">{selectedPlanData.name}</p>
                  <p className="text-white/60 text-sm">5-day free trial, then {selectedPlanData.price}/month</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setCurrentStep('plans')}
                  className="text-orange-500 hover:text-orange-400 hover:bg-orange-500/10"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Change Plan
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Registration Form */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl text-white">Account Details</CardTitle>
            <CardDescription className="text-slate-300">
              Enter your information to complete registration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-white font-medium">
                    First Name
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="First name"
                      className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20 backdrop-blur-sm"
                      {...form.register('firstName')}
                    />
                  </div>
                  {form.formState.errors.firstName && (
                    <p className="text-sm text-red-400">
                      {form.formState.errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-white font-medium">
                    Last Name
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Last name"
                      className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20 backdrop-blur-sm"
                      {...form.register('lastName')}
                    />
                  </div>
                  {form.formState.errors.lastName && (
                    <p className="text-sm text-red-400">
                      {form.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-medium">
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20 backdrop-blur-sm"
                    {...form.register('email')}
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-sm text-red-400">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-medium">
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    className="pl-12 pr-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20 backdrop-blur-sm"
                    {...form.register('password')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-10 w-10 text-slate-400 hover:text-blue-400 hover:bg-white/10"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-red-400">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Ship className="mr-2 h-5 w-5" />
                    Start Your Journey
                  </>
                )}
              </Button>
            </form>

            {/* Google OAuth Sign Up */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-transparent px-4 text-slate-300">Or sign up with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                disabled={true}
                className="w-full h-12 bg-white/5 border-white/20 text-slate-400 hover:bg-white/10 hover:text-white transition-colors opacity-50 cursor-not-allowed"
              >
                <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google (Coming Soon)
              </Button>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-slate-400">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-blue-400 hover:text-blue-300 underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                  Privacy Policy
                </Link>
              </p>
            </div>

            <div className="text-center pt-2">
              <p className="text-slate-400">
                Already have an account?{" "}
                <Link href="/auth" className="text-orange-500 hover:text-orange-400 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 left-10 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
        <div className="absolute -bottom-8 right-20 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-1/4 opacity-20">
        <Anchor className="h-14 w-14 text-blue-300 animate-float" />
      </div>
      <div className="absolute bottom-32 left-1/4 opacity-20">
        <Waves className="h-10 w-10 text-cyan-300 animate-bounce" />
      </div>
      <div className="absolute top-1/2 left-10 opacity-15">
        <Star className="h-8 w-8 text-blue-200 animate-pulse" />
      </div>

      <div className="relative z-10">
        {currentStep === 'plans' ? <PlanSelectionStep /> : <RegistrationFormStep />}
      </div>
    </div>
  );
}