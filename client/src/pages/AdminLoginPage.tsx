import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Lock, User, Loader2, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

// Form validation schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user, isLoading, loginMutation } = useAuth();
  
  // Redirect if already logged in and is admin
  useEffect(() => {
    if (user && (user.isAdmin || user.role === 'admin')) {
      navigate("/admin/dashboard");
    } else if (user) {
      // If logged in but not admin, redirect to dashboard
      navigate("/dashboard");
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
    }
  }, [user, navigate, toast]);

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
      // Navigation is handled in the useEffect above
    } catch (error) {
      console.error("Login error:", error);
      // Toast handled in auth context
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b backdrop-blur-sm bg-background/50 fixed w-full z-50">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <Shield className="h-6 w-6" />
          <a href="/">Vesselian Admin</a>
        </div>
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            Back to Main Site
          </Button>
        </div>
      </header>
      
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md mx-auto">
          <Card className="border-primary/20">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Admin Access
              </CardTitle>
              <CardDescription>
                Sign in with your administrative credentials
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
                        <FormLabel>Admin Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="Enter admin username"
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
                              placeholder="Enter admin password"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        Signing in...
                      </div>
                    ) : "Sign In to Admin"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col border-t pt-4">
              <p className="text-sm text-muted-foreground text-center">
                This area is restricted to authorized personnel only.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}