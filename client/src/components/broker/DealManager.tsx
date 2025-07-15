import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';

// Using local types instead of imports from a separate file
type Deal = {
  id: number;
  brokerId: number;
  brokerName: string;
  sellerId: number;
  sellerName: string;
  buyerId: number;
  buyerName: string;
  vesselId?: number;
  vesselName?: string;
  cargoType: string;
  volume: number;
  volumeUnit: string;
  price: number;
  currency: string;
  status: 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
  departurePortId?: number;
  departurePortName?: string;
  destinationPortId?: number;
  destinationPortName?: string;
  estimatedDeparture?: string;
  estimatedArrival?: string;
  createdAt: string;
  lastUpdated?: string;
  commissionRate?: number;
  commissionAmount?: number;
  documents?: any[];
};

type Company = {
  id: number;
  name: string;
  country?: string;
  specialization?: string;
  fleetSize?: number;
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
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  FileText,
  Handshake,
  Ship,
  DollarSign,
  Calendar,
  Building,
  Plus,
  Search,
  ArrowRight,
  ShoppingBag,
  Truck,
  ExternalLink,
  Globe,
  Filter,
  Download,
  FileCheck,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

interface DealManagerProps {
  brokerId: number;
}

export function DealManager({ brokerId }: DealManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateDealDialog, setShowCreateDealDialog] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showDealDetailsDialog, setShowDealDetailsDialog] = useState(false);
  const { toast } = useToast();

  // Query to get all broker's deals
  const { data: deals = [], isLoading: isLoadingDeals } = useQuery<Deal[]>({
    queryKey: ['/api/broker-deals', brokerId],
    enabled: !!brokerId,
  });

  // Query to get all companies (potential buyers and sellers)
  const { data: companiesResponse, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['/api/companies'],
  });
  
  const companies = companiesResponse?.companies || [];

  // Mutation for creating a new deal
  const createDealMutation = useMutation({
    mutationFn: async (dealData: Partial<Deal>) => {
      const response = await apiRequest('POST', '/api/broker-deals', dealData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Deal created successfully",
        description: "Your new oil shipment deal has been created.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/broker-deals', brokerId] });
      setShowCreateDealDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create deal",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter deals based on search term and status filter
  const filteredDeals = deals.filter(deal => {
    const matchesSearch = 
      deal.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (deal.vesselName && deal.vesselName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      deal.cargoType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || deal.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get badge for deal status
  const getDealStatusBadge = (status: string) => {
    switch(status) {
      case 'draft':
        return <Badge variant="outline" className="border-gray-500 text-gray-700">Draft</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-amber-500 text-amber-700">Pending</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-500 text-white">Confirmed</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500 text-white">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format volume with unit
  const formatVolume = (volume: number, unit: string = 'MT') => {
    return `${volume.toLocaleString()} ${unit}`;
  };

  // Calculate total volume and value
  const totalVolume = filteredDeals.reduce((sum, deal) => sum + deal.volume, 0);
  const totalValue = filteredDeals.reduce((sum, deal) => sum + (deal.price * deal.volume), 0);
  const commissionAmount = filteredDeals.reduce((sum, deal) => {
    const rate = deal.commissionRate || 0.01; // Default to 1% if not specified
    return sum + (deal.price * deal.volume * rate);
  }, 0);

  // Handle viewing deal details
  const handleViewDeal = (deal: Deal) => {
    setSelectedDeal(deal);
    setShowDealDetailsDialog(true);
  };

  // Initial form state for creating a new deal
  const [newDeal, setNewDeal] = useState<Partial<Deal>>({
    brokerId,
    brokerName: '', // Will be filled from the server
    sellerId: 0,
    sellerName: '',
    buyerId: 0,
    buyerName: '',
    cargoType: '',
    volume: 0,
    volumeUnit: 'MT',
    price: 0,
    currency: 'USD',
    status: 'draft',
    commissionRate: 0.01, // Default 1%
  });

  // Handle form field changes
  const handleDealFieldChange = (field: string, value: any) => {
    setNewDeal(prev => ({
      ...prev,
      [field]: value
    }));

    // Set names based on selected IDs
    if (field === 'sellerId') {
      const seller = companies.find(c => c.id === value);
      if (seller) {
        setNewDeal(prev => ({
          ...prev,
          sellerName: seller.name
        }));
      }
    } else if (field === 'buyerId') {
      const buyer = companies.find(c => c.id === value);
      if (buyer) {
        setNewDeal(prev => ({
          ...prev,
          buyerName: buyer.name
        }));
      }
    }
  };

  // Handle deal creation submission
  const handleCreateDeal = () => {
    // Validate form
    if (!newDeal.sellerId || !newDeal.buyerId || !newDeal.cargoType || !newDeal.volume || !newDeal.price) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields to create a deal.",
        variant: "destructive",
      });
      return;
    }

    // Add current date
    const dealToCreate = {
      ...newDeal,
      createdAt: new Date().toISOString(),
    };

    createDealMutation.mutate(dealToCreate);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h3 className="text-lg font-medium flex items-center">
              <Handshake className="h-5 w-5 mr-2 text-primary" />
              Oil Shipment Deals
            </h3>
            <p className="text-sm text-muted-foreground">
              {isLoadingDeals ? 'Loading deals...' : `${filteredDeals.length} active deals worth ${formatCurrency(totalValue)}`}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search deals..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[130px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={() => setShowCreateDealDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Deal
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{formatVolume(totalVolume)}</div>
                <Ship className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {filteredDeals.length} active shipments
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Average: {formatCurrency(filteredDeals.length ? totalValue / filteredDeals.length : 0)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Commission</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{formatCurrency(commissionAmount)}</div>
                <Handshake className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Average rate: {(filteredDeals.reduce((sum, deal) => sum + (deal.commissionRate || 0.01), 0) / (filteredDeals.length || 1) * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Deals Table */}
        {isLoadingDeals ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredDeals.length === 0 ? (
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Handshake className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No deals found</h3>
                <p className="text-muted-foreground max-w-md mx-auto mt-2">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'No deals match your current search criteria. Try adjusting your filters.'
                    : 'Start creating new oil shipment deals by connecting buyers and sellers.'}
                </p>
                <Button className="mt-4" onClick={() => setShowCreateDealDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Deal
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
                    <TableHead>Details</TableHead>
                    <TableHead>From/To</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeals.map((deal) => (
                    <TableRow key={deal.id}>
                      <TableCell>
                        <div className="font-medium text-primary">Deal #{deal.id}</div>
                        <div className="text-xs text-muted-foreground flex items-center mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(deal.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center text-sm">
                            <Truck className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                            <span className="font-medium">{deal.sellerName}</span>
                          </div>
                          <div className="flex items-center">
                            <ArrowRight className="h-3 w-3 mx-1 text-muted-foreground" />
                          </div>
                          <div className="flex items-center text-sm">
                            <ShoppingBag className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                            <span className="font-medium">{deal.buyerName}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{deal.cargoType}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatVolume(deal.volume, deal.volumeUnit)}
                        </div>
                        {deal.vesselName && (
                          <div className="text-xs flex items-center mt-1">
                            <Ship className="h-3 w-3 mr-1 text-muted-foreground" />
                            {deal.vesselName}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(deal.price * deal.volume, deal.currency)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(deal.price, deal.currency)} per {deal.volumeUnit}
                        </div>
                        {deal.commissionRate && (
                          <div className="text-xs text-green-600 font-medium mt-1">
                            Commission: {formatCurrency(deal.price * deal.volume * deal.commissionRate, deal.currency)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {getDealStatusBadge(deal.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleViewDeal(deal)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View Details</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Documents</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between py-4">
              <div className="text-sm text-muted-foreground">
                Showing {filteredDeals.length} of {deals.length} deals
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Deals
              </Button>
            </CardFooter>
          </Card>
        )}

      {/* Create Deal Dialog */}
      <Dialog open={showCreateDealDialog} onOpenChange={setShowCreateDealDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Oil Shipment Deal</DialogTitle>
            <DialogDescription>
              Set up a new deal between a seller and buyer for oil cargo shipment.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-2">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Seller Company</label>
                <Select 
                  value={newDeal.sellerId ? String(newDeal.sellerId) : ''}
                  onValueChange={(value) => handleDealFieldChange('sellerId', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a seller" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(company => (
                      <SelectItem key={`seller-${company.id}`} value={String(company.id)}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Buyer Company</label>
                <Select 
                  value={newDeal.buyerId ? String(newDeal.buyerId) : ''}
                  onValueChange={(value) => handleDealFieldChange('buyerId', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a buyer" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(company => (
                      <SelectItem key={`buyer-${company.id}`} value={String(company.id)}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Cargo Type</label>
                <Select 
                  value={newDeal.cargoType || ''}
                  onValueChange={(value) => handleDealFieldChange('cargoType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cargo type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Crude Oil">Crude Oil</SelectItem>
                    <SelectItem value="Gasoline">Gasoline</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Jet Fuel">Jet Fuel</SelectItem>
                    <SelectItem value="LNG">LNG (Liquefied Natural Gas)</SelectItem>
                    <SelectItem value="Fuel Oil">Fuel Oil</SelectItem>
                    <SelectItem value="Petroleum Products">Petroleum Products</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Vessel (Optional)</label>
                <Input 
                  placeholder="Vessel name"
                  value={newDeal.vesselName || ''}
                  onChange={(e) => handleDealFieldChange('vesselName', e.target.value)}
                />
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Volume</label>
                  <Input 
                    type="number"
                    placeholder="Volume amount"
                    value={newDeal.volume || ''}
                    onChange={(e) => handleDealFieldChange('volume', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Unit</label>
                  <Select 
                    value={newDeal.volumeUnit || 'MT'}
                    onValueChange={(value) => handleDealFieldChange('volumeUnit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MT">MT (Metric Tons)</SelectItem>
                      <SelectItem value="BBL">BBL (Barrels)</SelectItem>
                      <SelectItem value="KL">KL (Kiloliters)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price (Per Unit)</label>
                  <Input 
                    type="number"
                    placeholder="Price per unit"
                    value={newDeal.price || ''}
                    onChange={(e) => handleDealFieldChange('price', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Currency</label>
                  <Select 
                    value={newDeal.currency || 'USD'}
                    onValueChange={(value) => handleDealFieldChange('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Commission Rate (%)</label>
                <Select 
                  value={String(newDeal.commissionRate ? newDeal.commissionRate * 100 : 1)}
                  onValueChange={(value) => handleDealFieldChange('commissionRate', parseInt(value) / 100)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select commission rate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0.5%</SelectItem>
                    <SelectItem value="1">1.0%</SelectItem>
                    <SelectItem value="1.5">1.5%</SelectItem>
                    <SelectItem value="2">2.0%</SelectItem>
                    <SelectItem value="2.5">2.5%</SelectItem>
                    <SelectItem value="3">3.0%</SelectItem>
                    <SelectItem value="4">4.0%</SelectItem>
                    <SelectItem value="5">5.0%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Deal Status</label>
                <Select 
                  value={newDeal.status || 'draft'}
                  onValueChange={(value) => handleDealFieldChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Deal Summary */}
          {newDeal.sellerId && newDeal.buyerId && newDeal.volume && newDeal.price && (
            <Card className="mt-2 bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Deal Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seller:</span>
                    <span className="font-medium">{newDeal.sellerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Buyer:</span>
                    <span className="font-medium">{newDeal.buyerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cargo:</span>
                    <span className="font-medium">{newDeal.cargoType || 'Not selected'} ({formatVolume(newDeal.volume || 0, newDeal.volumeUnit)})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Value:</span>
                    <span className="font-medium">{formatCurrency((newDeal.price || 0) * (newDeal.volume || 0), newDeal.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Your Commission:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency((newDeal.price || 0) * (newDeal.volume || 0) * (newDeal.commissionRate || 0.01), newDeal.currency)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowCreateDealDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="sm:flex-1" 
              onClick={handleCreateDeal}
              disabled={createDealMutation.isPending}
            >
              {createDealMutation.isPending ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Creating Deal...
                </>
              ) : (
                <>
                  <Handshake className="h-4 w-4 mr-2" />
                  Create Deal
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deal Details Dialog */}
      {selectedDeal && (
        <Dialog open={showDealDetailsDialog} onOpenChange={setShowDealDetailsDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl">Deal #{selectedDeal.id} Details</DialogTitle>
                {getDealStatusBadge(selectedDeal.status)}
              </div>
              <DialogDescription>
                Created on {new Date(selectedDeal.createdAt).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 my-4">
              {/* Deal Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Transaction Parties</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Seller</div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <Truck className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <div className="font-medium">{selectedDeal.sellerName}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Buyer</div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <ShoppingBag className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{selectedDeal.buyerName}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Broker</div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <Handshake className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium">{selectedDeal.brokerName}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Shipment Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cargo Type:</span>
                        <span className="font-medium">{selectedDeal.cargoType}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Volume:</span>
                        <span className="font-medium">{formatVolume(selectedDeal.volume, selectedDeal.volumeUnit)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Price/Unit:</span>
                        <span className="font-medium">{formatCurrency(selectedDeal.price, selectedDeal.currency)} per {selectedDeal.volumeUnit}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Value:</span>
                        <span className="font-medium">{formatCurrency(selectedDeal.price * selectedDeal.volume, selectedDeal.currency)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Commission Rate:</span>
                        <span className="font-medium">{((selectedDeal.commissionRate || 0.01) * 100).toFixed(1)}%</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Commission Amount:</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(selectedDeal.price * selectedDeal.volume * (selectedDeal.commissionRate || 0.01), selectedDeal.currency)}
                        </span>
                      </div>
                      
                      {/* Vessel information if available */}
                      {selectedDeal.vesselName && (
                        <>
                          <div className="border-t my-2"></div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Vessel:</span>
                            <span className="font-medium">{selectedDeal.vesselName}</span>
                          </div>
                        </>
                      )}
                      
                      {/* Ports information if available */}
                      {(selectedDeal.departurePortName || selectedDeal.destinationPortName) && (
                        <>
                          {!selectedDeal.vesselName && <div className="border-t my-2"></div>}
                          
                          {selectedDeal.departurePortName && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Departure:</span>
                              <span className="font-medium">{selectedDeal.departurePortName}</span>
                            </div>
                          )}
                          
                          {selectedDeal.destinationPortName && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Destination:</span>
                              <span className="font-medium">{selectedDeal.destinationPortName}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Documents Section */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Deal Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDeal.documents && selectedDeal.documents.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDeal.documents.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                          <div className="flex items-center gap-2">
                            <FileCheck className="h-4 w-4 text-primary" />
                            <div>
                              <div className="font-medium">{doc.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {doc.type} • {(doc.size / 1024).toFixed(1)} KB • {new Date(doc.uploadDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-3.5 w-3.5 mr-1.5" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <FileText className="h-10 w-10 mx-auto text-muted-foreground" />
                      <h3 className="mt-4 text-base font-medium">No documents available</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        There are no documents attached to this deal yet.
                      </p>
                      <Button variant="outline" size="sm" className="mt-4">
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Add Document
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Deal Status Timeline */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Deal Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <div className="font-medium">Deal Created</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(selectedDeal.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    {selectedDeal.status === 'draft' && (
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <HelpCircle className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <div className="font-medium">Draft Stage</div>
                          <div className="text-xs text-muted-foreground">
                            Deal is in draft stage awaiting finalization
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedDeal.status === 'pending' && (
                      <>
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                          <div>
                            <div className="font-medium">Deal Finalized</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(selectedDeal.lastUpdated || selectedDeal.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                          </div>
                          <div>
                            <div className="font-medium">Awaiting Confirmation</div>
                            <div className="text-xs text-muted-foreground">
                              Deal is pending confirmation from both parties
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {selectedDeal.status === 'confirmed' && (
                      <>
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                          <div>
                            <div className="font-medium">Deal Finalized</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(selectedDeal.lastUpdated || selectedDeal.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                          <div>
                            <div className="font-medium">Deal Confirmed</div>
                            <div className="text-xs text-muted-foreground">
                              All parties have confirmed the deal
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {selectedDeal.status === 'completed' && (
                      <>
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                          <div>
                            <div className="font-medium">Deal Finalized & Confirmed</div>
                            <div className="text-xs text-muted-foreground">
                              All parties confirmed the agreement
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                          <div>
                            <div className="font-medium">Shipment Completed</div>
                            <div className="text-xs text-muted-foreground">
                              Cargo successfully delivered
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {selectedDeal.status === 'cancelled' && (
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <XCircle className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                          <div className="font-medium">Deal Cancelled</div>
                          <div className="text-xs text-muted-foreground">
                            {selectedDeal.lastUpdated ? new Date(selectedDeal.lastUpdated).toLocaleString() : 'Date not available'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <DialogFooter className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setShowDealDetailsDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}