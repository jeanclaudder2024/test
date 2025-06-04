import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Building2, Plus, Edit, Trash2, Link, Users, TrendingUp, DollarSign, Globe, Phone, Mail, Calendar, Award, Briefcase, Eye, EyeOff, CheckCircle, XCircle, Clock } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Company {
  id: number;
  name: string;
  country: string;
  region: string;
  website?: string;
  description?: string;
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
  headquarters?: string;
  logo?: string;
  createdAt?: Date;
  lastUpdated?: Date;
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
  approvedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  lastUpdated?: Date;
}

interface CompanyStats {
  total: number;
  realCompanies: number;
  fakeCompanies: number;
  pendingDeals: number;
  totalCompanies: number;
}

export function CompanyManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'real' | 'fake'>('all');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch companies
  const { data: companiesData, isLoading: companiesLoading } = useQuery({
    queryKey: ['/api/companies', { page: currentPage, limit: itemsPerPage, search: searchTerm, type: filterType }],
    retry: false,
  });

  // Fetch company statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/companies/stats/summary'],
    retry: false,
  });

  // Fetch deals
  const { data: dealsData } = useQuery({
    queryKey: ['/api/companies/deals'],
    retry: false,
  });

  // Fetch real companies for linking
  const { data: realCompanies } = useQuery({
    queryKey: ['/api/companies/real-companies'],
    retry: false,
  });

  const companies = (companiesData as any)?.companies || [];
  const deals = (dealsData as any)?.deals || [];
  const stats = statsData as CompanyStats || { total: 0, realCompanies: 0, fakeCompanies: 0, pendingDeals: 0, totalCompanies: 0 };

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: async (companyData: Partial<Company>) => {
      return apiRequest('/api/companies', {
        method: 'POST',
        body: JSON.stringify(companyData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/companies/stats/summary'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Company created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create company",
        variant: "destructive",
      });
    },
  });

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Company> }) => {
      return apiRequest(`/api/companies/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      setIsEditDialogOpen(false);
      setSelectedCompany(null);
      toast({
        title: "Success",
        description: "Company updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update company",
        variant: "destructive",
      });
    },
  });

  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/companies/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/companies/stats/summary'] });
      toast({
        title: "Success",
        description: "Company deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete company",
        variant: "destructive",
      });
    },
  });

  // Approve deal mutation
  const approveDealMutation = useMutation({
    mutationFn: async ({ dealId, adminNotes }: { dealId: number; adminNotes: string }) => {
      return apiRequest(`/api/companies/deals/${dealId}/approve`, {
        method: 'POST',
        body: JSON.stringify({ adminNotes, approvedBy: 1 }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies/deals'] });
      toast({
        title: "Success",
        description: "Deal approved successfully",
      });
    },
  });

  // Reject deal mutation
  const rejectDealMutation = useMutation({
    mutationFn: async ({ dealId, reason }: { dealId: number; reason: string }) => {
      return apiRequest(`/api/companies/deals/${dealId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies/deals'] });
      toast({
        title: "Success",
        description: "Deal rejected successfully",
      });
    },
  });

  const handleCreateCompany = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const companyData = {
      name: formData.get('name') as string,
      country: formData.get('country') as string,
      region: formData.get('region') as string,
      website: formData.get('website') as string,
      description: formData.get('description') as string,
      companyType: formData.get('companyType') as 'real' | 'fake',
      linkedCompanyId: formData.get('linkedCompanyId') ? Number(formData.get('linkedCompanyId')) : null,
      isVisibleToBrokers: formData.get('isVisibleToBrokers') === 'true',
      publiclyTraded: formData.get('publiclyTraded') === 'true',
      stockSymbol: formData.get('stockSymbol') as string,
      revenue: formData.get('revenue') ? Number(formData.get('revenue')) : null,
      employees: formData.get('employees') ? Number(formData.get('employees')) : null,
      foundedYear: formData.get('foundedYear') ? Number(formData.get('foundedYear')) : null,
      ceo: formData.get('ceo') as string,
      fleetSize: formData.get('fleetSize') ? Number(formData.get('fleetSize')) : null,
      specialization: formData.get('specialization') as string,
      headquarters: formData.get('headquarters') as string,
    };

    createCompanyMutation.mutate(companyData);
  };

  const handleUpdateCompany = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCompany) return;

    const formData = new FormData(e.currentTarget);
    
    const companyData = {
      name: formData.get('name') as string,
      country: formData.get('country') as string,
      region: formData.get('region') as string,
      website: formData.get('website') as string,
      description: formData.get('description') as string,
      companyType: formData.get('companyType') as 'real' | 'fake',
      linkedCompanyId: formData.get('linkedCompanyId') ? Number(formData.get('linkedCompanyId')) : null,
      isVisibleToBrokers: formData.get('isVisibleToBrokers') === 'true',
      publiclyTraded: formData.get('publiclyTraded') === 'true',
      stockSymbol: formData.get('stockSymbol') as string,
      revenue: formData.get('revenue') ? Number(formData.get('revenue')) : null,
      employees: formData.get('employees') ? Number(formData.get('employees')) : null,
      foundedYear: formData.get('foundedYear') ? Number(formData.get('foundedYear')) : null,
      ceo: formData.get('ceo') as string,
      fleetSize: formData.get('fleetSize') ? Number(formData.get('fleetSize')) : null,
      specialization: formData.get('specialization') as string,
      headquarters: formData.get('headquarters') as string,
    };

    updateCompanyMutation.mutate({ id: selectedCompany.id, data: companyData });
  };

  const filteredCompanies = companies.filter((company: Company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || company.companyType === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Company Management</h2>
          <p className="text-muted-foreground">
            Manage real and fake oil companies with professional deal workflows
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Company</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyType">Company Type *</Label>
                  <Select name="companyType" defaultValue="real" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="real">Real Company</SelectItem>
                      <SelectItem value="fake">Fake Company</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" name="country" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Input id="region" name="region" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" name="website" type="url" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headquarters">Headquarters</Label>
                  <Input id="headquarters" name="headquarters" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ceo">CEO</Label>
                  <Input id="ceo" name="ceo" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input id="specialization" name="specialization" placeholder="e.g., Crude Oil, Refined Products" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employees">Employees</Label>
                  <Input id="employees" name="employees" type="number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="foundedYear">Founded Year</Label>
                  <Input id="foundedYear" name="foundedYear" type="number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fleetSize">Fleet Size</Label>
                  <Input id="fleetSize" name="fleetSize" type="number" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="revenue">Annual Revenue (USD)</Label>
                  <Input id="revenue" name="revenue" type="number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stockSymbol">Stock Symbol</Label>
                  <Input id="stockSymbol" name="stockSymbol" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="publiclyTraded" name="publiclyTraded" value="true" />
                  <Label htmlFor="publiclyTraded">Publicly Traded</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="isVisibleToBrokers" name="isVisibleToBrokers" value="true" defaultChecked />
                  <Label htmlFor="isVisibleToBrokers">Visible to Brokers</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedCompanyId">Linked Real Company (for fake companies)</Label>
                <Select name="linkedCompanyId">
                  <SelectTrigger>
                    <SelectValue placeholder="Select real company to link" />
                  </SelectTrigger>
                  <SelectContent>
                    {(realCompanies || []).map((company: Company) => (
                      <SelectItem key={company.id} value={company.id.toString()}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createCompanyMutation.isPending}>
                  {createCompanyMutation.isPending ? 'Creating...' : 'Create Company'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="deals">Deal Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCompanies || 0}</div>
                <p className="text-xs text-muted-foreground">
                  All companies in system
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Real Companies</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.realCompanies || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Authentic oil companies
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fake Companies</CardTitle>
                <Link className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.fakeCompanies || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Broker negotiation entities
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Deals</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingDeals || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting approval
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="companies" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex items-center space-x-4">
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={filterType} onValueChange={(value: 'all' | 'real' | 'fake') => setFilterType(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                <SelectItem value="real">Real Companies</SelectItem>
                <SelectItem value="fake">Fake Companies</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Companies Table */}
          <Card>
            <CardHeader>
              <CardTitle>Companies</CardTitle>
              <CardDescription>
                Manage your company database and Real/Fake relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Fleet Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company: Company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>
                        <Badge variant={company.companyType === 'real' ? 'default' : 'secondary'}>
                          {company.companyType}
                        </Badge>
                      </TableCell>
                      <TableCell>{company.country}</TableCell>
                      <TableCell>{company.specialization || 'N/A'}</TableCell>
                      <TableCell>{company.fleetSize || 'N/A'}</TableCell>
                      <TableCell>
                        {company.isVisibleToBrokers ? (
                          <Badge variant="outline" className="text-green-600">
                            <Eye className="mr-1 h-3 w-3" />
                            Visible
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">
                            <EyeOff className="mr-1 h-3 w-3" />
                            Hidden
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCompany(company);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteCompanyMutation.mutate(company.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deal Management</CardTitle>
              <CardDescription>
                Review and manage broker deal requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Fake Company</TableHead>
                    <TableHead>Deal Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deals.map((deal: any) => (
                    <TableRow key={deal.id}>
                      <TableCell className="font-medium">{deal.title}</TableCell>
                      <TableCell>{deal.fakeCompany?.name || 'N/A'}</TableCell>
                      <TableCell>${deal.dealValue?.toLocaleString() || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            deal.status === 'approved' ? 'default' : 
                            deal.status === 'rejected' ? 'destructive' : 
                            'secondary'
                          }
                        >
                          {deal.status === 'approved' && <CheckCircle className="mr-1 h-3 w-3" />}
                          {deal.status === 'rejected' && <XCircle className="mr-1 h-3 w-3" />}
                          {deal.status === 'pending' && <Clock className="mr-1 h-3 w-3" />}
                          {deal.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(deal.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {deal.status === 'pending' && (
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => approveDealMutation.mutate({ dealId: deal.id, adminNotes: 'Approved by admin' })}
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => rejectDealMutation.mutate({ dealId: deal.id, reason: 'Rejected by admin' })}
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Company Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
          </DialogHeader>
          {selectedCompany && (
            <form onSubmit={handleUpdateCompany} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Company Name *</Label>
                  <Input id="edit-name" name="name" defaultValue={selectedCompany.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-companyType">Company Type *</Label>
                  <Select name="companyType" defaultValue={selectedCompany.companyType} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="real">Real Company</SelectItem>
                      <SelectItem value="fake">Fake Company</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-country">Country</Label>
                  <Input id="edit-country" name="country" defaultValue={selectedCompany.country} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-region">Region</Label>
                  <Input id="edit-region" name="region" defaultValue={selectedCompany.region} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-website">Website</Label>
                  <Input id="edit-website" name="website" type="url" defaultValue={selectedCompany.website} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-headquarters">Headquarters</Label>
                  <Input id="edit-headquarters" name="headquarters" defaultValue={selectedCompany.headquarters} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea id="edit-description" name="description" rows={3} defaultValue={selectedCompany.description} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-ceo">CEO</Label>
                  <Input id="edit-ceo" name="ceo" defaultValue={selectedCompany.ceo} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-specialization">Specialization</Label>
                  <Input id="edit-specialization" name="specialization" defaultValue={selectedCompany.specialization} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-employees">Employees</Label>
                  <Input id="edit-employees" name="employees" type="number" defaultValue={selectedCompany.employees} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-foundedYear">Founded Year</Label>
                  <Input id="edit-foundedYear" name="foundedYear" type="number" defaultValue={selectedCompany.foundedYear} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-fleetSize">Fleet Size</Label>
                  <Input id="edit-fleetSize" name="fleetSize" type="number" defaultValue={selectedCompany.fleetSize} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-revenue">Annual Revenue (USD)</Label>
                  <Input id="edit-revenue" name="revenue" type="number" defaultValue={selectedCompany.revenue} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-stockSymbol">Stock Symbol</Label>
                  <Input id="edit-stockSymbol" name="stockSymbol" defaultValue={selectedCompany.stockSymbol} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="edit-publiclyTraded" 
                    name="publiclyTraded" 
                    value="true" 
                    defaultChecked={selectedCompany.publiclyTraded}
                  />
                  <Label htmlFor="edit-publiclyTraded">Publicly Traded</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="edit-isVisibleToBrokers" 
                    name="isVisibleToBrokers" 
                    value="true" 
                    defaultChecked={selectedCompany.isVisibleToBrokers}
                  />
                  <Label htmlFor="edit-isVisibleToBrokers">Visible to Brokers</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-linkedCompanyId">Linked Real Company</Label>
                <Select name="linkedCompanyId" defaultValue={selectedCompany.linkedCompanyId?.toString()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select real company to link" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No linked company</SelectItem>
                    {(realCompanies || []).map((company: Company) => (
                      <SelectItem key={company.id} value={company.id.toString()}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateCompanyMutation.isPending}>
                  {updateCompanyMutation.isPending ? 'Updating...' : 'Update Company'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}