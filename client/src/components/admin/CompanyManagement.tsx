import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Factory, 
  Users, 
  MapPin, 
  Globe,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  User,
  Link as LinkIcon,
  Shuffle
} from 'lucide-react';
import { insertRealCompanySchema, type RealCompany, type FakeCompany } from '@shared/schema';

// Real Company form schema
const realCompanyFormSchema = insertRealCompanySchema.extend({
  founded: z.coerce.number().optional(),
  employees: z.coerce.number().optional(),
});

type RealCompanyFormData = z.infer<typeof realCompanyFormSchema>;

// Fake company names generator
const generateFakeCompanyName = () => {
  const prefixes = ['Global', 'International', 'Maritime', 'Ocean', 'Atlantic', 'Pacific', 'Northern', 'Southern', 'Eastern', 'Western'];
  const cores = ['Petroleum', 'Oil', 'Energy', 'Marine', 'Shipping', 'Trading', 'Transport', 'Logistics', 'Cargo', 'Fleet'];
  const suffixes = ['Corp', 'Ltd', 'Group', 'Holdings', 'Industries', 'Solutions', 'Services', 'Systems', 'Partners', 'Enterprises'];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const core = cores[Math.floor(Math.random() * cores.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${prefix} ${core} ${suffix}`;
};

interface CompanyWithRelations extends FakeCompany {
  realCompany: RealCompany;
}

export function CompanyManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [companyTypeChoice, setCompanyTypeChoice] = useState<'real' | 'fake' | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<RealCompany | null>(null);
  const [selectedRealCompanyForFake, setSelectedRealCompanyForFake] = useState<string>('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch real companies
  const { data: realCompaniesResponse, isLoading: realCompaniesLoading } = useQuery({
    queryKey: ['/api/admin/real-companies'],
    retry: false,
  });

  // Fetch fake companies with relations
  const { data: fakeCompaniesResponse, isLoading: fakeCompaniesLoading } = useQuery({
    queryKey: ['/api/admin/fake-companies'],
    retry: false,
  });

  const realCompanies = Array.isArray(realCompaniesResponse) ? realCompaniesResponse as RealCompany[] : [];
  const fakeCompanies = Array.isArray(fakeCompaniesResponse) ? fakeCompaniesResponse as CompanyWithRelations[] : [];

  // Real company form
  const realCompanyForm = useForm<RealCompanyFormData>({
    resolver: zodResolver(realCompanyFormSchema),
    defaultValues: {
      name: '',
      industry: 'Oil',
      address: '',
      description: '',
      website: '',
      phone: '',
      email: '',
      headquarters: '',
      ceo: '',
      revenue: '',
    },
  });

  // Create real company mutation
  const createRealCompanyMutation = useMutation({
    mutationFn: async (data: RealCompanyFormData) => {
      return apiRequest('/api/admin/real-companies', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/real-companies'] });
      toast({
        title: "Success",
        description: "Real company created successfully",
      });
      setCreateDialogOpen(false);
      setCompanyTypeChoice(null);
      realCompanyForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create real company",
        variant: "destructive",
      });
    },
  });

  // Create fake company mutation
  const createFakeCompanyMutation = useMutation({
    mutationFn: async (realCompanyId: number) => {
      const generatedName = generateFakeCompanyName();
      return apiRequest('/api/admin/fake-companies', {
        method: 'POST',
        body: JSON.stringify({
          realCompanyId,
          generatedName,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/fake-companies'] });
      toast({
        title: "Success",
        description: "Fake company created successfully",
      });
      setCreateDialogOpen(false);
      setCompanyTypeChoice(null);
      setSelectedRealCompanyForFake('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create fake company",
        variant: "destructive",
      });
    },
  });

  // Delete real company mutation
  const deleteRealCompanyMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/real-companies/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/real-companies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/fake-companies'] });
      toast({
        title: "Success",
        description: "Real company deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete real company",
        variant: "destructive",
      });
    },
  });

  // Delete fake company mutation
  const deleteFakeCompanyMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/fake-companies/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/fake-companies'] });
      toast({
        title: "Success",
        description: "Fake company deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete fake company",
        variant: "destructive",
      });
    },
  });

  const handleCreateCompany = () => {
    setCreateDialogOpen(true);
    setCompanyTypeChoice(null);
  };

  const handleRealCompanySubmit = (data: RealCompanyFormData) => {
    createRealCompanyMutation.mutate(data);
  };

  const handleCreateFakeCompany = () => {
    const realCompanyId = parseInt(selectedRealCompanyForFake);
    if (realCompanyId) {
      createFakeCompanyMutation.mutate(realCompanyId);
    }
  };

  const stats = {
    totalReal: realCompanies.length,
    totalFake: fakeCompanies.length,
    totalCompanies: realCompanies.length + fakeCompanies.length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Company Management</h1>
          <p className="text-muted-foreground">
            Manage real companies and their linked fake companies
          </p>
        </div>
        <Button onClick={handleCreateCompany}>
          <Plus className="mr-2 h-4 w-4" />
          Create Company
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Real Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.totalReal}</div>
              <Factory className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fake Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.totalFake}</div>
              <Shuffle className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.totalCompanies}</div>
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="real-companies">Real Companies</TabsTrigger>
          <TabsTrigger value="fake-companies">Fake Companies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Real Companies</CardTitle>
                <CardDescription>
                  Professional companies with authentic data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {realCompanies.slice(0, 5).map((company: RealCompany) => (
                    <div key={company.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Factory className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{company.name}</p>
                          <p className="text-sm text-muted-foreground">{company.industry}</p>
                        </div>
                      </div>
                      <Badge variant="outline">Real</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fake Companies</CardTitle>
                <CardDescription>
                  Auto-generated companies linked to real companies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {fakeCompanies.slice(0, 5).map((company: CompanyWithRelations) => (
                    <div key={company.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Shuffle className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium">{company.generatedName}</p>
                          <p className="text-sm text-muted-foreground">
                            Linked to: {company.realCompany?.name}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">Fake</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="real-companies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Real Companies</CardTitle>
              <CardDescription>
                Manage professional companies with authentic data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Linked Fake Companies</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {realCompanies.map((company: RealCompany) => {
                    const linkedFakes = fakeCompanies.filter((fake: CompanyWithRelations) => 
                      fake.realCompanyId === company.id
                    );
                    
                    return (
                      <TableRow key={company.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Factory className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{company.name}</p>
                              <p className="text-sm text-muted-foreground">{company.ceo}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{company.industry}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{company.headquarters || company.address}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{linkedFakes.length}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteRealCompanyMutation.mutate(company.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fake-companies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fake Companies</CardTitle>
              <CardDescription>
                Auto-generated companies linked to real companies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Generated Name</TableHead>
                    <TableHead>Linked Real Company</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fakeCompanies.map((company: CompanyWithRelations) => (
                    <TableRow key={company.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Shuffle className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium">{company.generatedName}</p>
                            <p className="text-sm text-muted-foreground">Auto-generated</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <LinkIcon className="h-3 w-3 text-muted-foreground" />
                          <span>{company.realCompany?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{company.realCompany?.industry}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {company.createdAt ? new Date(company.createdAt.toString()).toLocaleDateString() : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteFakeCompanyMutation.mutate(company.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Company Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Company</DialogTitle>
            <DialogDescription>
              Choose the type of company you want to create
            </DialogDescription>
          </DialogHeader>

          {!companyTypeChoice ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-500"
                  onClick={() => setCompanyTypeChoice('real')}
                >
                  <CardHeader className="text-center">
                    <Factory className="h-12 w-12 mx-auto text-blue-600" />
                    <CardTitle>Real Company</CardTitle>
                    <CardDescription>
                      Create a professional company with authentic data
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-orange-500"
                  onClick={() => setCompanyTypeChoice('fake')}
                >
                  <CardHeader className="text-center">
                    <Shuffle className="h-12 w-12 mx-auto text-orange-600" />
                    <CardTitle>Fake Company</CardTitle>
                    <CardDescription>
                      Auto-generate a company linked to a real company
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          ) : companyTypeChoice === 'real' ? (
            <form onSubmit={realCompanyForm.handleSubmit(handleRealCompanySubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name*</Label>
                  <Input
                    id="name"
                    {...realCompanyForm.register('name')}
                    placeholder="Enter company name"
                  />
                  {realCompanyForm.formState.errors.name && (
                    <p className="text-sm text-red-600">
                      {realCompanyForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry*</Label>
                  <Input
                    id="industry"
                    {...realCompanyForm.register('industry')}
                    placeholder="e.g., Oil, Shipping"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="headquarters">Headquarters</Label>
                  <Input
                    id="headquarters"
                    {...realCompanyForm.register('headquarters')}
                    placeholder="e.g., Houston, TX, USA"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ceo">CEO</Label>
                  <Input
                    id="ceo"
                    {...realCompanyForm.register('ceo')}
                    placeholder="CEO name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="founded">Founded Year</Label>
                  <Input
                    id="founded"
                    type="number"
                    {...realCompanyForm.register('founded')}
                    placeholder="e.g., 1985"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employees">Employees</Label>
                  <Input
                    id="employees"
                    type="number"
                    {...realCompanyForm.register('employees')}
                    placeholder="Number of employees"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="revenue">Revenue</Label>
                  <Input
                    id="revenue"
                    {...realCompanyForm.register('revenue')}
                    placeholder="e.g., $100M - $500M"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    {...realCompanyForm.register('website')}
                    placeholder="https://company.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    {...realCompanyForm.register('phone')}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...realCompanyForm.register('email')}
                    placeholder="contact@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address*</Label>
                <Input
                  id="address"
                  {...realCompanyForm.register('address')}
                  placeholder="Full company address"
                />
                {realCompanyForm.formState.errors.address && (
                  <p className="text-sm text-red-600">
                    {realCompanyForm.formState.errors.address.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description*</Label>
                <Textarea
                  id="description"
                  {...realCompanyForm.register('description')}
                  placeholder="Detailed company description"
                  rows={3}
                />
                {realCompanyForm.formState.errors.description && (
                  <p className="text-sm text-red-600">
                    {realCompanyForm.formState.errors.description.message}
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCompanyTypeChoice(null)}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={createRealCompanyMutation.isPending}
                >
                  {createRealCompanyMutation.isPending ? 'Creating...' : 'Create Real Company'}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Which Real Company do you want to link this Fake Company to?</Label>
                <Select value={selectedRealCompanyForFake} onValueChange={setSelectedRealCompanyForFake}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a real company" />
                  </SelectTrigger>
                  <SelectContent>
                    {realCompanies.map((company: RealCompany) => (
                      <SelectItem key={company.id} value={company.id.toString()}>
                        {company.name} - {company.industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  A fake company will be auto-generated with a random name and linked to the selected real company. 
                  Users will see the fake company name but the real company's information.
                </p>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCompanyTypeChoice(null)}
                >
                  Back
                </Button>
                <Button
                  onClick={handleCreateFakeCompany}
                  disabled={!selectedRealCompanyForFake || createFakeCompanyMutation.isPending}
                >
                  {createFakeCompanyMutation.isPending ? 'Creating...' : 'Create Fake Company'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}