import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Building2, 
  Plus, 
  Search, 
  DollarSign, 
  TrendingUp, 
  Eye,
  Edit,
  FileText,
  Ship,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe
} from 'lucide-react';

interface Broker {
  id: number;
  name: string;
  company: string;
  email: string;
  phone?: string;
  country?: string;
  specialization: string[];
  active: boolean;
  eliteMember?: boolean;
  totalDeals: number;
  totalValue: number;
  rating: number;
  joinedDate: string;
}

interface Company {
  id: number;
  name: string;
  type: 'Oil Producer' | 'Shipping Company' | 'Refinery' | 'Trading House';
  country: string;
  established: number;
  website?: string;
  contactEmail: string;
  specialties: string[];
  activeContracts: number;
  totalVolume: number;
  verified: boolean;
}

interface Deal {
  id: number;
  brokerId: number;
  brokerName: string;
  buyerCompany: string;
  sellerCompany: string;
  commodity: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalValue: number;
  status: 'Active' | 'Pending' | 'Completed' | 'Cancelled';
  loadingPort: string;
  dischargePort: string;
  vesselName?: string;
  deliveryDate: string;
  createdDate: string;
  commission: number;
}

export default function BrokerManagement() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null);
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [showBrokerDetails, setShowBrokerDetails] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch brokers
  const { data: brokers = [], isLoading: loadingBrokers } = useQuery<Broker[]>({
    queryKey: ['/api/brokers'],
  });

  // Fetch companies
  const { data: companies = [], isLoading: loadingCompanies } = useQuery<Company[]>({
    queryKey: ['/api/companies'],
  });

  // Fetch deals
  const { data: deals = [], isLoading: loadingDeals } = useQuery<Deal[]>({
    queryKey: ['/api/broker-deals'],
  });

  // Add deal mutation
  const addDealMutation = useMutation({
    mutationFn: async (dealData: Partial<Deal>) => {
      const response = await fetch('/api/broker-deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dealData),
      });
      if (!response.ok) throw new Error('Failed to add deal');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/broker-deals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/brokers'] });
      toast({ title: "Deal added successfully" });
      setShowAddDeal(false);
    },
    onError: () => {
      toast({ title: "Failed to add deal", variant: "destructive" });
    },
  });

  const filteredBrokers = (brokers || []).filter(broker =>
    broker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    broker.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    broker.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBrokers = (brokers || []).length;
  const activeBrokers = (brokers || []).filter(b => b.active).length;
  const totalDeals = (deals || []).length;
  const totalValue = (deals || []).reduce((sum, deal) => sum + deal.totalValue, 0);

  const AddDealForm = () => {
    const [formData, setFormData] = useState({
      brokerId: selectedBroker?.id || 0,
      brokerName: selectedBroker?.name || '',
      buyerCompany: '',
      sellerCompany: '',
      commodity: '',
      quantity: 0,
      unit: 'MT',
      pricePerUnit: 0,
      loadingPort: '',
      dischargePort: '',
      vesselName: '',
      deliveryDate: '',
      commission: 2.5
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const totalValue = formData.quantity * formData.pricePerUnit;
      
      addDealMutation.mutate({
        ...formData,
        totalValue,
        status: 'Pending' as const,
        createdDate: new Date().toISOString().split('T')[0],
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Broker</Label>
            <Input value={formData.brokerName} disabled className="bg-muted" />
          </div>
          <div>
            <Label>Commission (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={formData.commission}
              onChange={(e) => setFormData({ ...formData, commission: parseFloat(e.target.value) })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Buyer Company</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, buyerCompany: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select buyer" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.name}>
                    {company.name} ({company.country})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Seller Company</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, sellerCompany: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select seller" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.name}>
                    {company.name} ({company.country})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Commodity</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, commodity: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select commodity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Crude Oil">Crude Oil</SelectItem>
                <SelectItem value="Gasoline">Gasoline</SelectItem>
                <SelectItem value="Diesel">Diesel</SelectItem>
                <SelectItem value="Jet Fuel">Jet Fuel</SelectItem>
                <SelectItem value="LNG">LNG</SelectItem>
                <SelectItem value="LPG">LPG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Quantity</Label>
            <Input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <Label>Unit</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, unit: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MT">Metric Tons</SelectItem>
                <SelectItem value="BBL">Barrels</SelectItem>
                <SelectItem value="CBM">Cubic Meters</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Price per Unit (USD)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.pricePerUnit}
              onChange={(e) => setFormData({ ...formData, pricePerUnit: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <Label>Total Value</Label>
            <Input
              value={`$${(formData.quantity * formData.pricePerUnit).toLocaleString()}`}
              disabled
              className="bg-muted font-bold"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Loading Port</Label>
            <Input
              value={formData.loadingPort}
              onChange={(e) => setFormData({ ...formData, loadingPort: e.target.value })}
              placeholder="e.g., Ras Tanura"
            />
          </div>
          <div>
            <Label>Discharge Port</Label>
            <Input
              value={formData.dischargePort}
              onChange={(e) => setFormData({ ...formData, dischargePort: e.target.value })}
              placeholder="e.g., Rotterdam"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Vessel Name (Optional)</Label>
            <Input
              value={formData.vesselName}
              onChange={(e) => setFormData({ ...formData, vesselName: e.target.value })}
              placeholder="e.g., MT Stellar Dawn"
            />
          </div>
          <div>
            <Label>Delivery Date</Label>
            <Input
              type="date"
              value={formData.deliveryDate}
              onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => setShowAddDeal(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={addDealMutation.isPending}>
            {addDealMutation.isPending ? 'Adding...' : 'Add Deal'}
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Users className="h-8 w-8 mr-3 text-primary" />
              Broker Management Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage brokers, companies, and oil trading deals
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Brokers</p>
                  <p className="text-2xl font-bold">{totalBrokers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Brokers</p>
                  <p className="text-2xl font-bold">{activeBrokers}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Deals</p>
                  <p className="text-2xl font-bold">{totalDeals}</p>
                </div>
                <FileText className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">${(totalValue / 1000000).toFixed(1)}M</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="brokers">Brokers</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="deals">Deals</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Brokers */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Brokers</CardTitle>
                  <CardDescription>Ranked by total deal value</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(brokers || [])
                      .sort((a, b) => b.totalValue - a.totalValue)
                      .slice(0, 5)
                      .map((broker) => (
                        <div key={broker.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{broker.name}</p>
                            <p className="text-sm text-muted-foreground">{broker.company}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={broker.eliteMember ? "default" : "secondary"}>
                                {broker.eliteMember ? "Elite" : "Standard"}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                ⭐ {broker.rating}/5
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${(broker.totalValue / 1000000).toFixed(1)}M</p>
                            <p className="text-sm text-muted-foreground">{broker.totalDeals} deals</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Deals */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Deals</CardTitle>
                  <CardDescription>Latest broker transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(deals || [])
                      .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
                      .slice(0, 5)
                      .map((deal) => (
                        <div key={deal.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{deal.brokerName}</p>
                            <p className="text-sm text-muted-foreground">
                              {deal.commodity} - {deal.quantity.toLocaleString()} {deal.unit}
                            </p>
                            <Badge 
                              variant={
                                deal.status === 'Active' ? 'default' :
                                deal.status === 'Completed' ? 'secondary' :
                                deal.status === 'Pending' ? 'outline' : 'destructive'
                              }
                              className="mt-1"
                            >
                              {deal.status}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${(deal.totalValue / 1000000).toFixed(1)}M</p>
                            <p className="text-sm text-muted-foreground">
                              ${(deal.commission * deal.totalValue / 100).toLocaleString()} comm.
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Brokers Tab */}
          <TabsContent value="brokers" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search brokers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBrokers.map((broker) => (
                <Card key={broker.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{broker.name}</h3>
                        <p className="text-muted-foreground">{broker.company}</p>
                        <p className="text-sm text-muted-foreground flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {broker.country}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge variant={broker.active ? "default" : "secondary"}>
                          {broker.active ? "Active" : "Inactive"}
                        </Badge>
                        {broker.eliteMember && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            Elite
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Deals:</span>
                        <span className="font-medium">{broker.totalDeals}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Value:</span>
                        <span className="font-medium">${(broker.totalValue / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Rating:</span>
                        <span className="font-medium">⭐ {broker.rating}/5</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedBroker(broker);
                          setShowBrokerDetails(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedBroker(broker);
                          setShowAddDeal(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Deal
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Companies Tab */}
          <TabsContent value="companies" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => (
                <Card key={company.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{company.name}</h3>
                        <p className="text-muted-foreground">{company.type}</p>
                        <p className="text-sm text-muted-foreground flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {company.country}
                        </p>
                      </div>
                      <Badge variant={company.verified ? "default" : "outline"}>
                        {company.verified ? "Verified" : "Pending"}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Established:</span>
                        <span className="font-medium">{company.established}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Active Contracts:</span>
                        <span className="font-medium">{company.activeContracts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Volume:</span>
                        <span className="font-medium">{(company.totalVolume / 1000).toFixed(0)}K MT</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {(company.specialties || []).slice(0, 2).map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {(company.specialties || []).length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{(company.specialties || []).length - 2}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 mr-2" />
                        {company.contactEmail}
                      </div>
                      {company.website && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Globe className="h-4 w-4 mr-2" />
                          {company.website}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Deals Tab */}
          <TabsContent value="deals" className="space-y-6">
            <div className="grid gap-6">
              {(deals || []).map((deal) => (
                <Card key={deal.id}>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      <div>
                        <h3 className="font-bold text-lg">{deal.brokerName}</h3>
                        <p className="text-muted-foreground">{deal.commodity}</p>
                        <Badge 
                          variant={
                            deal.status === 'Active' ? 'default' :
                            deal.status === 'Completed' ? 'secondary' :
                            deal.status === 'Pending' ? 'outline' : 'destructive'
                          }
                          className="mt-2"
                        >
                          {deal.status}
                        </Badge>
                      </div>

                      <div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Buyer</p>
                          <p className="font-medium">{deal.buyerCompany}</p>
                          <p className="text-sm text-muted-foreground">Seller</p>
                          <p className="font-medium">{deal.sellerCompany}</p>
                        </div>
                      </div>

                      <div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Quantity</p>
                          <p className="font-medium">{deal.quantity.toLocaleString()} {deal.unit}</p>
                          <p className="text-sm text-muted-foreground">Route</p>
                          <p className="font-medium text-sm">{deal.loadingPort} → {deal.dischargePort}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold">${(deal.totalValue / 1000000).toFixed(1)}M</p>
                        <p className="text-sm text-muted-foreground">
                          ${(deal.commission * deal.totalValue / 100).toLocaleString()} commission
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          {deal.deliveryDate}
                        </p>
                        {deal.vesselName && (
                          <p className="text-sm text-muted-foreground">
                            <Ship className="h-4 w-4 inline mr-1" />
                            {deal.vesselName}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Deal Dialog */}
        <Dialog open={showAddDeal} onOpenChange={setShowAddDeal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Deal</DialogTitle>
              <DialogDescription>
                Create a new oil trading deal for {selectedBroker?.name}
              </DialogDescription>
            </DialogHeader>
            <AddDealForm />
          </DialogContent>
        </Dialog>

        {/* Broker Details Dialog */}
        <Dialog open={showBrokerDetails} onOpenChange={setShowBrokerDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Broker Details</DialogTitle>
            </DialogHeader>
            {selectedBroker && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <p className="font-medium">{selectedBroker.name}</p>
                  </div>
                  <div>
                    <Label>Company</Label>
                    <p className="font-medium">{selectedBroker.company}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="font-medium">{selectedBroker.email}</p>
                  </div>
                  <div>
                    <Label>Country</Label>
                    <p className="font-medium">{selectedBroker.country}</p>
                  </div>
                </div>

                <div>
                  <Label>Specializations</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedBroker.specialization.map((spec) => (
                      <Badge key={spec} variant="secondary">{spec}</Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">{selectedBroker.totalDeals}</p>
                    <p className="text-sm text-muted-foreground">Total Deals</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">${(selectedBroker.totalValue / 1000000).toFixed(1)}M</p>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">⭐ {selectedBroker.rating}</p>
                    <p className="text-sm text-muted-foreground">Rating</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}