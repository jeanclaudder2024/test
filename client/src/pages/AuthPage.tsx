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
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#001f3f] to-[#003366] dark:from-[#001a33] dark:to-[#002b4d]">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-28 flex items-center justify-between border-b border-orange-500/20 backdrop-blur-sm bg-background/50 dark:bg-slate-900/80 fixed w-full z-50">
        <div className="flex items-center font-bold text-xl">
          <a href="/" className="flex items-center">
            <img src="/assets/petrodealhub-logo.png" alt="PetroDealHub Logo" className="h-24 w-auto" />
          </a>
        </div>
      </header>
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 items-center pt-28">
        {/* Auth Form Column */}
        <div className="flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-md mx-auto">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              {/* Login Form */}
              <TabsContent value="login">
                <Card>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">Welcome back</CardTitle>
                    <CardDescription>
                      Enter your credentials to sign in to your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    placeholder="Enter your username"
                                    className="pl-10"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    type="password"
                                    placeholder="Enter your password"
                                    className="pl-10"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="remember"
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="remember" className="text-sm">Remember me</Label>
                          </div>
                          <a href="#" className="text-sm text-orange-500 hover:underline">
                            Forgot password?
                          </a>
                        </div>
                        <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white" disabled={loginMutation.isPending}>
                          {loginMutation.isPending ? (
                            <div className="flex items-center justify-center">
                              <Loader2 className="animate-spin h-4 w-4 mr-2" />
                              Signing in...
                            </div>
                          ) : "Sign In"}
                        </Button>
                      </form>
                    </Form>
                    
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <Button 
                        variant="outline" 
                        className="flex items-center justify-center gap-2"
                        onClick={() => googleSignIn()}
                        type="button"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 48 48">
                          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        </svg>
                        Sign in with Google
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col">
                    <div className="mt-2 text-center text-sm text-muted-foreground">
                      <span>Don't have an account? </span>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          const tab = document.querySelector('[data-state="inactive"][value="register"]') as HTMLElement;
                          tab?.click();
                        }}
                        className="font-medium text-orange-500 hover:underline"
                      >
                        Register now
                      </a>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Register Form */}
              <TabsContent value="register">
                <Card>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">Create an account</CardTitle>
                    <CardDescription>
                      Enter your details to create your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="Choose a username"
                                    className="pl-10"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="pl-10"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    type="password"
                                    placeholder="Create a password"
                                    className="pl-10"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="terms"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            required
                          />
                          <Label htmlFor="terms" className="text-sm">
                            I agree to the{" "}
                            <a href="#" className="text-orange-500 hover:underline">
                              Terms of Service
                            </a>{" "}
                            and{" "}
                            <a href="#" className="text-orange-500 hover:underline">
                              Privacy Policy
                            </a>
                          </Label>
                        </div>
                        <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white" disabled={registerMutation.isPending}>
                          {registerMutation.isPending ? (
                            <div className="flex items-center justify-center">
                              <Loader2 className="animate-spin h-4 w-4 mr-2" />
                              Creating account...
                            </div>
                          ) : "Create Account"}
                        </Button>
                      </form>
                    </Form>
                    
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or register with
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <Button 
                        variant="outline" 
                        className="flex items-center justify-center gap-2"
                        onClick={() => googleSignIn()}
                        type="button"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 48 48">
                          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        </svg>
                        Sign up with Google
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col">
                    <div className="mt-2 text-center text-sm text-muted-foreground">
                      <span>Already have an account? </span>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          const tab = document.querySelector('[data-state="inactive"][value="login"]') as HTMLElement;
                          tab?.click();
                        }}
                        className="font-medium text-orange-500 hover:underline"
                      >
                        Sign in
                      </a>
                    </div>
                  </CardFooter>
                </Card>
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