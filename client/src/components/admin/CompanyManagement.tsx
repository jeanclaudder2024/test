import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Users,
  Globe,
  DollarSign,
  Calendar,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Send
} from "lucide-react";

interface Company {
  id: number;
  name: string;
  country: string;
  region: string;
  website: string;
  description: string;
  companyType: 'real' | 'fake';
  linkedCompanyId?: number;
  isVisibleToBrokers: boolean;
  publiclyTraded: boolean;
  stockSymbol?: string;
  revenue?: number;
  employees?: number;
  foundedYear?: number;
  ceo?: string;
  fleetSize?: number;
  specialization?: string;
  createdAt: string;
  lastUpdated: string;
}

interface Deal {
  id: number;
  brokerId: number;
  fakeCompanyId: number;
  realCompanyId?: number;
  dealType: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  title: string;
  description?: string;
  requestedVolume?: number;
  requestedPrice?: number;
  dealValue?: number;
  notes?: string;
  adminNotes?: string;
  approvedBy?: number;
  approvedAt?: string;
  createdAt: string;
  lastUpdated: string;
}

export function CompanyManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("companies");
  const [searchTerm, setSearchTerm] = useState("");
  const [companyTypeFilter, setCompanyTypeFilter] = useState<string>("all");
  const [dealStatusFilter, setDealStatusFilter] = useState<string>("all");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [showDealDialog, setShowDealDialog] = useState(false);

  // Fetch companies
  const { data: companiesData, isLoading: companiesLoading } = useQuery({
    queryKey: ['/api/companies'],
    retry: false,
  });

  // Fetch deals
  const { data: dealsData, isLoading: dealsLoading } = useQuery({
    queryKey: ['/api/companies/deals'],
    retry: false,
  });

  // Fetch company statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/companies/stats/summary'],
    retry: false,
  });

  const companies = companiesData?.companies || [];
  const deals = dealsData?.deals || [];
  const stats = statsData || {};

  // Filter companies
  const filteredCompanies = companies.filter((company: Company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = companyTypeFilter === "all" || company.companyType === companyTypeFilter;
    return matchesSearch && matchesType;
  });

  // Filter deals
  const filteredDeals = deals.filter((deal: Deal) => {
    const matchesStatus = dealStatusFilter === "all" || deal.status === dealStatusFilter;
    return matchesStatus;
  });

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/companies', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/companies/stats/summary'] });
      setShowCompanyDialog(false);
      toast({ title: "Company created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create company", variant: "destructive" });
    },
  });

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/companies/${id}`, { method: 'PATCH', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      setShowCompanyDialog(false);
      setSelectedCompany(null);
      toast({ title: "Company updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update company", variant: "destructive" });
    },
  });

  // Approve deal mutation
  const approveDealMutation = useMutation({
    mutationFn: (dealId: number) => 
      apiRequest(`/api/companies/deals/${dealId}/approve`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies/deals'] });
      toast({ title: "Deal approved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to approve deal", variant: "destructive" });
    },
  });

  // Reject deal mutation
  const rejectDealMutation = useMutation({
    mutationFn: ({ dealId, reason }: { dealId: number; reason: string }) => 
      apiRequest(`/api/companies/deals/${dealId}/reject`, { 
        method: 'POST', 
        body: { reason } 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies/deals'] });
      toast({ title: "Deal rejected" });
    },
    onError: () => {
      toast({ title: "Failed to reject deal", variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, icon: Clock, color: "text-yellow-600" },
      approved: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      rejected: { variant: "destructive" as const, icon: XCircle, color: "text-red-600" },
      completed: { variant: "outline" as const, icon: CheckCircle, color: "text-blue-600" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Companies</p>
                <p className="text-2xl font-bold">{stats.totalCompanies || 0}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Real Companies</p>
                <p className="text-2xl font-bold">{stats.realCompanies || 0}</p>
              </div>
              <Globe className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fake Companies</p>
                <p className="text-2xl font-bold">{stats.fakeCompanies || 0}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Deals</p>
                <p className="text-2xl font-bold">{stats.pendingDeals || 0}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Companies
          </TabsTrigger>
          <TabsTrigger value="deals" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Deal Requests
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Companies Tab */}
        <TabsContent value="companies" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Company Management
                  </CardTitle>
                  <CardDescription>
                    Manage Real and Fake oil companies in the system
                  </CardDescription>
                </div>
                <Dialog open={showCompanyDialog} onOpenChange={setShowCompanyDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Company
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {selectedCompany ? 'Edit Company' : 'Create New Company'}
                      </DialogTitle>
                      <DialogDescription>
                        {selectedCompany ? 'Update company information' : 'Add a new oil company to the system'}
                      </DialogDescription>
                    </DialogHeader>
                    <CompanyForm 
                      company={selectedCompany}
                      onSubmit={(data) => {
                        if (selectedCompany) {
                          updateCompanyMutation.mutate({ id: selectedCompany.id, data });
                        } else {
                          createCompanyMutation.mutate(data);
                        }
                      }}
                      isLoading={createCompanyMutation.isPending || updateCompanyMutation.isPending}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Companies</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by name or country..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-48">
                  <Label>Company Type</Label>
                  <Select value={companyTypeFilter} onValueChange={setCompanyTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="real">Real Companies</SelectItem>
                      <SelectItem value="fake">Fake Companies</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Companies Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Employees</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companiesLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading companies...
                        </TableCell>
                      </TableRow>
                    ) : filteredCompanies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No companies found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCompanies.map((company: Company) => (
                        <TableRow key={company.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{company.name}</div>
                              {company.specialization && (
                                <div className="text-sm text-muted-foreground">
                                  {company.specialization}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={company.companyType === 'real' ? 'default' : 'secondary'}>
                              {company.companyType}
                            </Badge>
                          </TableCell>
                          <TableCell>{company.country}</TableCell>
                          <TableCell>{company.employees?.toLocaleString() || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={company.isVisibleToBrokers ? 'default' : 'secondary'}>
                              {company.isVisibleToBrokers ? 'Visible' : 'Hidden'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedCompany(company);
                                  setShowCompanyDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deals Tab */}
        <TabsContent value="deals" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Deal Requests
                  </CardTitle>
                  <CardDescription>
                    Review and approve broker deal requests
                  </CardDescription>
                </div>
                <div className="w-full sm:w-48">
                  <Select value={dealStatusFilter} onValueChange={setDealStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deal Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dealsLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Loading deals...
                        </TableCell>
                      </TableRow>
                    ) : filteredDeals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No deals found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDeals.map((deal: Deal) => (
                        <TableRow key={deal.id}>
                          <TableCell>
                            <div className="font-medium">{deal.title}</div>
                            {deal.description && (
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {deal.description}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{deal.dealType}</Badge>
                          </TableCell>
                          <TableCell>
                            {deal.requestedVolume ? `${deal.requestedVolume.toLocaleString()} bbl` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {deal.dealValue ? `$${deal.dealValue.toLocaleString()}` : 'N/A'}
                          </TableCell>
                          <TableCell>{getStatusBadge(deal.status)}</TableCell>
                          <TableCell>
                            {new Date(deal.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {deal.status === 'pending' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => approveDealMutation.mutate(deal.id)}
                                    disabled={approveDealMutation.isPending}
                                  >
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => rejectDealMutation.mutate({ 
                                      dealId: deal.id, 
                                      reason: 'Administrative review' 
                                    })}
                                    disabled={rejectDealMutation.isPending}
                                  >
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedDeal(deal)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Broker Notifications
              </CardTitle>
              <CardDescription>
                Manage notifications sent to brokers about deal approvals and documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Send className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">
                  Notification management interface will be available here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface CompanyFormProps {
  company?: Company | null;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

function CompanyForm({ company, onSubmit, isLoading }: CompanyFormProps) {
  const [formData, setFormData] = useState({
    name: company?.name || '',
    country: company?.country || '',
    region: company?.region || '',
    website: company?.website || '',
    description: company?.description || '',
    companyType: company?.companyType || 'real',
    linkedCompanyId: company?.linkedCompanyId || '',
    isVisibleToBrokers: company?.isVisibleToBrokers ?? true,
    publiclyTraded: company?.publiclyTraded ?? false,
    stockSymbol: company?.stockSymbol || '',
    revenue: company?.revenue || '',
    employees: company?.employees || '',
    foundedYear: company?.foundedYear || '',
    ceo: company?.ceo || '',
    fleetSize: company?.fleetSize || '',
    specialization: company?.specialization || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      revenue: formData.revenue ? Number(formData.revenue) : null,
      employees: formData.employees ? Number(formData.employees) : null,
      foundedYear: formData.foundedYear ? Number(formData.foundedYear) : null,
      fleetSize: formData.fleetSize ? Number(formData.fleetSize) : null,
      linkedCompanyId: formData.linkedCompanyId ? Number(formData.linkedCompanyId) : null,
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Company Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyType">Company Type *</Label>
          <Select
            value={formData.companyType}
            onValueChange={(value) => setFormData({ ...formData, companyType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="real">Real Company</SelectItem>
              <SelectItem value="fake">Fake Company</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="region">Region</Label>
          <Input
            id="region"
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialization">Specialization</Label>
          <Input
            id="specialization"
            value={formData.specialization}
            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employees">Employees</Label>
          <Input
            id="employees"
            type="number"
            value={formData.employees}
            onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="foundedYear">Founded Year</Label>
          <Input
            id="foundedYear"
            type="number"
            value={formData.foundedYear}
            onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ceo">CEO</Label>
          <Input
            id="ceo"
            value={formData.ceo}
            onChange={(e) => setFormData({ ...formData, ceo: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fleetSize">Fleet Size</Label>
          <Input
            id="fleetSize"
            type="number"
            value={formData.fleetSize}
            onChange={(e) => setFormData({ ...formData, fleetSize: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex items-center justify-end space-x-4 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : company ? 'Update Company' : 'Create Company'}
        </Button>
      </div>
    </form>
  );
}