import { useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { AuthProvider } from "@/hooks/use-auth";
import { Anchor, Globe, Loader2, Lock, Mail, User, Ship } from "lucide-react";

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

// Clean form schemas - no unnecessary fields
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

function CleanAuthPageInner() {
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  // Form definitions
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
      // Direct navigation to dashboard - no verification needed
      navigate("/dashboard");
    } catch (error) {
      // Toast handled in auth context
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex">
      {/* Left panel - Brand showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#003366] relative overflow-hidden">
        {/* Decorative maritime pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGgyLTJoLTJ6TTM1IDdoMWExIDEgMCAwIDAgMS0xVjRhMSAxIDAgMCAwLTEtMWgtMWExIDEgMCAwIDAtMSAxdjJhMSAxIDAgMCAwIDEgMXptNiAwaDFhMSAxIDAgMCAwIDEtMVY0YTEgMSAwIDAgMC0xLTFoLTFhMSAxIDAgMCAwLTEgMXYyYTEgMSAwIDAgMCAxIDF6bTYgMGgxYTEgMSAwIDAgMCAxLTFWNGExIDEgMCAwIDAtMS0xaC0xYTEgMSAwIDAgMC0xIDF2MmExIDEgMCAwIDAgMSAxeiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMTUiLz48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii4wNSIgZD0iTTMwIDBoNjB2NjBIMHoiLz48L2c+PC9zdmc+')] opacity-20"></div>
      
        <div className="relative w-full h-full flex flex-col z-10">
          {/* Logo area */}
          <div className="p-12">
            <div className="flex items-center space-x-3">
              <Ship className="h-12 w-12 text-white" />
              <div>
                <h1 className="text-2xl font-bold text-white">PetroDealHub</h1>
                <p className="text-blue-200 text-sm">Oil Vessel Tracking</p>
              </div>
            </div>
          </div>
        
          {/* Main content area */}
          <div className="flex-1 flex flex-col justify-center px-12 mb-20">
            <h2 className="text-4xl font-bold text-white mb-6">Professional Maritime Intelligence</h2>
            <p className="text-xl font-light text-white/90 mb-8 leading-relaxed">
              The ultimate platform for oil trading professionals worldwide
            </p>
            
            <div className="space-y-6 max-w-md">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 rounded-full p-2">
                  <Anchor className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-white text-base">Real-time vessel tracking across global shipping routes</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 rounded-full p-2">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-white text-base">Comprehensive refinery operations and port management</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 rounded-full p-2">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-white text-base">AI-powered trade documentation and analytics</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom content */}
          <div className="p-12">
            <p className="text-white/80 text-sm">© 2025 PetroDealHub. Professional maritime solutions.</p>
          </div>
        </div>
      </div>
      
      {/* Right panel - Authentication forms */}
      <div className="flex flex-col w-full lg:w-1/2">
        {/* Mobile logo header */}
        <div className="lg:hidden p-6 border-b bg-white dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <Ship className="h-8 w-8 text-[#003366]" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">PetroDealHub</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Oil Vessel Tracking</p>
            </div>
          </div>
        </div>
        
        {/* Auth Form Column */}
        <div className="w-full flex-1 flex items-center justify-center p-6 sm:p-12 bg-gray-50 dark:bg-gray-900">
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
              Welcome to PetroDealHub
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Access your professional maritime platform
            </p>
            
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="inline-flex h-10 rounded-lg bg-gray-100 dark:bg-gray-800 p-1 mb-6 w-full">
                <TabsTrigger value="login" className="flex-1 rounded-md data-[state=active]:bg-[#003366] data-[state=active]:text-white data-[state=active]:shadow-sm">Sign In</TabsTrigger>
                <TabsTrigger value="register" className="flex-1 rounded-md data-[state=active]:bg-[#003366] data-[state=active]:text-white data-[state=active]:shadow-sm">Create Account</TabsTrigger>
              </TabsList>
            
              {/* Login Form */}
              <TabsContent value="login">
                <div className="space-y-6">
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
                                  placeholder="Enter your username"
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
                            <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input
                                  type="password"
                                  placeholder="Enter your password"
                                  className="pl-10 h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                      
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
                        ) : "Access Platform"}
                      </Button>
                    </form>
                  </Form>
                </div>
              </TabsContent>
            
              {/* Register Form */}
              <TabsContent value="register">
                <div className="space-y-6">
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
                            <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Professional Email</FormLabel>
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
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input
                                  type="password"
                                  placeholder="Create secure password"
                                  className="pl-10 h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                      
                      {/* Instant Access Notice */}
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-5 h-5 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                              <span className="text-green-600 dark:text-green-400 text-sm font-semibold">✓</span>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-green-900 dark:text-green-200">Instant Platform Access</h4>
                            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                              No email verification required. Start tracking vessels and managing trades immediately.
                            </p>
                          </div>
                        </div>
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
                        ) : "Create Account & Start Trading"}
                      </Button>
                    </form>
                  </Form>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CleanAuthPage() {
  return (
    <AuthProvider>
      <CleanAuthPageInner />
    </AuthProvider>
  );
}