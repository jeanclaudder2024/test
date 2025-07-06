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
import { Loader2, Mail, Lock, User, Ship, Waves, Eye, EyeOff, Anchor, Star } from 'lucide-react';

export default function RegisterPage() {
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

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      await registerUser(data);
      toast({
        title: "Welcome aboard!",
        description: "Your account has been created. Your 3-day trial starts now!",
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

      <div className="relative z-10 w-full max-w-lg">
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
              Join PetroDealHub
            </h1>
            <p className="text-slate-300 text-lg">Start your maritime trading journey</p>
          </div>
        </div>

        {/* Registration Form */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl text-white">Create Account</CardTitle>
            <CardDescription className="text-slate-300">
              Join thousands of oil trading professionals
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

            <div className="text-center pt-4 border-t border-white/10">
              <p className="text-slate-300">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Trial Info */}
        <div className="mt-6 backdrop-blur-xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-400/30 rounded-xl p-6">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <Star className="h-8 w-8 text-yellow-400" />
            </div>
            <div>
              <p className="font-semibold text-white text-lg">3-Day Free Trial</p>
              <p className="text-blue-200">
                Full access to all premium features
              </p>
              <p className="text-slate-300 text-sm">
                No credit card required • Cancel anytime
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-400 text-sm">
            Trusted maritime oil trading platform
          </p>
          <div className="flex justify-center items-center gap-2 mt-2 text-slate-500 text-xs">
            <Ship className="h-3 w-3" />
            <span>Join 10,000+ oil trading professionals</span>
          </div>
        </div>
      </div>
    </div>
  );
}