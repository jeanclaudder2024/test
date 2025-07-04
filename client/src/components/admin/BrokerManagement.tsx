import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Building2, 
  Calendar, 
  TrendingUp, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Activity,
  UserPlus,
  Filter
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface BrokerUser {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  createdAt: string;
  subscription?: {
    status: string;
    planId: number;
    currentPeriodEnd: string;
  };
  stats?: {
    totalDeals: number;
    totalValue: string;
    activeDeals: number;
    completionRate: number;
  };
}

interface BrokerDeal {
  id: number;
  brokerId: number;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedAmount: string;
  oilType: string;
  quantity: string;
  deliveryDate: string;
  createdAt: string;
  brokerName: string;
}

interface AdminBrokerFile {
  id: number;
  brokerId: number;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: string;
  description: string;
  category: 'contract' | 'compliance' | 'legal' | 'technical' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  brokerName: string;
}

export function BrokerManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBroker, setSelectedBroker] = useState<BrokerUser | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch brokers (users with broker subscription plan)
  const { data: brokers = [], isLoading: brokersLoading } = useQuery<BrokerUser[]>({
    queryKey: ['/api/admin/brokers'],
    retry: false,
  });

  // Fetch broker deals
  const { data: brokerDeals = [], isLoading: dealsLoading } = useQuery<BrokerDeal[]>({
    queryKey: ['/api/admin/broker-deals'],
    retry: false,
  });

  // Fetch admin files sent to brokers
  const { data: adminFiles = [], isLoading: filesLoading } = useQuery<AdminBrokerFile[]>({
    queryKey: ['/api/admin/broker-files'],
    retry: false,
  });

  // Create broker user mutation
  const createBrokerMutation = useMutation({
    mutationFn: async (brokerData: { email: string; firstName: string; lastName: string; password: string }) => {
      return await apiRequest('/api/admin/brokers', {
        method: 'POST',
        body: JSON.stringify(brokerData),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Broker account created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/brokers'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create broker account",
        variant: "destructive",
      });
    },
  });

  // Update deal status mutation
  const updateDealStatusMutation = useMutation({
    mutationFn: async ({ dealId, status }: { dealId: number; status: string }) => {
      return await apiRequest(`/api/admin/broker-deals/${dealId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Deal status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/broker-deals'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update deal status",
        variant: "destructive",
      });
    },
  });

  const filteredBrokers = brokers.filter(broker => {
    const matchesSearch = searchTerm === '' || 
      broker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${broker.firstName} ${broker.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && broker.subscription?.status === 'active') ||
      (statusFilter === 'inactive' && broker.subscription?.status !== 'active');
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, icon: Clock, label: "Pending" },
      approved: { variant: "default" as const, icon: CheckCircle, label: "Approved" },
      rejected: { variant: "destructive" as const, icon: AlertCircle, label: "Rejected" },
      completed: { variant: "default" as const, icon: CheckCircle, label: "Completed" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: "secondary" as const,
      medium: "default" as const,
      high: "destructive" as const,
      urgent: "destructive" as const
    };
    
    return (
      <Badge variant={variants[priority as keyof typeof variants] || "secondary"}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Broker Management</h2>
          <p className="text-gray-600">Manage broker accounts, deals, and file sharing</p>
        </div>
        <Button 
          onClick={() => setActiveTab('create')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Broker
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white border">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="brokers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Brokers
          </TabsTrigger>
          <TabsTrigger value="deals" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Deals
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Files
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Brokers</p>
                    <p className="text-3xl font-bold text-gray-900">{brokers.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Deals</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {brokerDeals.filter(deal => deal.status === 'approved' || deal.status === 'pending').length}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {brokerDeals.filter(deal => deal.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Files Shared</p>
                    <p className="text-3xl font-bold text-gray-900">{adminFiles.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle>Recent Broker Activity</CardTitle>
              <CardDescription>Latest deals and file uploads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {brokerDeals.slice(0, 5).map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Building2 className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{deal.title}</p>
                        <p className="text-sm text-gray-500">by {deal.brokerName}</p>
                        <p className="text-xs text-gray-400">{new Date(deal.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{deal.requestedAmount}</p>
                        <p className="text-xs text-gray-500">{deal.oilType}</p>
                      </div>
                      {getStatusBadge(deal.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brokers" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search brokers by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid gap-6">
            {brokersLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading brokers...</p>
              </div>
            ) : filteredBrokers.length === 0 ? (
              <Card className="bg-white border border-gray-200">
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">No brokers found</p>
                  <p className="text-gray-500">Create your first broker account to get started.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredBrokers.map((broker) => (
                  <Card key={broker.id} className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {broker.firstName} {broker.lastName}
                            </h3>
                            <p className="text-gray-600">{broker.email}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                Joined {new Date(broker.createdAt).toLocaleDateString()}
                              </span>
                              {broker.stats && (
                                <span className="flex items-center">
                                  <TrendingUp className="h-4 w-4 mr-1" />
                                  {broker.stats.totalDeals} deals
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            {broker.subscription && (
                              <Badge variant={broker.subscription.status === 'active' ? 'default' : 'secondary'}>
                                {broker.subscription.status}
                              </Badge>
                            )}
                            {broker.stats && (
                              <p className="text-sm text-gray-500 mt-1">
                                {broker.stats.completionRate}% completion rate
                              </p>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedBroker(broker)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="deals" className="space-y-6">
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle>Broker Deal Requests</CardTitle>
              <CardDescription>Review and manage broker deal applications</CardDescription>
            </CardHeader>
            <CardContent>
              {dealsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading deals...</p>
                </div>
              ) : brokerDeals.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">No deals submitted</p>
                  <p className="text-gray-500">Broker deal requests will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {brokerDeals.map((deal) => (
                    <div key={deal.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{deal.title}</h3>
                            {getStatusBadge(deal.status)}
                          </div>
                          <p className="text-gray-600 mb-4">{deal.description}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-700">Broker</p>
                              <p className="text-gray-600">{deal.brokerName}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">Amount</p>
                              <p className="text-gray-600">{deal.requestedAmount}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">Oil Type</p>
                              <p className="text-gray-600">{deal.oilType}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">Quantity</p>
                              <p className="text-gray-600">{deal.quantity}</p>
                            </div>
                          </div>
                        </div>
                        {deal.status === 'pending' && (
                          <div className="flex space-x-2 ml-4">
                            <Button
                              size="sm"
                              onClick={() => updateDealStatusMutation.mutate({ dealId: deal.id, status: 'approved' })}
                              disabled={updateDealStatusMutation.isPending}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateDealStatusMutation.mutate({ dealId: deal.id, status: 'rejected' })}
                              disabled={updateDealStatusMutation.isPending}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-6">
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle>Admin Files Shared with Brokers</CardTitle>
              <CardDescription>Manage files sent to broker accounts</CardDescription>
            </CardHeader>
            <CardContent>
              {filesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading files...</p>
                </div>
              ) : adminFiles.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">No files shared</p>
                  <p className="text-gray-500">Files sent to brokers will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {adminFiles.map((file) => (
                    <div key={file.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <FileText className="h-8 w-8 text-blue-600" />
                          <div>
                            <h3 className="font-medium text-gray-900">{file.originalName}</h3>
                            <p className="text-sm text-gray-600">{file.description}</p>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                              <span>To: {file.brokerName}</span>
                              <span>{file.fileSize}</span>
                              <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getPriorityBadge(file.priority)}
                          <Badge variant={file.isRead ? 'default' : 'secondary'}>
                            {file.isRead ? 'Read' : 'Unread'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle>Create New Broker Account</CardTitle>
              <CardDescription>Add a new broker user with subscription access</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  createBrokerMutation.mutate({
                    email: formData.get('email') as string,
                    firstName: formData.get('firstName') as string,
                    lastName: formData.get('lastName') as string,
                    password: formData.get('password') as string,
                  });
                }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="Enter password"
                    minLength={6}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={createBrokerMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {createBrokerMutation.isPending ? 'Creating...' : 'Create Broker Account'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}