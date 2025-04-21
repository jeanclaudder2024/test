import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  BarChart3, 
  Users, 
  Ship, 
  Factory, 
  FileText, 
  ShieldCheck, 
  CreditCard, 
  Settings, 
  Layers, 
  AlertCircle,
  Check,
  RefreshCcw,
  Info,
  Edit,
  UserPlus,
  UserMinus,
  ShoppingCart,
  Landmark,
  Lock
} from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Panel transition animation
const panelAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

// Admin login schema
const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const { toast } = useToast();
  
  // Admin login form
  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Check if the user has admin access
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          // In real implementation, this would check if the user has admin privileges
          // For now, we'll just check if the user's isAdmin field is true
          setIsAdmin(user.isAdmin === true);
        } catch (error) {
          setIsAdmin(false);
        } finally {
          setCheckingAdmin(false);
        }
      }
    };
    
    if (user) {
      checkAdminStatus();
    }
  }, [user]);
  
  // Handle admin login submission
  const onSubmit = async (data: AdminLoginFormValues) => {
    try {
      // In real implementation, this would verify against admin credentials
      // For now, we'll hard-code the admin credentials for demo purposes
      if (data.username === "admin" && data.password === "adminpassword") {
        setIsAdmin(true);
        toast({
          title: "Admin access granted",
          description: "Welcome to the admin dashboard",
        });
      } else {
        toast({
          title: "Access denied",
          description: "Invalid admin credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify credentials",
        variant: "destructive", 
      });
    }
  };
  
  // If still loading auth state, show a loading spinner
  if (isLoading || checkingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  // If not logged in, redirect to auth page
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  // If user is logged in but not admin, show admin login form
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-2 border-primary/10 shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Admin Access</CardTitle>
              <CardDescription>
                Please enter admin credentials to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Admin username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Admin password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    {form.formState.isSubmitting ? "Verifying..." : "Log in to Admin Dashboard"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardContent className="flex flex-col space-y-2 text-center text-sm text-muted-foreground pt-0">
              <p>This area is restricted to authorized personnel only.</p>
              <p>For this demo, use username: <strong>admin</strong> and password: <strong>adminpassword</strong></p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/10">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col bg-card border-r shadow-sm">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <Ship className="h-6 w-6" />
            <span>Vesselian Admin</span>
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-3">
          <nav className="space-y-1">
            <Button 
              variant={activeTab === "overview" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => setActiveTab("overview")}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Overview
            </Button>
            
            <Button 
              variant={activeTab === "users" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => setActiveTab("users")}
            >
              <Users className="mr-2 h-4 w-4" />
              Users
            </Button>
            
            <Button 
              variant={activeTab === "vessels" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => setActiveTab("vessels")}
            >
              <Ship className="mr-2 h-4 w-4" />
              Vessels
            </Button>
            
            <Button 
              variant={activeTab === "refineries" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => setActiveTab("refineries")}
            >
              <Factory className="mr-2 h-4 w-4" />
              Refineries
            </Button>
            
            <Button 
              variant={activeTab === "documents" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => setActiveTab("documents")}
            >
              <FileText className="mr-2 h-4 w-4" />
              Documents
            </Button>
            
            <Button 
              variant={activeTab === "brokers" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => setActiveTab("brokers")}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Elite Brokers
            </Button>
            
            <Button 
              variant={activeTab === "subscriptions" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => setActiveTab("subscriptions")}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Subscriptions
            </Button>
            
            <Button 
              variant={activeTab === "settings" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => setActiveTab("settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </nav>
        </ScrollArea>
        
        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <svg 
                className="h-4 w-4 text-primary" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.username}</span>
              <span className="text-xs text-muted-foreground">Admin</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden p-4 border-b bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xl text-primary">
              <Ship className="h-6 w-6" />
              <span>Vesselian Admin</span>
            </div>
            <Button size="sm" variant="outline">Menu</Button>
          </div>
        </header>
        
        {/* Content area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Overview Panel */}
            {activeTab === "overview" && (
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={panelAnimation}
              >
                <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Stats Cards */}
                  <Card className="bg-gradient-to-br from-background to-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">1,247</div>
                        <Users className="h-8 w-8 text-primary opacity-80" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        <span className="text-green-500 font-medium">+12%</span> from last month
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-background to-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">843</div>
                        <CreditCard className="h-8 w-8 text-primary opacity-80" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        <span className="text-green-500 font-medium">+5%</span> from last month
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-background to-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">$67,294</div>
                        <Landmark className="h-8 w-8 text-primary opacity-80" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        <span className="text-green-500 font-medium">+18%</span> from last month
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-background to-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Active Vessels</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">22,467</div>
                        <Ship className="h-8 w-8 text-primary opacity-80" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        <span className="text-muted-foreground font-medium">14,004</span> oil vessels
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {/* Recent Activities */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Recent Activities</CardTitle>
                      <CardDescription>Latest actions performed in the system</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-4">
                          {/* Activity items */}
                          <div className="flex items-start">
                            <div className="mr-4 mt-0.5">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                <UserPlus className="h-4 w-4 text-primary" />
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">New user registered</p>
                              <p className="text-sm text-muted-foreground">User: michael.johnson</p>
                              <p className="text-xs text-muted-foreground">Today at 10:24 AM</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="mr-4 mt-0.5">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                <ShoppingCart className="h-4 w-4 text-primary" />
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">New subscription purchased</p>
                              <p className="text-sm text-muted-foreground">Premium plan - sarah.wilson</p>
                              <p className="text-xs text-muted-foreground">Today at 9:45 AM</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="mr-4 mt-0.5">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                <FileText className="h-4 w-4 text-primary" />
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Document generated</p>
                              <p className="text-sm text-muted-foreground">Bill of Lading for RH-298745</p>
                              <p className="text-xs text-muted-foreground">Yesterday at 5:13 PM</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="mr-4 mt-0.5">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Elite broker status granted</p>
                              <p className="text-sm text-muted-foreground">To user: robert.smith</p>
                              <p className="text-xs text-muted-foreground">Yesterday at 3:27 PM</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="mr-4 mt-0.5">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                <Edit className="h-4 w-4 text-primary" />
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Vessel information updated</p>
                              <p className="text-sm text-muted-foreground">Vessel ID: RHC-78965</p>
                              <p className="text-xs text-muted-foreground">Yesterday at 1:15 PM</p>
                            </div>
                          </div>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                  
                  {/* System Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle>System Status</CardTitle>
                      <CardDescription>Current state of services</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            <span className="text-sm">API Services</span>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-600 hover:bg-green-50">Operational</Badge>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            <span className="text-sm">Database</span>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-600 hover:bg-green-50">Operational</Badge>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            <span className="text-sm">Document Generation</span>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-600 hover:bg-green-50">Operational</Badge>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            <span className="text-sm">Payment Processing</span>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-600 hover:bg-green-50">Operational</Badge>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                            <span className="text-sm">Vessel API</span>
                          </div>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-600 hover:bg-yellow-50">Degraded</Badge>
                        </div>
                        
                        <div className="mt-6">
                          <Button variant="outline" size="sm" className="w-full">
                            <RefreshCcw className="h-4 w-4 mr-2" />
                            Refresh Status
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Subscription Growth Chart (placeholder) */}
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Growth</CardTitle>
                    <CardDescription>Monthly subscription growth over the past year</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                      <div className="text-center p-6">
                        <BarChart3 className="h-10 w-10 text-primary/60 mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">Bar chart visualization would display here</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Showing monthly subscription data from April 2024 to April 2025
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {/* Users Panel */}
            {activeTab === "users" && (
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={panelAnimation}
              >
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-3xl font-bold">User Management</h1>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add New User
                  </Button>
                </div>
                
                <Tabs defaultValue="all">
                  <TabsList>
                    <TabsTrigger value="all">All Users</TabsTrigger>
                    <TabsTrigger value="subscribed">Subscribed</TabsTrigger>
                    <TabsTrigger value="trial">Free Trial</TabsTrigger>
                    <TabsTrigger value="inactive">Inactive</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all">
                    <Card>
                      <CardHeader>
                        <CardTitle>All Users</CardTitle>
                        <CardDescription>
                          Manage all registered users of the platform
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="border rounded-md">
                          <div className="grid grid-cols-7 bg-muted/50 p-3 text-sm font-medium">
                            <div className="col-span-2">User</div>
                            <div>Status</div>
                            <div>Subscription</div>
                            <div>Created</div>
                            <div>Last Login</div>
                            <div>Actions</div>
                          </div>
                          
                          <div className="divide-y">
                            {/* User rows */}
                            <div className="grid grid-cols-7 p-3 text-sm items-center hover:bg-muted/20">
                              <div className="col-span-2 flex items-center">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                  <span className="text-xs font-medium text-primary">JD</span>
                                </div>
                                <div>
                                  <p className="font-medium">John Doe</p>
                                  <p className="text-xs text-muted-foreground">john.doe@example.com</p>
                                </div>
                              </div>
                              <div>
                                <Badge variant="default" className="bg-green-500 hover:bg-green-500">Active</Badge>
                              </div>
                              <div>
                                <Badge variant="outline">Premium</Badge>
                              </div>
                              <div className="text-muted-foreground">Apr 12, 2024</div>
                              <div className="text-muted-foreground">Today, 2:30 PM</div>
                              <div>
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-7 p-3 text-sm items-center hover:bg-muted/20">
                              <div className="col-span-2 flex items-center">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                  <span className="text-xs font-medium text-primary">AS</span>
                                </div>
                                <div>
                                  <p className="font-medium">Alice Smith</p>
                                  <p className="text-xs text-muted-foreground">alice.smith@example.com</p>
                                </div>
                              </div>
                              <div>
                                <Badge variant="default" className="bg-green-500 hover:bg-green-500">Active</Badge>
                              </div>
                              <div>
                                <Badge variant="outline">Basic</Badge>
                              </div>
                              <div className="text-muted-foreground">Mar 25, 2024</div>
                              <div className="text-muted-foreground">Yesterday, 9:15 AM</div>
                              <div>
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-7 p-3 text-sm items-center hover:bg-muted/20">
                              <div className="col-span-2 flex items-center">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                  <span className="text-xs font-medium text-primary">RJ</span>
                                </div>
                                <div>
                                  <p className="font-medium">Robert Johnson</p>
                                  <p className="text-xs text-muted-foreground">robert.j@example.com</p>
                                </div>
                              </div>
                              <div>
                                <Badge variant="outline" className="bg-amber-100 text-amber-700 hover:bg-amber-100">Trial</Badge>
                              </div>
                              <div>
                                <Badge variant="outline">None</Badge>
                              </div>
                              <div className="text-muted-foreground">Apr 15, 2024</div>
                              <div className="text-muted-foreground">Apr 15, 2024</div>
                              <div>
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-7 p-3 text-sm items-center hover:bg-muted/20">
                              <div className="col-span-2 flex items-center">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                  <span className="text-xs font-medium text-primary">EW</span>
                                </div>
                                <div>
                                  <p className="font-medium">Emily Wilson</p>
                                  <p className="text-xs text-muted-foreground">e.wilson@example.com</p>
                                </div>
                              </div>
                              <div>
                                <Badge variant="outline" className="bg-red-100 text-red-700 hover:bg-red-100">Inactive</Badge>
                              </div>
                              <div>
                                <Badge variant="outline">Expired</Badge>
                              </div>
                              <div className="text-muted-foreground">Feb 3, 2024</div>
                              <div className="text-muted-foreground">Mar 15, 2024</div>
                              <div>
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="subscribed">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-center p-8">
                          <div className="text-center space-y-3">
                            <Users className="h-12 w-12 text-primary/60 mx-auto" />
                            <h3 className="text-lg font-medium">Subscribed Users</h3>
                            <p className="text-sm text-muted-foreground">
                              View all users with active subscriptions
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="trial">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-center p-8">
                          <div className="text-center space-y-3">
                            <Users className="h-12 w-12 text-primary/60 mx-auto" />
                            <h3 className="text-lg font-medium">Trial Users</h3>
                            <p className="text-sm text-muted-foreground">
                              View all users currently on free trial
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="inactive">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-center p-8">
                          <div className="text-center space-y-3">
                            <Users className="h-12 w-12 text-primary/60 mx-auto" />
                            <h3 className="text-lg font-medium">Inactive Users</h3>
                            <p className="text-sm text-muted-foreground">
                              View all inactive or expired users
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
            
            {/* Subscriptions Panel */}
            {activeTab === "subscriptions" && (
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={panelAnimation}
              >
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-3xl font-bold">Subscription Management</h1>
                  <Button>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Add Plan
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Subscription Stats */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Basic Plans</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">372</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="text-green-500 font-medium">+7%</span> from last month
                      </p>
                      <div className="mt-4 text-sm font-medium">$36,828 Monthly</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Premium Plans</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">285</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="text-green-500 font-medium">+12%</span> from last month
                      </p>
                      <div className="mt-4 text-sm font-medium">$28,489 Monthly</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Enterprise Plans</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">68</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="text-green-500 font-medium">+3%</span> from last month
                      </p>
                      <div className="mt-4 text-sm font-medium">$27,132 Monthly</div>
                    </CardContent>
                  </Card>
                </div>
                
                <Tabs defaultValue="plans">
                  <TabsList>
                    <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
                    <TabsTrigger value="invoices">Invoices</TabsTrigger>
                    <TabsTrigger value="revenue">Revenue</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="plans">
                    <Card>
                      <CardHeader>
                        <CardTitle>Active Subscription Plans</CardTitle>
                        <CardDescription>Manage current subscription plans</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Subscription plan cards */}
                          <div className="p-6 border rounded-lg bg-card">
                            <div className="flex justify-between mb-4">
                              <div>
                                <h3 className="font-bold text-lg">Basic Plan</h3>
                                <p className="text-sm text-muted-foreground">Essential tracking for small operations</p>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold">$99<span className="text-sm text-muted-foreground font-normal">/month</span></div>
                                <Badge className="mt-1" variant="outline">price_standard</Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <p className="text-sm font-medium">Active Subscribers</p>
                                <p className="text-2xl font-bold">372</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Monthly Revenue</p>
                                <p className="text-2xl font-bold">$36,828</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Avg. Retention</p>
                                <p className="text-2xl font-bold">4.2 <span className="text-sm">months</span></p>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Plan
                              </Button>
                              <Button variant="outline" size="sm">
                                <Info className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </div>
                          </div>
                          
                          <div className="p-6 border rounded-lg bg-card">
                            <div className="flex justify-between mb-4">
                              <div>
                                <h3 className="font-bold text-lg">Premium Plan</h3>
                                <p className="text-sm text-muted-foreground">Advanced features for growing businesses</p>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold">$199<span className="text-sm text-muted-foreground font-normal">/month</span></div>
                                <Badge className="mt-1" variant="outline">price_premium</Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <p className="text-sm font-medium">Active Subscribers</p>
                                <p className="text-2xl font-bold">285</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Monthly Revenue</p>
                                <p className="text-2xl font-bold">$56,715</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Avg. Retention</p>
                                <p className="text-2xl font-bold">6.8 <span className="text-sm">months</span></p>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Plan
                              </Button>
                              <Button variant="outline" size="sm">
                                <Info className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </div>
                          </div>
                          
                          <div className="p-6 border rounded-lg bg-card">
                            <div className="flex justify-between mb-4">
                              <div>
                                <h3 className="font-bold text-lg">Enterprise Plan</h3>
                                <p className="text-sm text-muted-foreground">Complete platform access with advanced features</p>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold">$399<span className="text-sm text-muted-foreground font-normal">/month</span></div>
                                <Badge className="mt-1" variant="outline">price_enterprise</Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <p className="text-sm font-medium">Active Subscribers</p>
                                <p className="text-2xl font-bold">68</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Monthly Revenue</p>
                                <p className="text-2xl font-bold">$27,132</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Avg. Retention</p>
                                <p className="text-2xl font-bold">8.3 <span className="text-sm">months</span></p>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Plan
                              </Button>
                              <Button variant="outline" size="sm">
                                <Info className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="invoices">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-center p-8">
                          <div className="text-center space-y-3">
                            <FileText className="h-12 w-12 text-primary/60 mx-auto" />
                            <h3 className="text-lg font-medium">Invoice History</h3>
                            <p className="text-sm text-muted-foreground">
                              View all invoices and payment history
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="revenue">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-center p-8">
                          <div className="text-center space-y-3">
                            <Landmark className="h-12 w-12 text-primary/60 mx-auto" />
                            <h3 className="text-lg font-medium">Revenue Analysis</h3>
                            <p className="text-sm text-muted-foreground">
                              View detailed revenue and financial metrics
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
            
            {/* Placeholder for other tabs */}
            {(activeTab === "vessels" || activeTab === "refineries" || activeTab === "documents" 
              || activeTab === "brokers" || activeTab === "settings") && (
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={panelAnimation}
                className="flex items-center justify-center min-h-[50vh]"
              >
                <div className="text-center">
                  <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                    {activeTab === "vessels" && <Ship className="h-8 w-8 text-primary" />}
                    {activeTab === "refineries" && <Factory className="h-8 w-8 text-primary" />}
                    {activeTab === "documents" && <FileText className="h-8 w-8 text-primary" />}
                    {activeTab === "brokers" && <ShieldCheck className="h-8 w-8 text-primary" />}
                    {activeTab === "settings" && <Settings className="h-8 w-8 text-primary" />}
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    {activeTab === "vessels" && "Vessel Management"}
                    {activeTab === "refineries" && "Refinery Management"}
                    {activeTab === "documents" && "Document Management"}
                    {activeTab === "brokers" && "Elite Broker Management"}
                    {activeTab === "settings" && "System Settings"}
                  </h2>
                  <p className="text-muted-foreground max-w-md">
                    This section would contain the management interface for {activeTab}.
                    Additional functionality can be implemented based on requirements.
                  </p>
                  <Button className="mt-6">
                    {activeTab === "vessels" && "Manage Vessels"}
                    {activeTab === "refineries" && "Manage Refineries"}
                    {activeTab === "documents" && "Manage Documents"}
                    {activeTab === "brokers" && "Manage Brokers"}
                    {activeTab === "settings" && "Configure Settings"}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

