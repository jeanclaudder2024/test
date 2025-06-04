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
import { Building2, Plus, Edit, Trash2, Link, Users, TrendingUp, DollarSign, Globe, Phone, Mail, Calendar, Award, Briefcase } from 'lucide-react';
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
  lastUpdated?: string;
  createdAt?: string;
}

interface Deal {
  id: number;
  brokerId: number;
  fakeCompanyId: number;
  realCompanyId?: number;
  dealType: string;
  status: string;
  title: string;
  description?: string;
  requestedVolume?: number;
  requestedPrice?: number;
  dealValue?: number;
  notes?: string;
  adminNotes?: string;
  approvedBy?: number;
  approvedAt?: string;
  completedAt?: string;
  createdAt?: string;
  lastUpdated?: string;
}

interface CompanyStats {
  totalCompanies: number;
  realCompanies: number;
  fakeCompanies: number;
  pendingDeals: number;
  totalRevenue: number;
  avgEmployees: number;
}

export default function CompanyManagement() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [newCompanyData, setNewCompanyData] = useState({
    name: '',
    country: '',
    region: '',
    website: '',
    description: '',
    companyType: 'real' as 'real' | 'fake',
    linkedCompanyId: '',
    isVisibleToBrokers: true,
    publiclyTraded: false,
    stockSymbol: '',
    revenue: '',
    employees: '',
    foundedYear: '',
    ceo: '',
    fleetSize: '',
    specialization: '',
    headquarters: '',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch companies
  const { data: companiesData, isLoading: companiesLoading } = useQuery({
    queryKey: ['/api/companies', searchTerm, filterType],
    queryFn: () => apiRequest(`/api/companies?search=${searchTerm}&type=${filterType}`),
  });

  // Fetch company statistics
  const { data: statsData } = useQuery({
    queryKey: ['/api/companies/stats/summary'],
    queryFn: () => apiRequest('/api/companies/stats/summary'),
  });

  // Fetch deals
  const { data: dealsData } = useQuery({
    queryKey: ['/api/companies/deals'],
    queryFn: () => apiRequest('/api/companies/deals'),
  });

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/companies', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/companies/stats/summary'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({ title: 'Success', description: 'Company created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to create company', variant: 'destructive' });
    },
  });

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/companies/${id}`, { method: 'PUT', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/companies/stats/summary'] });
      setEditingCompany(null);
      resetForm();
      toast({ title: 'Success', description: 'Company updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to update company', variant: 'destructive' });
    },
  });

  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/companies/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/companies/stats/summary'] });
      toast({ title: 'Success', description: 'Company deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to delete company', variant: 'destructive' });
    },
  });

  // Approve deal mutation
  const approveDealMutation = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) => 
      apiRequest(`/api/companies/deals/${id}/approve`, { method: 'POST', body: { adminNotes: notes, approvedBy: 1 } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies/deals'] });
      toast({ title: 'Success', description: 'Deal approved successfully' });
    },
  });

  // Reject deal mutation
  const rejectDealMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => 
      apiRequest(`/api/companies/deals/${id}/reject`, { method: 'POST', body: { adminNotes: reason, approvedBy: 1 } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies/deals'] });
      toast({ title: 'Success', description: 'Deal rejected successfully' });
    },
  });

  const resetForm = () => {
    setNewCompanyData({
      name: '',
      country: '',
      region: '',
      website: '',
      description: '',
      companyType: 'real',
      linkedCompanyId: '',
      isVisibleToBrokers: true,
      publiclyTraded: false,
      stockSymbol: '',
      revenue: '',
      employees: '',
      foundedYear: '',
      ceo: '',
      fleetSize: '',
      specialization: '',
      headquarters: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      ...newCompanyData,
      linkedCompanyId: newCompanyData.linkedCompanyId ? parseInt(newCompanyData.linkedCompanyId) : null,
      revenue: newCompanyData.revenue ? parseFloat(newCompanyData.revenue) : null,
      employees: newCompanyData.employees ? parseInt(newCompanyData.employees) : null,
      foundedYear: newCompanyData.foundedYear ? parseInt(newCompanyData.foundedYear) : null,
      fleetSize: newCompanyData.fleetSize ? parseInt(newCompanyData.fleetSize) : null,
    };

    if (editingCompany) {
      updateCompanyMutation.mutate({ id: editingCompany.id, data: formData });
    } else {
      createCompanyMutation.mutate(formData);
    }
  };

  const startEdit = (company: Company) => {
    setEditingCompany(company);
    setNewCompanyData({
      name: company.name,
      country: company.country,
      region: company.region,
      website: company.website || '',
      description: company.description || '',
      companyType: company.companyType,
      linkedCompanyId: company.linkedCompanyId?.toString() || '',
      isVisibleToBrokers: company.isVisibleToBrokers,
      publiclyTraded: company.publiclyTraded,
      stockSymbol: company.stockSymbol || '',
      revenue: company.revenue?.toString() || '',
      employees: company.employees?.toString() || '',
      foundedYear: company.foundedYear?.toString() || '',
      ceo: company.ceo || '',
      fleetSize: company.fleetSize?.toString() || '',
      specialization: company.specialization || '',
      headquarters: company.headquarters || '',
    });
    setIsCreateDialogOpen(true);
  };

  const companies = companiesData?.companies || [];
  const realCompanies = companies.filter((c: Company) => c.companyType === 'real');
  const fakeCompanies = companies.filter((c: Company) => c.companyType === 'fake');
  const deals = dealsData?.deals || [];
  const stats = statsData || {
    totalCompanies: 0,
    realCompanies: 0,
    fakeCompanies: 0,
    pendingDeals: 0,
    totalRevenue: 0,
    avgEmployees: 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              Company Management
            </h1>
            <p className="text-gray-600 mt-2">Manage real and fake companies with professional connections</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCompany ? 'Edit Company' : 'Create New Company'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Company Name *</Label>
                    <Input
                      id="name"
                      value={newCompanyData.name}
                      onChange={(e) => setNewCompanyData({ ...newCompanyData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyType">Company Type *</Label>
                    <Select 
                      value={newCompanyData.companyType}
                      onValueChange={(value: 'real' | 'fake') => setNewCompanyData({ ...newCompanyData, companyType: value })}
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
                </div>

                {newCompanyData.companyType === 'fake' && (
                  <div>
                    <Label htmlFor="linkedCompanyId">Linked Real Company</Label>
                    <Select 
                      value={newCompanyData.linkedCompanyId}
                      onValueChange={(value) => setNewCompanyData({ ...newCompanyData, linkedCompanyId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a real company" />
                      </SelectTrigger>
                      <SelectContent>
                        {realCompanies.map((company: Company) => (
                          <SelectItem key={company.id} value={company.id.toString()}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={newCompanyData.country}
                      onChange={(e) => setNewCompanyData({ ...newCompanyData, country: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="region">Region *</Label>
                    <Select 
                      value={newCompanyData.region}
                      onValueChange={(value) => setNewCompanyData({ ...newCompanyData, region: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="North America">North America</SelectItem>
                        <SelectItem value="Europe">Europe</SelectItem>
                        <SelectItem value="Asia-Pacific">Asia-Pacific</SelectItem>
                        <SelectItem value="Middle East">Middle East</SelectItem>
                        <SelectItem value="Latin America">Latin America</SelectItem>
                        <SelectItem value="Africa">Africa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={newCompanyData.website}
                      onChange={(e) => setNewCompanyData({ ...newCompanyData, website: e.target.value })}
                      placeholder="https://company.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="headquarters">Headquarters</Label>
                    <Input
                      id="headquarters"
                      value={newCompanyData.headquarters}
                      onChange={(e) => setNewCompanyData({ ...newCompanyData, headquarters: e.target.value })}
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ceo">CEO</Label>
                    <Input
                      id="ceo"
                      value={newCompanyData.ceo}
                      onChange={(e) => setNewCompanyData({ ...newCompanyData, ceo: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      value={newCompanyData.specialization}
                      onChange={(e) => setNewCompanyData({ ...newCompanyData, specialization: e.target.value })}
                      placeholder="e.g., Integrated Oil & Gas"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="employees">Employees</Label>
                    <Input
                      id="employees"
                      type="number"
                      value={newCompanyData.employees}
                      onChange={(e) => setNewCompanyData({ ...newCompanyData, employees: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="foundedYear">Founded Year</Label>
                    <Input
                      id="foundedYear"
                      type="number"
                      value={newCompanyData.foundedYear}
                      onChange={(e) => setNewCompanyData({ ...newCompanyData, foundedYear: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fleetSize">Fleet Size</Label>
                    <Input
                      id="fleetSize"
                      type="number"
                      value={newCompanyData.fleetSize}
                      onChange={(e) => setNewCompanyData({ ...newCompanyData, fleetSize: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="revenue">Annual Revenue (USD)</Label>
                    <Input
                      id="revenue"
                      type="number"
                      step="0.01"
                      value={newCompanyData.revenue}
                      onChange={(e) => setNewCompanyData({ ...newCompanyData, revenue: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="stockSymbol">Stock Symbol</Label>
                    <Input
                      id="stockSymbol"
                      value={newCompanyData.stockSymbol}
                      onChange={(e) => setNewCompanyData({ ...newCompanyData, stockSymbol: e.target.value })}
                      placeholder="e.g., XOM"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newCompanyData.description}
                    onChange={(e) => setNewCompanyData({ ...newCompanyData, description: e.target.value })}
                    placeholder="Brief description of the company"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newCompanyData.isVisibleToBrokers}
                      onChange={(e) => setNewCompanyData({ ...newCompanyData, isVisibleToBrokers: e.target.checked })}
                    />
                    <span>Visible to Brokers</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newCompanyData.publiclyTraded}
                      onChange={(e) => setNewCompanyData({ ...newCompanyData, publiclyTraded: e.target.checked })}
                    />
                    <span>Publicly Traded</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createCompanyMutation.isPending || updateCompanyMutation.isPending}>
                    {editingCompany ? 'Update' : 'Create'} Company
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCompanies}</div>
              <p className="text-xs text-muted-foreground">
                {stats.realCompanies} real, {stats.fakeCompanies} fake
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Deals</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingDeals}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(stats.totalRevenue / 1000000000).toFixed(1)}B
              </div>
              <p className="text-xs text-muted-foreground">
                Combined revenue
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.avgEmployees).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Per company
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Companies</TabsTrigger>
            <TabsTrigger value="deals">Deal Management</TabsTrigger>
            <TabsTrigger value="connections">Company Connections</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Search and Filter */}
            <div className="flex space-x-4">
              <Input
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  <SelectItem value="real">Real Companies</SelectItem>
                  <SelectItem value="fake">Fake Companies</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Companies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company: Company) => (
                <Card key={company.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{company.name}</CardTitle>
                        <CardDescription>{company.country}, {company.region}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={company.companyType === 'real' ? 'default' : 'secondary'}>
                          {company.companyType}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => startEdit(company)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => deleteCompanyMutation.mutate(company.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {company.specialization && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Briefcase className="h-4 w-4 mr-2" />
                          {company.specialization}
                        </div>
                      )}
                      {company.ceo && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          CEO: {company.ceo}
                        </div>
                      )}
                      {company.employees && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          {company.employees.toLocaleString()} employees
                        </div>
                      )}
                      {company.revenue && (
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="h-4 w-4 mr-2" />
                          ${(company.revenue / 1000000000).toFixed(1)}B revenue
                        </div>
                      )}
                      {company.linkedCompanyId && (
                        <div className="flex items-center text-sm text-blue-600">
                          <Link className="h-4 w-4 mr-2" />
                          Linked to real company
                        </div>
                      )}
                      {company.website && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Globe className="h-4 w-4 mr-2" />
                          <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            Website
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="deals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Deal Management</CardTitle>
                <CardDescription>Review and approve broker deals with fake companies</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deal Title</TableHead>
                      <TableHead>Broker</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deals.map((deal: Deal) => (
                      <TableRow key={deal.id}>
                        <TableCell className="font-medium">{deal.title}</TableCell>
                        <TableCell>Broker {deal.brokerId}</TableCell>
                        <TableCell>Company {deal.fakeCompanyId}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{deal.dealType}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            deal.status === 'approved' ? 'default' :
                            deal.status === 'rejected' ? 'destructive' :
                            'secondary'
                          }>
                            {deal.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {deal.dealValue ? `$${deal.dealValue.toLocaleString()}` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {deal.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                onClick={() => approveDealMutation.mutate({ id: deal.id, notes: 'Approved by admin' })}
                              >
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => rejectDealMutation.mutate({ id: deal.id, reason: 'Rejected by admin' })}
                              >
                                Reject
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

          <TabsContent value="connections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Company Connections</CardTitle>
                <CardDescription>View relationships between real and fake companies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {realCompanies.map((realCompany: Company) => {
                    const linkedFakes = fakeCompanies.filter((fake: Company) => fake.linkedCompanyId === realCompany.id);
                    
                    return (
                      <div key={realCompany.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{realCompany.name}</h3>
                            <p className="text-sm text-gray-600">{realCompany.specialization}</p>
                          </div>
                          <Badge>Real Company</Badge>
                        </div>
                        
                        {linkedFakes.length > 0 ? (
                          <div>
                            <h4 className="font-medium mb-2">Connected Fake Companies:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {linkedFakes.map((fakeCompany: Company) => (
                                <div key={fakeCompany.id} className="p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-medium">{fakeCompany.name}</p>
                                      <p className="text-sm text-gray-600">{fakeCompany.country}</p>
                                    </div>
                                    <Badge variant="secondary">Fake</Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">No fake companies connected</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}