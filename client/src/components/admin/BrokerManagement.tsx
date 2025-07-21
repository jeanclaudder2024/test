import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import TransactionProgress from "@/components/broker/TransactionProgress";
import BrokerDetails from "./BrokerDetails";
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
  Filter,
  Target,
  Eye,
  Edit,
  Trash2
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
  const [showBrokerDetails, setShowBrokerDetails] = useState(false);
  const [editingFile, setEditingFile] = useState<AdminBrokerFile | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<AdminBrokerFile | null>(null);
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

  // Filter brokers based on search term and status
  const filteredBrokers = brokers.filter(broker => {
    const matchesSearch = searchTerm === '' || 
      broker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${broker.firstName} ${broker.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && broker.subscription?.status === 'active') ||
      (statusFilter === 'inactive' && broker.subscription?.status !== 'active');
    
    return matchesSearch && matchesStatus;
  });

  // Create broker user mutation
  const createBrokerMutation = useMutation({
    mutationFn: async (brokerData: { email: string; firstName: string; lastName: string; password: string }) => {
      return await apiRequest('POST', '/api/admin/brokers', brokerData);
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

  // Edit file mutation
  const editFileMutation = useMutation({
    mutationFn: async (data: { id: number; description: string; category: string; priority: string }) => {
      const response = await fetch(`/api/admin/broker-files/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          description: data.description,
          category: data.category,
          priority: data.priority
        })
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "File updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/broker-files'] });
      setShowEditDialog(false);
      setEditingFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update file",
        variant: "destructive",
      });
    },
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: number) => {
      const response = await fetch(`/api/admin/broker-files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        }
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/broker-files'] });
      setShowDeleteDialog(false);
      setFileToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete file",
        variant: "destructive",
      });
    },
  });

  // Update deal status mutation
  const updateDealStatusMutation = useMutation({
    mutationFn: async ({ dealId, status }: { dealId: number; status: string }) => {
      return await apiRequest('PATCH', `/api/admin/broker-deals/${dealId}`, { status });
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

  // Show broker details if selected
  if (showBrokerDetails && selectedBroker) {
    return (
      <BrokerDetails 
        broker={selectedBroker} 
        onBack={() => {
          setShowBrokerDetails(false);
          setSelectedBroker(null);
        }}
      />
    );
  }

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
                            onClick={() => {
                              setSelectedBroker(broker);
                              setShowBrokerDetails(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
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
                        <div className="flex flex-col space-y-2 ml-4">
                          {/* Transaction Progress Button */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-2"
                              >
                                <Target className="h-4 w-4" />
                                View Progress
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Target className="h-5 w-5 text-blue-600" />
                                  Deal Transaction Progress - {deal.title}
                                </DialogTitle>
                                <DialogDescription>
                                  Track the 8-step CIF-ASWP transaction process and communicate with the broker
                                </DialogDescription>
                              </DialogHeader>
                              <TransactionProgress 
                                dealId={deal.id} 
                                currentUserRole="admin" 
                                currentUserId={33} // Admin user ID
                              />
                            </DialogContent>
                          </Dialog>
                          
                          {/* Approval Buttons */}
                          {deal.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => updateDealStatusMutation.mutate({ dealId: deal.id, status: 'approved' })}
                                disabled={updateDealStatusMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateDealStatusMutation.mutate({ dealId: deal.id, status: 'rejected' })}
                                disabled={updateDealStatusMutation.isPending}
                              >
                                <AlertCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Admin Files Shared with Brokers</CardTitle>
                <CardDescription>Manage files sent to broker accounts</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Send File to Broker
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Send File to Broker</DialogTitle>
                    <DialogDescription>
                      Upload and send a file to a specific broker account
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
                      const file = fileInput?.files?.[0];
                      
                      if (!file) {
                        toast({
                          title: "Error",
                          description: "Please select a file to upload",
                          variant: "destructive",
                        });
                        return;
                      }

                      const brokerId = formData.get('brokerId') as string;
                      const description = formData.get('description') as string;
                      const category = formData.get('category') as string;
                      const priority = formData.get('priority') as string;

                      if (!brokerId) {
                        toast({
                          title: "Error",
                          description: "Please select a broker",
                          variant: "destructive",
                        });
                        return;
                      }

                      try {
                        const uploadFormData = new FormData();
                        uploadFormData.append('file', file);
                        uploadFormData.append('brokerId', brokerId);
                        uploadFormData.append('description', description);
                        uploadFormData.append('category', category);
                        uploadFormData.append('priority', priority);

                        const response = await fetch('/api/admin/broker-files/upload', {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                          },
                          body: uploadFormData,
                        });

                        if (!response.ok) {
                          const errorData = await response.json();
                          throw new Error(errorData.message || 'Upload failed');
                        }

                        const result = await response.json();
                        
                        toast({
                          title: "Success",
                          description: "File sent to broker successfully",
                        });
                        
                        queryClient.invalidateQueries({ queryKey: ['/api/admin/broker-files'] });
                        
                        // Reset form
                        e.currentTarget.reset();
                      } catch (error) {
                        console.error('File upload error:', error);
                        toast({
                          title: "Error",
                          description: error instanceof Error ? error.message : "Failed to send file. Please try again.",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="brokerId">Select Broker</Label>
                      <select
                        id="brokerId"
                        name="brokerId"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Choose a broker...</option>
                        {brokers.map((broker) => (
                          <option key={broker.id} value={broker.id}>
                            {broker.firstName} {broker.lastName} ({broker.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="file">Select File</Label>
                      <Input
                        id="file"
                        name="file"
                        type="file"
                        required
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xls,.xlsx"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        required
                        placeholder="Enter file description..."
                        className="min-h-[80px]"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <select
                          id="category"
                          name="category"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="contract">Contract</option>
                          <option value="compliance">Compliance</option>
                          <option value="legal">Legal</option>
                          <option value="technical">Technical</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <select
                          id="priority"
                          name="priority"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                      Send File to Broker
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
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
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingFile(file);
                                setShowEditDialog(true);
                              }}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setFileToDelete(file);
                                setShowDeleteDialog(true);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit File Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit File Details</DialogTitle>
                <DialogDescription>
                  Update the file description, category, and priority
                </DialogDescription>
              </DialogHeader>
              {editingFile && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    editFileMutation.mutate({
                      id: editingFile.id,
                      description: formData.get('description') as string,
                      category: formData.get('category') as string,
                      priority: formData.get('priority') as string,
                    });
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      name="description"
                      defaultValue={editingFile.description}
                      required
                      placeholder="Enter file description..."
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-category">Category</Label>
                      <select
                        id="edit-category"
                        name="category"
                        defaultValue={editingFile.category}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="contract">Contract</option>
                        <option value="compliance">Compliance</option>
                        <option value="legal">Legal</option>
                        <option value="technical">Technical</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-priority">Priority</Label>
                      <select
                        id="edit-priority"
                        name="priority"
                        defaultValue={editingFile.priority}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={editFileMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                      {editFileMutation.isPending ? 'Updating...' : 'Update File'}
                    </Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>

          {/* Delete File Dialog */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Delete File</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this file? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              {fileToDelete && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">{fileToDelete.originalName}</h4>
                    <p className="text-sm text-gray-600">{fileToDelete.description}</p>
                    <p className="text-xs text-gray-500 mt-1">To: {fileToDelete.brokerName}</p>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowDeleteDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="button" 
                      variant="destructive"
                      disabled={deleteFileMutation.isPending}
                      onClick={() => deleteFileMutation.mutate(fileToDelete.id)}
                    >
                      {deleteFileMutation.isPending ? 'Deleting...' : 'Delete File'}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
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