import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

// Using local types instead of imports since the types are already defined in types/index.ts
type Company = {
  id: number;
  name: string;
  country?: string;
  region?: string;
  headquarters?: string;
  foundedYear?: number;
  ceo?: string;
  fleetSize?: number;
  specialization?: string;
  website?: string;
  logo?: string;
  description?: string;
};

type BrokerCompanyConnection = {
  id: number;
  brokerId: number;
  companyId: number;
  connectionType: 'buyer' | 'seller' | 'both';
  status: 'pending' | 'active' | 'inactive' | 'rejected';
  connectionDate?: string;
  lastActivityDate?: string;
  dealsCount?: number;
  totalVolume?: number;
  notes?: string;
};
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import {
  Globe,
  Building,
  Ship,
  Users,
  Plus,
  Search,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Handshake,
  ShoppingBag,
  Truck
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CompanyConnectionsProps {
  brokerId: number;
}

export function CompanyConnections({ brokerId }: CompanyConnectionsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddConnectionDialog, setShowAddConnectionDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [connectionType, setConnectionType] = useState<'buyer' | 'seller' | 'both'>('both');
  const [connectionNotes, setConnectionNotes] = useState('');
  const { toast } = useToast();

  // Query to get all companies
  const { data: companiesResponse, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['/api/companies'],
  });
  
  const companies = companiesResponse?.companies || [];

  // Query to get broker's connections
  const { data: connections = [], isLoading: isLoadingConnections } = useQuery<BrokerCompanyConnection[]>({
    queryKey: ['/api/broker-connections', brokerId],
    enabled: !!brokerId,
  });

  // Mutation for creating a new connection
  const createConnectionMutation = useMutation({
    mutationFn: async (data: {
      brokerId: number;
      companyId: number;
      connectionType: 'buyer' | 'seller' | 'both';
      notes?: string;
    }) => {
      // Simple fetch implementation instead of using apiRequest
      const response = await fetch('/api/broker-connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to establish connection');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Connection established",
        description: `You're now connected to ${selectedCompany?.name}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/broker-connections', brokerId] });
      setShowAddConnectionDialog(false);
      setSelectedCompany(null);
      setConnectionType('both');
      setConnectionNotes('');
    },
    onError: (error: any) => {
      toast({
        title: "Failed to establish connection",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Get company details for a connection
  const getCompanyForConnection = (companyId: number) => {
    return companies.find(company => company.id === companyId);
  };

  // Filter companies based on search term
  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.specialization && company.specialization.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (company.country && company.country.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle adding a new connection
  const handleAddConnection = () => {
    if (!selectedCompany) {
      toast({
        title: "Company required",
        description: "Please select a company to connect with.",
        variant: "destructive",
      });
      return;
    }

    createConnectionMutation.mutate({
      brokerId,
      companyId: selectedCompany.id,
      connectionType,
      notes: connectionNotes,
    });
  };

  // Get badge variant based on connection status
  const getConnectionStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-amber-500 text-amber-700">Pending</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="border-gray-500 text-gray-700">Inactive</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get icon based on connection type
  const getConnectionTypeIcon = (type: string) => {
    switch(type) {
      case 'buyer':
        return <ShoppingBag className="h-4 w-4 text-blue-500" />;
      case 'seller':
        return <Truck className="h-4 w-4 text-amber-500" />;
      case 'both':
        return <Handshake className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  // Get connection type label
  const getConnectionTypeLabel = (type: string) => {
    switch(type) {
      case 'buyer':
        return "Buyer";
      case 'seller':
        return "Seller";
      case 'both':
        return "Buyer & Seller";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center">
          <Building className="h-5 w-5 mr-2 text-primary" />
          Connected Companies
        </h3>
        <Button size="sm" onClick={() => setShowAddConnectionDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Connect to Company
        </Button>
      </div>

      {isLoadingConnections ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : connections.length === 0 ? (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Building className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No company connections</h3>
              <p className="text-muted-foreground max-w-md mx-auto mt-2">
                Connect with oil shipping companies to start managing deals and tracking shipments.
              </p>
              <Button className="mt-4" size="sm" onClick={() => setShowAddConnectionDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deals</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {connections.map((connection) => {
                  const company = getCompanyForConnection(connection.companyId);
                  return (
                    <TableRow key={connection.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {company?.logo ? (
                            <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0">
                              <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Building className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{company?.name || `Company #${connection.companyId}`}</div>
                            <div className="text-xs text-muted-foreground flex items-center">
                              <Globe className="h-3 w-3 mr-1" />
                              {company?.country || 'Unknown location'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getConnectionTypeIcon(connection.connectionType)}
                          <span>{getConnectionTypeLabel(connection.connectionType)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getConnectionStatusBadge(connection.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{connection.dealsCount || 0}</span>
                          {connection.dealsCount ? (
                            <span className="text-xs text-muted-foreground">
                              ({connection.totalVolume?.toLocaleString()} MT)
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        {connection.lastActivityDate 
                          ? new Date(connection.lastActivityDate).toLocaleDateString() 
                          : 'No activity'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Handshake className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Create Deal</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View Company Profile</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Connection Dialog */}
      <Dialog open={showAddConnectionDialog} onOpenChange={setShowAddConnectionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Connect to Oil Shipping Company</DialogTitle>
            <DialogDescription>
              Establish a business relationship with an oil shipping company to facilitate deals.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Companies</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by company name, specialization, or country..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="border rounded-md max-h-72 overflow-y-auto">
              {isLoadingCompanies ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : filteredCompanies.length === 0 ? (
                <div className="p-4 text-center">
                  <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">No companies found matching your search criteria.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredCompanies.map(company => (
                    <div 
                      key={company.id}
                      className={`p-3 flex justify-between items-center hover:bg-muted/50 cursor-pointer ${
                        selectedCompany?.id === company.id ? 'bg-primary/10' : ''
                      }`}
                      onClick={() => setSelectedCompany(company)}
                    >
                      <div className="flex items-center gap-3">
                        {company.logo ? (
                          <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                            <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Building className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{company.name}</div>
                          <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4">
                            {company.country && (
                              <span className="flex items-center">
                                <Globe className="h-3.5 w-3.5 mr-1" />
                                {company.country}
                              </span>
                            )}
                            {company.specialization && (
                              <span className="flex items-center">
                                <Ship className="h-3.5 w-3.5 mr-1" />
                                {company.specialization}
                              </span>
                            )}
                            {company.fleetSize && (
                              <span>{company.fleetSize} vessels</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div>
                        {selectedCompany?.id === company.id && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedCompany && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Connection Type</label>
                    <Select 
                      value={connectionType}
                      onValueChange={(value) => setConnectionType(value as 'buyer' | 'seller' | 'both')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select connection type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buyer">Buyer (Company buys from your clients)</SelectItem>
                        <SelectItem value="seller">Seller (Company sells to your clients)</SelectItem>
                        <SelectItem value="both">Both (Buying and selling relationship)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes (Optional)</label>
                    <Textarea 
                      placeholder="Add any relevant notes about this connection..."
                      className="min-h-24"
                      value={connectionNotes}
                      onChange={(e) => setConnectionNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowAddConnectionDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="sm:flex-1" 
              onClick={handleAddConnection}
              disabled={!selectedCompany || createConnectionMutation.isPending}
            >
              {createConnectionMutation.isPending ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Connecting...
                </>
              ) : (
                <>
                  <Handshake className="h-4 w-4 mr-2" />
                  Establish Connection
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}