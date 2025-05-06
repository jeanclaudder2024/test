import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, Search, Filter, MoreHorizontal, Eye, RotateCw, Edit, Mail, 
  FileText, CreditCard, BadgeDollarSign, RefreshCw, Download, Wallet
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Subscription plan types
type Plan = {
  id: number;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  isActive: boolean;
  features: string[];
  userCount: number;
}

// Subscription instance type
type Subscription = {
  id: number;
  userId: number;
  username: string;
  email: string;
  planId: number;
  planName: string;
  status: 'active' | 'trialing' | 'canceled' | 'past_due';
  startDate: string;
  endDate: string;
  billingCycle: 'monthly' | 'yearly';
  amount: number;
  renewsAt?: string;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export default function SubscriptionsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("subscriptions");
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [isEditPlanOpen, setIsEditPlanOpen] = useState(false);
  const [currentEditPlan, setCurrentEditPlan] = useState<Plan | null>(null);
  
  // Simulated API calls
  const plansQuery = useQuery({
    queryKey: ['/api/admin/subscription-plans'],
    queryFn: async () => {
      // Return mock data
      return {
        plans: mockPlans,
        totalCount: mockPlans.length
      };
    }
  });

  const subscriptionsQuery = useQuery({
    queryKey: ['/api/admin/subscriptions', searchQuery, currentPage, selectedPlan, selectedStatus],
    queryFn: async () => {
      // Return mock data
      return {
        subscriptions: mockSubscriptions,
        totalCount: mockSubscriptions.length,
        totalPages: Math.ceil(mockSubscriptions.length / 10)
      };
    }
  });

  const subscriptions = subscriptionsQuery.data?.subscriptions || [];
  const totalPages = subscriptionsQuery.data?.totalPages || 1;
  const plans = plansQuery.data?.plans || [];
  
  const revenueStats = {
    monthly: "$8,546",
    yearly: "$68,950",
    total: "$77,496",
    growth: 12.4
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // This will trigger re-query
  };

  const handlePlanFilter = (plan: string) => {
    setSelectedPlan(plan === "all" ? null : plan);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status === "all" ? null : status);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEditPlan = (plan: Plan) => {
    setCurrentEditPlan(plan);
    setIsEditPlanOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Trial</Badge>;
      case 'canceled':
        return <Badge variant="outline" className="text-gray-500">Canceled</Badge>;
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminLayout
      title="Subscription Management"
      description="Manage subscription plans and user subscriptions"
      actions={
        activeTab === "plans" ? (
          <Button onClick={() => setIsCreatePlanOpen(true)} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            New Plan
          </Button>
        ) : null
      }
    >
      <Tabs defaultValue="subscriptions" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="subscriptions">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <CardTitle>Subscriptions</CardTitle>
                  <CardDescription>
                    {subscriptionsQuery.isLoading 
                      ? "Loading subscriptions..." 
                      : `Total ${subscriptions.length} active subscriptions`}
                  </CardDescription>
                </div>
                
                <div className="flex gap-2 items-center">
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search by user or email..."
                      className="w-[200px] sm:w-[300px] pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </form>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Filter className="mr-2 h-3.5 w-3.5" />
                        Filter
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                      <DropdownMenuLabel>Filter by Plan</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handlePlanFilter("all")}>
                        All Plans
                      </DropdownMenuItem>
                      {plans.map(plan => (
                        <DropdownMenuItem key={plan.id} onClick={() => handlePlanFilter(plan.name)}>
                          {plan.name}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleStatusFilter("all")}>
                        All Status
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusFilter("active")}>
                        Active
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusFilter("trialing")}>
                        Trial
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusFilter("canceled")}>
                        Canceled
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusFilter("past_due")}>
                        Past Due
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button variant="outline" size="sm" className="h-9">
                    <Download className="mr-2 h-3.5 w-3.5" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Billing</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptionsQuery.isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <div className="flex justify-center items-center">
                            <RotateCw className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
                            Loading subscriptions...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : subscriptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No subscriptions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      subscriptions.map((subscription) => (
                        <TableRow key={subscription.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{subscription.username}</span>
                              <span className="text-sm text-muted-foreground">{subscription.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {subscription.planName}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(subscription.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">
                                {new Date(subscription.startDate).toLocaleDateString()} - 
                                {subscription.endDate ? 
                                  new Date(subscription.endDate).toLocaleDateString() : 
                                  "Ongoing"}
                              </span>
                              {subscription.renewsAt && (
                                <span className="text-xs text-muted-foreground">
                                  Renews: {new Date(subscription.renewsAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {subscription.billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            ${subscription.amount}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit subscription
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Mail className="mr-2 h-4 w-4" />
                                  Email user
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Renew subscription
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FileText className="mr-2 h-4 w-4" />
                                  View invoices
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex items-center justify-end">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) handlePageChange(currentPage - 1);
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <PaginationItem key={page}>
                        <PaginationLink 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(page);
                          }}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) handlePageChange(currentPage + 1);
                        }}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="plans">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plansQuery.isLoading ? (
              <div className="col-span-3 flex justify-center items-center h-60">
                <RotateCw className="h-8 w-8 animate-spin text-muted-foreground mr-3" />
                <span className="text-lg">Loading subscription plans...</span>
              </div>
            ) : plans.length === 0 ? (
              <div className="col-span-3 flex justify-center items-center h-60">
                <p>No subscription plans found. Create your first plan to get started.</p>
              </div>
            ) : (
              plans.map((plan) => (
                <Card key={plan.id} className={plan.isActive ? "" : "opacity-70"}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>
                          ${plan.price} / {plan.billingCycle}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditPlan(plan)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit plan
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View subscribers
                          </DropdownMenuItem>
                          {plan.isActive ? (
                            <DropdownMenuItem>
                              <BadgeDollarSign className="mr-2 h-4 w-4" />
                              Change pricing
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Activate plan
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Badge className={plan.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {plan.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Subscribers</span>
                          <span className="font-medium">{plan.userCount}</span>
                        </div>
                        <Progress value={plan.userCount * 5} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Features</h4>
                        <ul className="space-y-1">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="text-sm flex items-start">
                              <div className="rounded-full bg-green-100 p-1 mr-2 mt-0.5">
                                <svg className="h-2 w-2 text-green-600" fill="currentColor" viewBox="0 0 8 8">
                                  <circle cx="4" cy="4" r="3" />
                                </svg>
                              </div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="analytics">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{revenueStats.monthly}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-500">+{revenueStats.growth}%</span> from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Yearly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{revenueStats.yearly}</div>
                  <p className="text-xs text-muted-foreground">Annual subscriptions</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{subscriptions.filter(s => s.status === 'active').length}</div>
                  <p className="text-xs text-muted-foreground">Across all plans</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Trial Conversions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">68%</div>
                  <p className="text-xs text-muted-foreground">Trial to paid conversion rate</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Revenue Over Time</CardTitle>
                <CardDescription>Monthly subscription revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="h-16 w-16 opacity-50" />
                  <span className="ml-4 text-lg">Chart visualization will appear here</span>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Distribution</CardTitle>
                  <CardDescription>By plan type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    <Wallet className="h-16 w-16 opacity-50" />
                    <span className="ml-4 text-lg">Chart visualization will appear here</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Churn Rate</CardTitle>
                  <CardDescription>Monthly subscription cancellations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    <CreditCard className="h-16 w-16 opacity-50" />
                    <span className="ml-4 text-lg">Chart visualization will appear here</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Plan Dialog */}
      <Dialog open={isCreatePlanOpen} onOpenChange={setIsCreatePlanOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Create New Plan</DialogTitle>
            <DialogDescription>
              Add a new subscription plan to your platform.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Plan Name</Label>
              <Input id="name" placeholder="e.g. Basic, Pro, Enterprise" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="price">Price</Label>
                <Input id="price" placeholder="99.99" type="number" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="billing-cycle">Billing Cycle</Label>
                <Select>
                  <SelectTrigger id="billing-cycle">
                    <SelectValue placeholder="Select cycle" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="features">Features (one per line)</Label>
              <textarea 
                id="features" 
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="API access&#10;Unlimited vessels&#10;24/7 support"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="active" defaultChecked />
              <Label htmlFor="active">Set as active plan</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatePlanOpen(false)}>Cancel</Button>
            <Button type="submit">Create Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog open={isEditPlanOpen} onOpenChange={setIsEditPlanOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Subscription Plan</DialogTitle>
            <DialogDescription>
              Update this subscription plan details.
            </DialogDescription>
          </DialogHeader>
          {currentEditPlan && (
            <div className="grid gap-4 py-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="edit-name">Plan Name</Label>
                <Input id="edit-name" defaultValue={currentEditPlan.name} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="edit-price">Price</Label>
                  <Input id="edit-price" defaultValue={currentEditPlan.price} type="number" />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="edit-billing-cycle">Billing Cycle</Label>
                  <Select defaultValue={currentEditPlan.billingCycle}>
                    <SelectTrigger id="edit-billing-cycle">
                      <SelectValue placeholder="Select cycle" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="edit-features">Features (one per line)</Label>
                <textarea 
                  id="edit-features" 
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue={currentEditPlan.features.join('\n')}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="edit-active" defaultChecked={currentEditPlan.isActive} />
                <Label htmlFor="edit-active">Set as active plan</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditPlanOpen(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

// Mock data for development
const mockPlans: Plan[] = [
  {
    id: 1,
    name: "Free",
    price: 0,
    billingCycle: "monthly",
    isActive: true,
    features: [
      "Basic vessel tracking",
      "5 tracked vessels",
      "Standard updates",
      "Email support"
    ],
    userCount: 150
  },
  {
    id: 2,
    name: "Basic",
    price: 29.99,
    billingCycle: "monthly",
    isActive: true,
    features: [
      "Full vessel tracking",
      "25 tracked vessels",
      "Hourly updates",
      "Email + Chat support",
      "Basic analytics"
    ],
    userCount: 84
  },
  {
    id: 3,
    name: "Pro",
    price: 59.99,
    billingCycle: "monthly",
    isActive: true,
    features: [
      "Advanced vessel tracking",
      "100 tracked vessels",
      "Real-time updates",
      "Priority support",
      "Advanced analytics",
      "API access",
      "Document management"
    ],
    userCount: 36
  },
  {
    id: 4,
    name: "Enterprise",
    price: 199.99,
    billingCycle: "monthly",
    isActive: true,
    features: [
      "Unlimited vessel tracking",
      "Unlimited tracked vessels",
      "Real-time updates",
      "24/7 dedicated support",
      "Premium analytics",
      "Full API access",
      "Document management",
      "Custom reports",
      "Training sessions"
    ],
    userCount: 12
  },
  {
    id: 5,
    name: "Legacy Basic",
    price: 19.99,
    billingCycle: "monthly", 
    isActive: false,
    features: [
      "Basic vessel tracking",
      "10 tracked vessels",
      "Daily updates",
      "Email support"
    ],
    userCount: 5
  }
];

const mockSubscriptions: Subscription[] = [
  {
    id: 1,
    userId: 1,
    username: "johndoe",
    email: "john.doe@example.com",
    planId: 4,
    planName: "Enterprise",
    status: "active",
    startDate: "2023-01-15T00:00:00Z",
    endDate: "",
    billingCycle: "yearly",
    amount: 1999.99,
    renewsAt: "2024-01-15T00:00:00Z",
    cancelAtPeriodEnd: false,
    stripeCustomerId: "cus_123456",
    stripeSubscriptionId: "sub_123456"
  },
  {
    id: 2,
    userId: 2,
    username: "janesmith",
    email: "jane.smith@example.com",
    planId: 3,
    planName: "Pro",
    status: "active",
    startDate: "2023-03-10T00:00:00Z",
    endDate: "",
    billingCycle: "monthly",
    amount: 59.99,
    renewsAt: "2023-06-10T00:00:00Z",
    cancelAtPeriodEnd: false,
    stripeCustomerId: "cus_234567",
    stripeSubscriptionId: "sub_234567"
  },
  {
    id: 3,
    userId: 3,
    username: "robertjohnson",
    email: "robert.johnson@example.com",
    planId: 3,
    planName: "Pro",
    status: "canceled",
    startDate: "2023-02-05T00:00:00Z",
    endDate: "2023-05-05T00:00:00Z",
    billingCycle: "monthly",
    amount: 59.99,
    cancelAtPeriodEnd: true,
    stripeCustomerId: "cus_345678",
    stripeSubscriptionId: "sub_345678"
  },
  {
    id: 4,
    userId: 4,
    username: "sarahlee",
    email: "sarah.lee@example.com",
    planId: 2,
    planName: "Basic",
    status: "trialing",
    startDate: "2023-05-01T00:00:00Z",
    endDate: "",
    billingCycle: "monthly",
    amount: 29.99,
    renewsAt: "2023-06-01T00:00:00Z",
    cancelAtPeriodEnd: false,
    stripeCustomerId: "cus_456789",
    stripeSubscriptionId: "sub_456789"
  },
  {
    id: 5,
    userId: 5,
    username: "michaelbrown",
    email: "michael.brown@example.com", 
    planId: 2,
    planName: "Basic",
    status: "past_due",
    startDate: "2023-04-05T00:00:00Z",
    endDate: "",
    billingCycle: "monthly",
    amount: 29.99,
    renewsAt: "2023-06-05T00:00:00Z",
    cancelAtPeriodEnd: false,
    stripeCustomerId: "cus_567890",
    stripeSubscriptionId: "sub_567890"
  },
  {
    id: 6,
    userId: 6,
    username: "emilyjones",
    email: "emily.jones@example.com",
    planId: 4,
    planName: "Enterprise",
    status: "active",
    startDate: "2023-01-20T00:00:00Z",
    endDate: "",
    billingCycle: "yearly",
    amount: 1999.99,
    renewsAt: "2024-01-20T00:00:00Z",
    cancelAtPeriodEnd: false,
    stripeCustomerId: "cus_678901",
    stripeSubscriptionId: "sub_678901"
  }
];