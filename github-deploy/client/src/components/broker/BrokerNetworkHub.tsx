import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, Star, TrendingUp, Shield, Globe, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type BrokerCompany = {
  id: number;
  name: string;
  country?: string;
  region?: string;
  headquarters?: string;
  ceo?: string;
  specialization?: string;
  description?: string;
  employees?: number;
  connectionFee?: number;
  commissionRate?: number;
  minimumDealSize?: number;
  verificationStatus?: string;
  rating?: number;
  totalDeals?: number;
  status?: string;
};

type CompanyPartnership = {
  id: number;
  brokerCompanyId: number;
  realCompanyId: number;
  partnershipType?: string;
  dealAccess?: string;
  creditLimit?: number;
  status?: string;
};

type UserConnection = {
  id: number;
  userId: number;
  brokerCompanyId: number;
  connectionStatus: string;
  contractTerms?: string;
  creditAllocation?: number;
  dealCount?: number;
  totalVolume?: number;
};

// Mock data for demonstration - will be replaced with API calls
const mockBrokerCompanies: BrokerCompany[] = [
  {
    id: 1,
    name: "PetroLink Trading",
    country: "UAE",
    region: "Middle East",
    headquarters: "Dubai",
    ceo: "Ahmed Al-Mansouri",
    specialization: "Crude Oil",
    description: "Leading crude oil brokerage firm specializing in Middle Eastern crude exports with direct partnerships with Shell, Total, and BP.",
    employees: 45,
    connectionFee: 5000,
    commissionRate: 0.25,
    minimumDealSize: 1000000,
    verificationStatus: "verified",
    rating: 4.8,
    totalDeals: 127,
    status: "active"
  },
  {
    id: 2,
    name: "Global Energy Partners",
    country: "Singapore",
    region: "Asia-Pacific",
    headquarters: "Singapore",
    ceo: "Sarah Chen",
    specialization: "Refined Products",
    description: "Premier refined products trading house with exclusive access to ExxonMobil, Chevron, and CNOOC supply chains.",
    employees: 78,
    connectionFee: 7500,
    commissionRate: 0.35,
    minimumDealSize: 2000000,
    verificationStatus: "verified",
    rating: 4.6,
    totalDeals: 89,
    status: "active"
  },
  {
    id: 3,
    name: "Atlantic Oil Brokers",
    country: "UK",
    region: "Europe",
    headquarters: "London",
    ceo: "James Morrison",
    specialization: "LNG",
    description: "Specialized LNG brokerage with strategic partnerships with Qatar Petroleum, Shell LNG, and TotalEnergies Gas.",
    employees: 32,
    connectionFee: 10000,
    commissionRate: 0.45,
    minimumDealSize: 5000000,
    verificationStatus: "verified",
    rating: 4.9,
    totalDeals: 56,
    status: "active"
  },
  {
    id: 4,
    name: "American Energy Hub",
    country: "USA",
    region: "North America",
    headquarters: "Houston",
    ceo: "Michael Rodriguez",
    specialization: "Petrochemicals",
    description: "Leading petrochemicals broker connected to Dow Chemical, BASF, and LyondellBasell distribution networks.",
    employees: 62,
    connectionFee: 6000,
    commissionRate: 0.30,
    minimumDealSize: 1500000,
    verificationStatus: "verified",
    rating: 4.7,
    totalDeals: 93,
    status: "active"
  }
];

const mockPartnerships: CompanyPartnership[] = [
  { id: 1, brokerCompanyId: 1, realCompanyId: 1, partnershipType: "exclusive", dealAccess: "crude_oil", creditLimit: 50000000, status: "active" },
  { id: 2, brokerCompanyId: 1, realCompanyId: 5, partnershipType: "preferred", dealAccess: "crude_oil", creditLimit: 30000000, status: "active" },
  { id: 3, brokerCompanyId: 2, realCompanyId: 2, partnershipType: "standard", dealAccess: "refined_products", creditLimit: 25000000, status: "active" },
  { id: 4, brokerCompanyId: 3, realCompanyId: 12, partnershipType: "exclusive", dealAccess: "lng", creditLimit: 75000000, status: "active" },
];

export function BrokerNetworkHub() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("All");
  const [userConnections, setUserConnections] = useState<UserConnection[]>([]);

  // Connect to broker company
  const connectMutation = useMutation({
    mutationFn: async (brokerCompanyId: number) => {
      // Simulate API call
      return new Promise((resolve) => {
        setTimeout(() => {
          const newConnection: UserConnection = {
            id: Date.now(),
            userId: 1,
            brokerCompanyId,
            connectionStatus: 'pending',
            contractTerms: 'Standard brokerage terms',
            creditAllocation: 0,
            dealCount: 0,
            totalVolume: 0
          };
          setUserConnections(prev => [...prev, newConnection]);
          resolve(newConnection);
        }, 1000);
      });
    },
    onSuccess: () => {
      toast({
        title: "Connection Request Sent",
        description: "Your connection request has been submitted for review.",
      });
    },
    onError: () => {
      toast({
        title: "Connection Failed",
        description: "Failed to send connection request. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter broker companies
  const filteredBrokers = mockBrokerCompanies.filter((broker) => {
    const matchesSearch = broker.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         broker.country?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = selectedSpecialization === "All" || 
                                 broker.specialization === selectedSpecialization;
    return matchesSearch && matchesSpecialization;
  });

  // Get connection status for a broker
  const getConnectionStatus = (brokerId: number) => {
    return userConnections.find(conn => conn.brokerCompanyId === brokerId);
  };

  // Get partnerships for a broker
  const getBrokerPartnerships = (brokerId: number) => {
    return mockPartnerships.filter(p => p.brokerCompanyId === brokerId);
  };

  const specializations = ["All", "Crude Oil", "Refined Products", "LNG", "Petrochemicals", "Marine Services"];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'suspended': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Building2 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRatingStars = (rating?: number) => {
    if (!rating) return "No rating";
    return "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
  };

  const getCompanyName = (companyId: number) => {
    const companies = [
      "Shell International", "ExxonMobil", "BP Trading", "Chevron Corp", "TotalEnergies",
      "ConocoPhillips", "Eni S.p.A", "Equinor ASA", "Petrobras", "Saudi Aramco",
      "Kuwait Petroleum", "ADNOC", "Qatar Petroleum", "Lukoil", "Gazprom Neft"
    ];
    return companies[companyId - 1] || `Company ${companyId}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Professional Broker Network</h1>
        <p className="text-blue-100">
          Connect with verified oil trading intermediaries and access exclusive partnerships with major corporations
        </p>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Available Brokers</TabsTrigger>
          <TabsTrigger value="connections">My Connections</TabsTrigger>
          <TabsTrigger value="partnerships">Corporate Partnerships</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Search brokers by name or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:w-1/3"
            />
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBrokers.map((broker) => {
              const connection = getConnectionStatus(broker.id);
              const brokerPartnerships = getBrokerPartnerships(broker.id);
              
              return (
                <Card key={broker.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          {broker.name}
                        </CardTitle>
                        <CardDescription>{broker.headquarters}, {broker.country}</CardDescription>
                      </div>
                      <Badge variant={broker.verificationStatus === 'verified' ? 'default' : 'secondary'}>
                        <Shield className="h-3 w-3 mr-1" />
                        {broker.verificationStatus}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-gray-600">
                      {broker.description?.substring(0, 120)}...
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span>{getRatingStars(broker.rating)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span>{broker.totalDeals} deals</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Specialization:</span>
                        <span className="font-medium">{broker.specialization}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Commission Rate:</span>
                        <span className="font-medium">{broker.commissionRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Min Deal Size:</span>
                        <span className="font-medium">${broker.minimumDealSize?.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="text-xs text-gray-500 mb-2">Connected to {brokerPartnerships.length} major oil companies</div>
                      <div className="flex flex-wrap gap-1">
                        {brokerPartnerships.slice(0, 3).map((partnership) => (
                          <Badge key={partnership.id} variant="outline" className="text-xs">
                            {getCompanyName(partnership.realCompanyId)}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4">
                      {connection ? (
                        <div className="flex items-center gap-2">
                          {getStatusIcon(connection.connectionStatus)}
                          <span className="text-sm font-medium capitalize">
                            {connection.connectionStatus}
                          </span>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => connectMutation.mutate(broker.id)}
                          disabled={connectMutation.isPending}
                          className="w-full"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Broker Connections</CardTitle>
              <CardDescription>Manage your active and pending broker relationships</CardDescription>
            </CardHeader>
            <CardContent>
              {userConnections.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No broker connections yet. Connect with brokers to start trading.
                </div>
              ) : (
                <div className="space-y-4">
                  {userConnections.map((connection) => {
                    const broker = mockBrokerCompanies.find(b => b.id === connection.brokerCompanyId);
                    if (!broker) return null;
                    
                    return (
                      <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{broker.name}</h3>
                          <p className="text-sm text-gray-500">{broker.country}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span>Deals: {connection.dealCount}</span>
                            <span>Volume: ${connection.totalVolume?.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(connection.connectionStatus)}
                          <Badge variant={connection.connectionStatus === 'active' ? 'default' : 'secondary'}>
                            {connection.connectionStatus}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partnerships" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Broker-Corporate Partnerships</CardTitle>
              <CardDescription>View partnerships between broker companies and major oil corporations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPartnerships.map((partnership) => (
                  <div key={partnership.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {mockBrokerCompanies.find(b => b.id === partnership.brokerCompanyId)?.name}
                          <span className="text-gray-400">↔</span>
                          {getCompanyName(partnership.realCompanyId)}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <Badge variant="outline">{partnership.partnershipType}</Badge>
                          <span>Access: {partnership.dealAccess?.replace('_', ' ')}</span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            Credit: ${partnership.creditLimit?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <Badge variant={partnership.status === 'active' ? 'default' : 'secondary'}>
                        {partnership.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}