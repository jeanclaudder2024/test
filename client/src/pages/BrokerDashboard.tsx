import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// Using local types since the imports aren't working correctly
type Broker = {
  id: number;
  name: string;
  company: string;
  email: string;
  phone?: string;
  country?: string;
  active: boolean;
  eliteMember?: boolean;
  eliteMemberSince?: string;
  eliteMemberExpires?: string;
  membershipId?: string;
  shippingAddress?: string;
  subscriptionPlan?: string;
  lastLogin?: string;
  specialization?: string[];
  activeDeals?: number;
  totalDealsValue?: number;
  performanceRating?: number;
};

type Company = {
  id: number;
  name: string;
  country?: string;
  region?: string;
  headquarters?: string;
  specialization?: string;
  fleetSize?: number;
  logo?: string;
  foundedYear?: number;
};

type Deal = {
  id: number;
  brokerId: number;
  brokerName: string;
  sellerId: number;
  sellerName: string;
  buyerId: number;
  buyerName: string;
  vesselName?: string;
  cargoType: string;
  volume: number;
  volumeUnit: string;
  price: number;
  currency: string;
  status: string;
  createdAt: string;
  commissionRate?: number;
};

type BrokerCompanyConnection = {
  id: number;
  brokerId: number;
  companyId: number;
  connectionType: string;
  status: string;
};
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Users,
  Building,
  Ship,
  Handshake,
  Globe,
  BarChart3,
  DollarSign,
  Briefcase,
  Calendar,
  Star,
  Shield,
  ShieldCheck,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { CompanyProfile } from '@/components/broker/CompanyProfile';
import { CompanyConnections } from '@/components/broker/CompanyConnections';
import { DealManager } from '@/components/broker/DealManager';

export default function BrokerDashboard() {
  // State
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [showCompanyProfileDialog, setShowCompanyProfileDialog] = useState(false);

  // Get broker's data (in a real app, this would be the logged-in broker)
  const { data: broker, isLoading: isLoadingBroker } = useQuery<Broker>({
    queryKey: ['/api/broker/profile'],
  });

  // Get key statistics
  const { data: stats = { activeConnections: 0, pendingDeals: 0, completedDeals: 0, totalRevenue: 0 }, isLoading: isLoadingStats } = useQuery<{
    activeConnections: number;
    pendingDeals: number;
    completedDeals: number;
    totalRevenue: number;
  }>({
    queryKey: ['/api/broker/stats'],
  });

  // Get recommended companies
  const { data: recommendedCompanies = [], isLoading: isLoadingCompanies } = useQuery<Company[]>({
    queryKey: ['/api/companies/recommended'],
  });

  // Get recent deals
  const { data: recentDeals = [], isLoading: isLoadingDeals } = useQuery<Deal[]>({
    queryKey: ['/api/broker-deals/recent'],
  });

  // Get activity feed
  const [activityFeed, setActivityFeed] = useState<{
    type: string;
    title: string;
    description: string;
    time: string;
    icon: React.ReactNode;
  }[]>([]);

  // Simulate activity feed data
  useEffect(() => {
    if (recentDeals.length > 0) {
      const newFeed = [
        ...recentDeals.slice(0, 3).map(deal => ({
          type: 'deal',
          title: `New deal created`,
          description: `${deal.cargoType} shipment between ${deal.sellerName} and ${deal.buyerName}`,
          time: new Date(deal.createdAt).toLocaleDateString(),
          icon: <Handshake className="h-5 w-5 text-primary" />
        })),
        {
          type: 'connection',
          title: 'New company connection',
          description: 'Saudi Aramco has accepted your connection request',
          time: '2 days ago',
          icon: <Building className="h-5 w-5 text-blue-500" />
        },
        {
          type: 'market',
          title: 'Market update',
          description: 'Crude oil prices increased by 2.3% today',
          time: '3 days ago',
          icon: <BarChart3 className="h-5 w-5 text-amber-500" />
        },
        {
          type: 'system',
          title: 'Elite membership activated',
          description: 'Your elite broker membership is now active',
          time: '1 week ago',
          icon: <Star className="h-5 w-5 text-yellow-500" />
        }
      ];
      setActivityFeed(newFeed);
    }
  }, [recentDeals]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // View company profile
  const handleViewCompanyProfile = (companyId: number) => {
    setSelectedCompanyId(companyId);
    setShowCompanyProfileDialog(true);
  };

  // Broker ID to use for connections and deals
  const brokerId = broker?.id || 1; // Fallback for demo

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Briefcase className="h-8 w-8 mr-3 text-primary" />
            Broker Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your oil shipping deals, company connections, and monitor performance
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className="bg-primary px-3 py-1 flex items-center">
            <Shield className="h-3.5 w-3.5 mr-1" />
            Elite Broker
          </Badge>
          <Button size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-4xl mb-6">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="connections">
            <Building className="h-4 w-4 mr-2" />
            Companies
          </TabsTrigger>
          <TabsTrigger value="deals">
            <Handshake className="h-4 w-4 mr-2" />
            Deals
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <Globe className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab Content */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{stats.activeConnections}</div>
                  <Building className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Companies you're connected with
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Deals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{stats.pendingDeals}</div>
                  <Handshake className="h-5 w-5 text-amber-500" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Deals awaiting confirmation
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completed Deals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{stats.completedDeals}</div>
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Successfully completed shipments
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Your commission earnings
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Deals & Activity Feed */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Recent Deals (takes 2/3 of space) */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Recent Deals</CardTitle>
                  <CardDescription>Your latest oil shipping transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingDeals ? (
                    <div className="flex justify-center items-center h-48">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : recentDeals.length === 0 ? (
                    <div className="text-center py-8">
                      <Handshake className="h-12 w-12 mx-auto text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">No recent deals</h3>
                      <p className="text-muted-foreground max-w-md mx-auto mt-2">
                        Start creating new oil shipment deals to see them here.
                      </p>
                      <Button className="mt-4" size="sm" onClick={() => setActiveTab("deals")}>
                        Create Your First Deal
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentDeals.slice(0, 4).map(deal => (
                        <div key={deal.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-medium">
                              <Ship className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-medium">{deal.cargoType}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <span>{deal.sellerName}</span>
                                <ArrowRight className="h-3 w-3" />
                                <span>{deal.buyerName}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-primary">
                              {formatCurrency(deal.price * deal.volume * (deal.commissionRate || 0.01))}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(deal.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="ghost" className="w-full" onClick={() => setActiveTab("deals")}>
                    View All Deals
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Activity Feed */}
            <div>
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Activity Feed</CardTitle>
                  <CardDescription>Recent activities and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activityFeed.map((activity, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="mt-0.5">
                          {activity.icon}
                        </div>
                        <div>
                          <div className="font-medium">{activity.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {activity.description}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {activity.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recommended Companies */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recommended Oil Companies</CardTitle>
              <CardDescription>Connect with these companies to expand your network</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCompanies ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : recommendedCompanies.length === 0 ? (
                <div className="text-center py-6">
                  <Building className="h-10 w-10 mx-auto text-muted-foreground" />
                  <h3 className="mt-3 text-base font-medium">No recommendations available</h3>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommendedCompanies.slice(0, 3).map(company => (
                    <Card key={company.id} className="overflow-hidden border">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            {company.logo ? (
                              <Avatar className="h-10 w-10 rounded-md">
                                <AvatarImage src={company.logo} alt={company.name} />
                                <AvatarFallback className="rounded-md">
                                  {company.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                                <Building className="h-5 w-5 text-primary" />
                              </div>
                            )}
                            <div>
                              <CardTitle className="text-base">{company.name}</CardTitle>
                              {company.country && (
                                <CardDescription className="flex items-center text-xs">
                                  <Globe className="h-3 w-3 mr-1" /> 
                                  {company.country}
                                </CardDescription>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="space-y-2 text-sm">
                          {company.specialization && (
                            <div className="flex items-center text-muted-foreground">
                              <Ship className="h-3.5 w-3.5 mr-1.5" />
                              {company.specialization}
                            </div>
                          )}
                          {company.fleetSize && (
                            <div className="flex items-center text-muted-foreground">
                              <Users className="h-3.5 w-3.5 mr-1.5" />
                              {company.fleetSize} vessels
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" 
                          onClick={() => handleViewCompanyProfile(company.id)}>
                          Details
                        </Button>
                        <Button size="sm" className="flex-1" onClick={() => setActiveTab("connections")}>
                          Connect
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="ghost" className="w-full" onClick={() => setActiveTab("connections")}>
                View All Companies
              </Button>
            </CardFooter>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Performance Metrics</CardTitle>
              <CardDescription>Your broker performance stats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                  <div className="text-2xl font-bold">93%</div>
                  <div className="flex items-center text-xs text-green-600">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>+2.5% from last month</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Deals Closed</div>
                  <div className="text-2xl font-bold">42</div>
                  <div className="flex items-center text-xs text-green-600">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>+8 from last month</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Response Time</div>
                  <div className="text-2xl font-bold">1.4h</div>
                  <div className="flex items-center text-xs text-red-600">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    <span>+0.2h from last month</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Client Satisfaction</div>
                  <div className="text-2xl font-bold">4.8<span className="text-lg">/5</span></div>
                  <div className="flex items-center text-xs text-green-600">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>+0.2 from last month</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Companies/Connections Tab Content */}
        <TabsContent value="connections">
          <CompanyConnections brokerId={brokerId} />
        </TabsContent>

        {/* Deals Tab Content */}
        <TabsContent value="deals">
          <DealManager brokerId={brokerId} />
        </TabsContent>

        {/* Analytics Tab Content */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Performance Analytics</CardTitle>
              <CardDescription>Coming Soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-20">
                <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground" />
                <h3 className="mt-6 text-xl font-medium">Analytics Dashboard Coming Soon</h3>
                <p className="text-muted-foreground max-w-lg mx-auto mt-3">
                  Advanced analytics and reporting features for oil shipping brokers will be available in the next update.
                  Track your deal performance, market trends, and business growth metrics all in one place.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Company Profile Dialog */}
      {selectedCompanyId && (
        <Dialog open={showCompanyProfileDialog} onOpenChange={setShowCompanyProfileDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <CompanyProfile 
              companyId={selectedCompanyId} 
              onClose={() => setShowCompanyProfileDialog(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}