import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  User, 
  Mail, 
  Lock, 
  Loader2, 
  CheckCircle2,
  Ship,
  Building2 
} from 'lucide-react';

// Registration schema
const registrationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  planId: z.string().min(1, 'Please select a subscription plan')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegistrationForm = z.infer<typeof registrationSchema>;

const subscriptionPlans = [
  { id: '1', name: 'Basic Plan - $69/month', value: 1 },
  { id: '2', name: 'Professional Plan - $150/month', value: 2 },
  { id: '3', name: 'Enterprise Plan - $399/month', value: 3 }
];

interface SimpleRegistrationProps {
  onSuccess?: () => void;
}

export default function SimpleRegistration({ onSuccess }: SimpleRegistrationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      companyName: '',
      planId: ''
    }
  });

  const onSubmit = async (data: RegistrationForm) => {
    setIsSubmitting(true);

    try {
      const registrationData = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        companyName: data.companyName,
        selectedPlan: data.planId,
        selectedRegions: ['Global'], // Default to global access
        selectedPorts: [], // Will be set later
        billingInterval: 'month'
      };

      const response = await fetch('/api/complete-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Account Created Successfully!",
          description: "Welcome to PetroDealHub! Redirecting to complete setup...",
        });

        // Store user data temporarily
        if (result.user) {
          localStorage.setItem('newUserData', JSON.stringify(result.user));
        }

        // Redirect to pricing page for payment setup
        setTimeout(() => {
          window.location.href = '/pricing?setup_payment=true';
        }, 2000);

        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(result.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ship className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            Join PetroDealHub
          </CardTitle>
          <CardDescription className="text-slate-600">
            Create your maritime trading account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Personal Information */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  placeholder="John"
                  className="h-10"
                />
                {errors.firstName && (
                  <p className="text-xs text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  placeholder="Smith"
                  className="h-10"
                />
                {errors.lastName && (
                  <p className="text-xs text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Company Information */}
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-sm font-medium">
                Company Name
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="companyName"
                  {...register('companyName')}
                  placeholder="Your Company Ltd"
                  className="h-10 pl-10"
                />
              </div>
              {errors.companyName && (
                <p className="text-xs text-red-600">{errors.companyName.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="john@company.com"
                  className="h-10 pl-10"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Subscription Plan */}
            <div className="space-y-2">
              <Label htmlFor="planId" className="text-sm font-medium">
                Choose Plan
              </Label>
              <Select onValueChange={(value) => setValue('planId', value)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select a subscription plan" />
                </SelectTrigger>
                <SelectContent>
                  {subscriptionPlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.value.toString()}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.planId && (
                <p className="text-xs text-red-600">{errors.planId.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  placeholder="Create a strong password"
                  className="h-10 pl-10"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword')}
                  placeholder="Confirm your password"
                  className="h-10 pl-10"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Trial Information */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center text-green-800">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">5-Day Free Trial Included</span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                Start your maritime trading journey risk-free. Add payment method later.
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <User className="h-4 w-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>

            {/* Login Link */}
            <div className="text-center pt-4">
              <p className="text-sm text-slate-600">
                Already have an account?{' '}
                <a 
                  href="/login" 
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign in here
                </a>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}