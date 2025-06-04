import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Building2, Users, TrendingUp, Globe, Eye, Link, Shield, Clock } from 'lucide-react';
import { Company } from '@shared/schema';
import { CompanyForm } from '@/components/ui/company-form';

export default function CompanyManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [companyTypeFilter, setCompanyTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch companies with filters
  const { data: companiesData, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['/api/companies', { 
      search: searchTerm, 
      page: currentPage, 
      limit: pageSize,
      companyType: companyTypeFilter 
    }],
    queryFn: () => apiRequest(`/api/companies?search=${searchTerm}&page=${currentPage}&limit=${pageSize}&companyType=${companyTypeFilter}`),
  });

  // Fetch company statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/companies/stats/summary'],
    queryFn: () => apiRequest('/api/companies/stats/summary'),
  });

  // Fetch deals
  const { data: deals } = useQuery({
    queryKey: ['/api/companies/deals'],
    queryFn: () => apiRequest('/api/companies/deals'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/companies/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      toast({ title: 'Success', description: 'Company deleted successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to delete company',
        variant: 'destructive' 
      });
    },
  });

  const companies = companiesData?.companies || [];
  const pagination = companiesData?.pagination;

  const filteredCompanies = companies.filter((company: Company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.country && company.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (company.specialization && company.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setIsDialogOpen(true);
  };

  const handleDelete = (company: Company) => {
    if (confirm(`Are you sure you want to delete ${company.name}?`)) {
      deleteMutation.mutate(company.id);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedCompany(null);
  };

  const getCompanyTypeBadge = (type: string) => {
    if (type === 'real') {
      return <Badge variant="default" className="bg-green-100 text-green-800"><Shield className="w-3 h-3 mr-1" />Real</Badge>;
    }
    return <Badge variant="secondary" className="bg-orange-100 text-orange-800"><Eye className="w-3 h-3 mr-1" />Fake</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Company Management</h1>
          <p className="text-muted-foreground">Manage real and fake companies with deal tracking</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedCompany(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedCompany ? 'Edit Company' : 'Create New Company'}
              </DialogTitle>
              <DialogDescription>
                {selectedCompany ? 'Update company information' : 'Add a new company to the system'}
              </DialogDescription>
            </DialogHeader>
            <CompanyForm
              company={selectedCompany || undefined}
              onSuccess={handleDialogClose}
              onCancel={handleDialogClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.realCompanies} real, {stats.fakeCompanies} fake
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Fleet Size</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.averageFleetSize)}</div>
              <p className="text-xs text-muted-foreground">vessels per company</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Public Companies</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.publiclyTraded}</div>
              <p className="text-xs text-muted-foreground">listed on exchanges</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deals?.filter((d: any) => d.deal.status === 'pending').length || 0}</div>
              <p className="text-xs text-muted-foreground">pending approval</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="companies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="deals">Deal Management</TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={companyTypeFilter} onValueChange={setCompanyTypeFilter}>
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Fleet Size</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingCompanies ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading companies...
                    </TableCell>
                  </TableRow>
                ) : filteredCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No companies found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{company.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {company.headquarters || 'No headquarters'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getCompanyTypeBadge(company.companyType || 'real')}</TableCell>
                      <TableCell>{company.country || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{company.specialization || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell>{company.fleetSize || 0}</TableCell>
                      <TableCell>{company.employees || 0}</TableCell>
                      <TableCell>{getStatusBadge(company.status || 'active')}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(company)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(company)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
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

          {/* Pagination */}
          {pagination && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {Math.min(pagination.page * pagination.limit - pagination.limit + 1, pagination.total)} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} companies
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="deals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deal Management</CardTitle>
              <CardDescription>
                Manage deal requests between brokers and fake companies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deals && deals.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Deal Title</TableHead>
                        <TableHead>Fake Company</TableHead>
                        <TableHead>Deal Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deals.map((dealItem: any) => (
                        <TableRow key={dealItem.deal.id}>
                          <TableCell className="font-medium">{dealItem.deal.title}</TableCell>
                          <TableCell>{dealItem.fakeCompany?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{dealItem.deal.dealType}</Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(dealItem.deal.status)}</TableCell>
                          <TableCell>
                            {new Date(dealItem.deal.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                {dealItem.deal.status === 'pending' && (
                                  <>
                                    <DropdownMenuItem className="text-green-600">
                                      <Link className="mr-2 h-4 w-4" />
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Reject
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No deals found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}