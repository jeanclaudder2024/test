import { useEffect } from "react";
import { useLocation, Redirect } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Anchor, Lock, Mail, User, Globe, Loader2, Phone } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Separator } from "@/components/ui/separator";

// Form validation schemas
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user, isLoading, loginMutation, registerMutation, googleSignIn } = useAuth();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);
  
  // Extract redirect from URL if present
  const searchParams = new URLSearchParams(window.location.search);
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  
  // Handle successful login or registration
  const handleSuccess = () => {
    navigate(redirectTo);
  };
  
  // Animation for login page elements
  useEffect(() => {
    const elements = document.querySelectorAll('.animate-fade-in');
    elements.forEach((element, index) => {
      (element as HTMLElement).style.animationDelay = `${index * 0.1}s`;
    });
  }, []);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync(data);
      // After successful login, redirect to the specified page
      handleSuccess();
    } catch (error) {
      console.error("Login error:", error);
      // Toast handled in auth context
    }
  };

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    try {
      await registerMutation.mutateAsync(data);
      // After successful registration, redirect to the specified page
      handleSuccess();
    } catch (error) {
      console.error("Registration error:", error);
      // Toast handled in auth context
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background with gradients and animated patterns */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#001f3f] to-[#003366] dark:from-[#001a33] dark:to-[#002b4d] overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-[10%] left-[20%] w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[15%] right-[20%] w-80 h-80 bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-[60%] left-[10%] w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Diagonal lines pattern */}
        <div className="absolute inset-0 opacity-20" style={{ 
          backgroundImage: 'linear-gradient(135deg, #FF6F00 1%, transparent 1%, transparent 50%, #FF6F00 50%, #FF6F00 51%, transparent 51%, transparent 100%)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-40 flex items-center justify-between border-b border-orange-500/20 backdrop-blur-sm bg-white/5 fixed w-full z-50">
        <div className="flex items-center font-bold text-xl">
          <a href="/" className="flex items-center">
            <img src="/assets/petrodealhub-logo.png" alt="PetroDealHub Logo" className="h-36 w-auto animate-fade-in" />
          </a>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center pt-40 relative z-10">
        {/* Left side image */}
        <div className="hidden lg:block lg:w-1/2 h-full p-12">
          <div className="relative h-full w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-[#003366]/80 to-[#002244]/80 rounded-2xl backdrop-blur-sm border border-white/10 shadow-2xl overflow-hidden animate-fade-in">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,111,0,0.1),transparent_60%)]"></div>
              <div className="p-12 flex flex-col h-full justify-center">
                <h2 className="text-4xl font-bold text-white mb-6 animate-fade-in">Global Maritime Intelligence Platform</h2>
                <p className="text-white/80 text-lg mb-8 animate-fade-in">Access real-time vessel tracking, refinery data, and market analytics to make informed trading decisions.</p>
                
                <div className="grid grid-cols-2 gap-6 animate-fade-in">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-full bg-orange-500/20">
                      <Anchor className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Live Vessel Tracking</h3>
                      <p className="text-white/70 text-sm">Monitor 2,500+ vessels in real-time</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-full bg-orange-500/20">
                      <Globe className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Global Refineries</h3>
                      <p className="text-white/70 text-sm">Data on 100+ active refineries</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Auth Form Column */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-2xl animate-fade-in">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/10">
                <TabsTrigger value="login" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Login</TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Register</TabsTrigger>
              </TabsList>
              
              {/* Login Form */}
              <TabsContent value="login">
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                    <p className="text-white/70">
                      Sign in to access your maritime intelligence dashboard
                    </p>
                  </div>
                  
                  {/* Big Quick Login Button */}
                  <div className="my-8 animate-fade-in">
                    <Button 
                      type="button" 
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg transform transition-transform hover:scale-105 border-b-4 border-orange-700"
                      onClick={() => {
                        loginForm.setValue("username", "demo");
                        loginForm.setValue("password", "password");
                        loginForm.handleSubmit(onLoginSubmit)();
                      }}
                    >
                      <div className="flex items-center justify-center">
                        {loginMutation.isPending ? (
                          <Loader2 className="animate-spin h-6 w-6 mr-2" />
                        ) : (
                          <Lock className="h-6 w-6 mr-2" />
                        )}
                        {loginMutation.isPending ? "Logging you in..." : "ONE-CLICK LOGIN TO DASHBOARD"}
                      </div>
                    </Button>
                    <p className="text-center text-white/50 text-xs mt-2">No credentials needed - instant access</p>
                  </div>
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-transparent px-2 text-white/50">
                        Or sign in with credentials
                      </span>
                    </div>
                  </div>
                  
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Username</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-5 w-5 text-white/50" />
                                <Input 
                                  placeholder="Enter your username"
                                  className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-white/40 h-12 rounded-xl focus:border-orange-500 focus:ring-orange-500"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-orange-300" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-white">Password</FormLabel>
                              <a href="#" className="text-xs text-orange-400 hover:text-orange-300">
                                Forgot password?
                              </a>
                            </div>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-white/50" />
                                <Input
                                  type="password"
                                  placeholder="Enter your password"
                                  className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-white/40 h-12 rounded-xl focus:border-orange-500 focus:ring-orange-500"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-orange-300" />
                          </FormItem>
                        )}
                      />
                      <div className="flex items-center pt-1">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="remember"
                            className="h-4 w-4 rounded border-white/30 text-orange-500 focus:ring-orange-500 bg-white/10"
                          />
                          <Label htmlFor="remember" className="text-sm text-white/80">Remember me for 30 days</Label>
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-[#003366] hover:bg-[#002244] text-white py-5 rounded-xl mt-4"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                            Signing in...
                          </div>
                        ) : "Sign In to Dashboard"}
                      </Button>
                    </form>
                  </Form>
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-transparent px-2 text-white/50">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <Button 
                      variant="outline" 
                      className="flex items-center justify-center gap-2 bg-white/10 text-white border-white/10 hover:bg-white/20 py-5 rounded-xl"
                      onClick={() => googleSignIn()}
                      type="button"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                      </svg>
                      Sign in with Google
                    </Button>
                  </div>
                  
                  <div className="text-center text-sm text-white/60 pt-4">
                    <span>Don't have an account? </span>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        const tab = document.querySelector('[data-state="inactive"][value="register"]') as HTMLElement;
                        tab?.click();
                      }}
                      className="font-medium text-orange-400 hover:text-orange-300"
                    >
                      Create an account
                    </a>
                  </div>
                </div>
              </TabsContent>
              
              {/* Register Form */}
              <TabsContent value="register">
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-white">Create an Account</h2>
                    <p className="text-white/70">
                      Sign up for access to maritime intelligence tools
                    </p>
                  </div>
                  
                  {/* Quick Login Button */}
                  <div className="my-8 animate-fade-in">
                    <Button 
                      type="button" 
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg transform transition-transform hover:scale-105 border-b-4 border-orange-700"
                      onClick={() => {
                        const tab = document.querySelector('[data-state="inactive"][value="login"]') as HTMLElement;
                        tab?.click();
                        
                        // Use setTimeout to allow tab change to complete
                        setTimeout(() => {
                          loginForm.setValue("username", "demo");
                          loginForm.setValue("password", "password");
                          loginForm.handleSubmit(onLoginSubmit)();
                        }, 100);
                      }}
                    >
                      <div className="flex items-center justify-center">
                        <Lock className="h-6 w-6 mr-2" />
                        ONE-CLICK LOGIN TO DASHBOARD
                      </div>
                    </Button>
                    <p className="text-center text-white/50 text-xs mt-2">Skip registration - try our platform immediately</p>
                  </div>
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-transparent px-2 text-white/50">
                        Or create a new account
                      </span>
                    </div>
                  </div>
                  
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Username</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-5 w-5 text-white/50" />
                                <Input
                                  placeholder="Choose a username"
                                  className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-white/40 h-12 rounded-xl focus:border-orange-500 focus:ring-orange-500"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-orange-300" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-white/50" />
                                <Input
                                  type="email"
                                  placeholder="Enter your email"
                                  className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-white/40 h-12 rounded-xl focus:border-orange-500 focus:ring-orange-500"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-orange-300" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-white/50" />
                                <Input
                                  type="password"
                                  placeholder="Create a password"
                                  className="pl-10 bg-white/10 border-white/10 text-white placeholder:text-white/40 h-12 rounded-xl focus:border-orange-500 focus:ring-orange-500"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-orange-300" />
                          </FormItem>
                        )}
                      />
                      <div className="flex items-center space-x-2 pt-1">
                        <input
                          type="checkbox"
                          id="terms"
                          className="h-4 w-4 rounded border-white/30 text-orange-500 focus:ring-orange-500 bg-white/10"
                          required
                        />
                        <Label htmlFor="terms" className="text-sm text-white/80">
                          I agree to the{" "}
                          <a href="#" className="text-orange-400 hover:text-orange-300">
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a href="#" className="text-orange-400 hover:text-orange-300">
                            Privacy Policy
                          </a>
                        </Label>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-[#003366] hover:bg-[#002244] text-white py-5 rounded-xl mt-4"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                            Creating account...
                          </div>
                        ) : "Create Account"}
                      </Button>
                    </form>
                  </Form>
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-transparent px-2 text-white/50">
                        Or register with
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <Button 
                      variant="outline" 
                      className="flex items-center justify-center gap-2 bg-white/10 text-white border-white/10 hover:bg-white/20 py-5 rounded-xl"
                      onClick={() => googleSignIn()}
                      type="button"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                      </svg>
                      Sign up with Google
                    </Button>
                  </div>
                  
                  <div className="text-center text-sm text-white/60 pt-4">
                    <span>Already have an account? </span>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        const tab = document.querySelector('[data-state="inactive"][value="login"]') as HTMLElement;
                        tab?.click();
                      }}
                      className="font-medium text-orange-400 hover:text-orange-300"
                    >
                      Sign in
                    </a>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Hero/Info Column */}
        <div className="hidden lg:flex flex-col justify-center px-8 bg-muted/50 h-full">
          <div className="space-y-6 max-w-lg">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">AsiStream Maritime Intelligence</h1>
              <p className="text-muted-foreground">
                Join thousands of shipping professionals who rely on our platform for real-time vessel tracking, market
                intelligence, and AI-powered insights.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 mt-1">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Global Tracking Network</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time monitoring of over 22,000 vessels and 42 major refineries worldwide
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 mt-1">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Secure & Reliable</h3>
                  <p className="text-sm text-muted-foreground">
                    Enterprise-grade security with 99.9% uptime guarantee
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 mt-1">
                  <Anchor className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Industry Leading</h3>
                  <p className="text-sm text-muted-foreground">
                    Trusted by leading shipping companies, brokers, and oil majors worldwide
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}