import { useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Anchor, Globe, Loader2, Lock, Mail, User } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

// Form schemas
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, loginMutation, registerMutation } = useAuth();

  // Form definition
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync(data);
      navigate("/dashboard");
    } catch (error) {
      // Toast handled in auth context
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    try {
      await registerMutation.mutateAsync(data);
      navigate("/");
    } catch (error) {
      // Toast handled in auth context
    }
  };

  // Google sign in (mock for now)
  const googleSignIn = () => {
    toast({
      title: "Google Sign In",
      description: "Google authentication is not implemented yet.",
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex">
      {/* Left panel - Brand and photo */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#003366] relative overflow-hidden">
        {/* Decorative grid overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGgyLTJoLTJ6TTM1IDdoMWExIDEgMCAwIDAgMS0xVjRhMSAxIDAgMCAwLTEtMWgtMWExIDEgMCAwIDAtMSAxdjJhMSAxIDAgMCAwIDEgMXptNiAwaDFhMSAxIDAgMCAwIDEtMVY0YTEgMSAwIDAgMC0xLTFoLTFhMSAxIDAgMCAwLTEgMXYyYTEgMSAwIDAgMCAxIDF6bTYgMGgxYTEgMSAwIDAgMCAxLTFWNGExIDEgMCAwIDAtMS0xaC0xYTEgMSAwIDAgMC0xIDF2MmExIDEgMCAwIDAgMSAxeiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMTUiLz48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii4wNSIgZD0iTTMwIDBoNjB2NjBIMHoiLz48L2c+PC9zdmc+')] opacity-20"></div>
      
        <div className="relative w-full h-full flex flex-col z-10">
          {/* Logo area */}
          <div className="p-12">
            <img src="/assets/petrodealhub-logo.png" alt="PetroDealHub Logo" className="h-24 w-auto" />
          </div>
        
          {/* Main content area */}
          <div className="flex-1 flex flex-col justify-center px-12 mb-20">
            <h1 className="text-5xl font-extrabold text-white mb-6">PetroDealHub</h1>
            <p className="text-2xl font-light text-white/80 mb-8 leading-relaxed">
              The ultimate intelligence platform for oil trading professionals
            </p>
            
            <div className="space-y-6 max-w-md">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 rounded-full p-2">
                  <Anchor className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-white text-base">Track vessels and cargo in real-time across global shipping routes</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 rounded-full p-2">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-white text-base">Analyze refinery operations and connect with trading partners</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 rounded-full p-2">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-white text-base">Generate comprehensive trade documentation with AI support</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom content */}
          <div className="p-12">
            <p className="text-white/80 text-sm">© 2025 PetroDealHub. All rights reserved.</p>
          </div>
        </div>
      </div>
      
      {/* Right panel - Login form */}
      <div className="flex flex-col w-full lg:w-1/2">
        {/* Mobile logo header */}
        <div className="lg:hidden p-6 border-b bg-white dark:bg-gray-900 dark:border-gray-800">
          <img src="/assets/petrodealhub-logo.png" alt="PetroDealHub Logo" className="h-20 w-auto" />
        </div>
        
        {/* Auth Form Column */}
        <div className="w-full flex-1 flex items-center justify-center p-6 sm:p-12 bg-gray-50 dark:bg-gray-900">
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
              Welcome back
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Sign in to your account to continue
            </p>
            
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="inline-flex h-10 rounded-lg bg-gray-100 dark:bg-gray-800 p-1 mb-6">
                <TabsTrigger value="login" className="rounded-md data-[state=active]:bg-[#003366] data-[state=active]:text-white data-[state=active]:shadow-sm">Login</TabsTrigger>
                <TabsTrigger value="register" className="rounded-md data-[state=active]:bg-[#003366] data-[state=active]:text-white data-[state=active]:shadow-sm">Register</TabsTrigger>
              </TabsList>
            
              {/* Login Form */}
              <TabsContent value="login">
                <div className="space-y-6">
                  {/* Quick login button - prominent */}
                  <div className="mb-6">
                    <Button 
                      type="button" 
                      className="w-full bg-[#FF6F00] hover:bg-[#FF5000] text-white font-bold py-4 rounded-lg transition-colors shadow-lg"
                      onClick={() => {
                        loginForm.setValue("username", "demo");
                        loginForm.setValue("password", "password");
                        loginForm.handleSubmit(onLoginSubmit)();
                      }}
                    >
                      <div className="flex items-center justify-center">
                        {loginMutation.isPending ? (
                          <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        ) : (
                          <Lock className="h-5 w-5 mr-2" />
                        )}
                        {loginMutation.isPending ? "Authenticating..." : "3-DEAL FREE TRIAL"}
                      </div>
                    </Button>
                    <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">Try the platform with 3 free deals - no credit card required</p>
                  </div>
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-gray-50 dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                        Sign in with credentials
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
                            <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Username</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input 
                                  placeholder="john.doe"
                                  className="pl-10 h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Password</FormLabel>
                              <a href="#" className="text-xs text-[#FF6F00] hover:text-[#FF5000] font-medium">
                                Forgot password?
                              </a>
                            </div>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input
                                  type="password"
                                  placeholder="••••••••"
                                  className="pl-10 h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                      <div className="flex items-center pt-1">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="remember"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                          />
                          <Label htmlFor="remember" className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                            Remember me
                          </Label>
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-[#003366] hover:bg-[#002244] text-white font-medium py-2.5 h-12 rounded-lg mt-6"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                            Signing in...
                          </div>
                        ) : "Sign in to account"}
                      </Button>
                    </form>
                  </Form>
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-gray-50 dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <Button 
                      variant="outline" 
                      className="flex items-center justify-center h-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200"
                      onClick={() => googleSignIn()}
                      type="button"
                    >
                      <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                      </svg>
                      Sign in with Google
                    </Button>
                  </div>
                  
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                    <span>Don't have an account? </span>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        const tab = document.querySelector('[data-state="inactive"][value="register"]') as HTMLElement;
                        tab?.click();
                      }}
                      className="font-medium text-[#FF6F00] hover:text-[#FF5000]"
                    >
                      Create an account
                    </a>
                  </div>
                </div>
              </TabsContent>
              
              {/* Register Form */}
              <TabsContent value="register">
                <div className="space-y-6">
                  {/* Quick Login Button */}
                  <div className="mb-6">
                    <Button 
                      type="button" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors"
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
                        <Lock className="h-5 w-5 mr-2" />
                        Try Demo Account
                      </div>
                    </Button>
                    <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">Skip registration - explore platform features immediately</p>
                  </div>
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-gray-50 dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                        Create new account
                      </span>
                    </div>
                  </div>
                  
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">First Name</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                  <Input
                                    placeholder="John"
                                    className="pl-10 h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="text-red-500" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Last Name</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                  <Input
                                    placeholder="Doe"
                                    className="pl-10 h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="text-red-500" />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input
                                  type="email"
                                  placeholder="john.doe@oilcompany.com"
                                  className="pl-10 h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input
                                  type="email"
                                  placeholder="john@example.com"
                                  className="pl-10 h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input
                                  type="password"
                                  placeholder="••••••••"
                                  className="pl-10 h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                      <div className="flex items-center space-x-2 pt-2">
                        <input
                          type="checkbox"
                          id="terms"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                          required
                        />
                        <Label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-300">
                          I agree to the{" "}
                          <a href="#" className="text-[#FF6F00] hover:text-[#FF5000]">
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a href="#" className="text-[#FF6F00] hover:text-[#FF5000]">
                            Privacy Policy
                          </a>
                        </Label>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-[#003366] hover:bg-[#002244] text-white font-medium py-2.5 h-12 rounded-lg mt-6"
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
                      <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-gray-50 dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                        Or register with
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <Button 
                      variant="outline" 
                      className="flex items-center justify-center h-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200"
                      onClick={() => googleSignIn()}
                      type="button"
                    >
                      <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                      </svg>
                      Sign up with Google
                    </Button>
                  </div>
                  
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                    <span>Already have an account? </span>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        const tab = document.querySelector('[data-state="inactive"][value="login"]') as HTMLElement;
                        tab?.click();
                      }}
                      className="font-medium text-[#FF6F00] hover:text-[#FF5000]"
                    >
                      Sign in
                    </a>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}