import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Repeat, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  Droplet, 
  Users, 
  BarChart as LucideBarChart, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText, 
  Ship,
  Building,
  Star,
  Filter,
  RefreshCw,
  MoreHorizontal,
  PieChart as LucidePieChart,
  Globe,
  Plus,
  X,
  Check
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Oil price type
type OilPrice = {
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  lastUpdated: string;
  arabicName: string;
};

// Deal type
type Deal = {
  id: number;
  vesselId: number;
  vesselName: string;
  brokerId: number;
  brokerName: string;
  refineryId: number;
  refineryName: string;
  cargoType: string;
  volume: number;
  price: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  eta: string;
  created: string;
};

// Trading types
type DealStatus = 'pending' | 'active' | 'completed' | 'cancelled';

// New Deal form type
type NewDealForm = {
  vesselId: number;
  brokerId: number;
  refineryId: number;
  cargoType: string;
  volume: number;
  price: number;
  eta: string;
  status: DealStatus;
};

export default function TradingDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [oilType, setOilType] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('today');
  const [refreshing, setRefreshing] = useState(false);
  const [showNewDealDialog, setShowNewDealDialog] = useState(false);
  const [liveTradingMode, setLiveTradingMode] = useState(false);
  const [newDealForm, setNewDealForm] = useState<NewDealForm>({
    vesselId: 0,
    brokerId: 0,
    refineryId: 0,
    cargoType: 'Crude Oil',
    volume: 1000000,
    price: 80.0,
    eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending'
  });
  const [_, navigate] = useLocation(); // Use useLocation to navigate
  const { toast } = useToast();

  // Query to get oil prices
  const { data: oilPrices = [], isLoading: isLoadingPrices } = useQuery<OilPrice[]>({
    queryKey: ['/api/trading/oil-prices'],
    // If API is not ready, uncomment to simulate data
    /*
    queryFn: async () => {
      return [
        { 
          name: 'Brent Crude', 
          arabicName: 'خام برنت',
          price: 82.43, 
          change: 0.56, 
          changePercent: 0.68, 
          currency: 'USD', 
          lastUpdated: new Date().toISOString() 
        },
        { 
          name: 'WTI Crude', 
          arabicName: 'خام غرب تكساس',
          price: 78.76, 
          change: -0.23, 
          changePercent: -0.29, 
          currency: 'USD', 
          lastUpdated: new Date().toISOString() 
        },
        { 
          name: 'Dubai Crude', 
          arabicName: 'خام دبي',
          price: 80.12, 
          change: 0.32, 
          changePercent: 0.40, 
          currency: 'USD', 
          lastUpdated: new Date().toISOString() 
        },
        { 
          name: 'OPEC Basket', 
          arabicName: 'سلة أوبك',
          price: 81.65, 
          change: 0.41, 
          changePercent: 0.50, 
          currency: 'USD', 
          lastUpdated: new Date().toISOString() 
        },
        { 
          name: 'Bonny Light', 
          arabicName: 'خام بوني لايت',
          price: 83.20, 
          change: 0.65, 
          changePercent: 0.79, 
          currency: 'USD', 
          lastUpdated: new Date().toISOString() 
        }
      ];
    },
    */
  });

  // Query to get active deals
  const { data: deals = [], isLoading: isLoadingDeals } = useQuery<Deal[]>({
    queryKey: ['/api/trading/deals', { status: 'active' }],
    // If API is not ready, uncomment to simulate data
    /*
    queryFn: async () => {
      return [
        {
          id: 1,
          vesselId: 1,
          vesselName: 'Atlantic Pioneer',
          brokerId: 1,
          brokerName: 'John Doe',
          refineryId: 1,
          refineryName: 'Saudi Aramco Ras Tanura',
          cargoType: 'Crude Oil',
          volume: 1500000,
          price: 82.5,
          status: 'active',
          eta: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          created: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          vesselId: 2,
          vesselName: 'Gulf Venture',
          brokerId: 2,
          brokerName: 'Sarah Johnson',
          refineryId: 2,
          refineryName: 'Kuwait Petroleum Al-Ahmadi',
          cargoType: 'Light Crude',
          volume: 1200000,
          price: 80.25,
          status: 'active',
          eta: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          created: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          vesselId: 3,
          vesselName: 'Mediterranean Spirit',
          brokerId: 1,
          brokerName: 'John Doe',
          refineryId: 3,
          refineryName: 'ADNOC Ruwais',
          cargoType: 'Heavy Crude',
          volume: 1800000,
          price: 79.3,
          status: 'active',
          eta: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          created: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 4,
          vesselId: 4,
          vesselName: 'Asian Voyager',
          brokerId: 3,
          brokerName: 'Ahmed Al-Saud',
          refineryId: 4,
          refineryName: 'Petro Rabigh',
          cargoType: 'Condensate',
          volume: 900000,
          price: 85.7,
          status: 'active',
          eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          created: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 5,
          vesselId: 5,
          vesselName: 'Nordic Explorer',
          brokerId: 4,
          brokerName: 'Maria Garcia',
          refineryId: 5,
          refineryName: 'Yanbu Aramco Sinopec',
          cargoType: 'Brent Blend',
          volume: 1600000,
          price: 83.1,
          status: 'active',
          eta: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
          created: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
    },
    */
  });

  // Mock refresh function
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast({
        title: "تم تحديث البيانات / Data Refreshed",
        description: "Latest trading data has been loaded",
      });
    }, 1000);
  };

  // Navigate to broker profile
  const navigateToBroker = (brokerId: number) => {
    navigate(`/brokers/${brokerId}`);
  };

  // Navigate to vessel details
  const navigateToVessel = (vesselId: number) => {
    navigate(`/vessels/${vesselId}`);
  };

  // Navigate to refinery details
  const navigateToRefinery = (refineryId: number) => {
    navigate(`/refineries/${refineryId}`);
  };

  // Format volume to readable text with units
  const formatVolume = (volume: number): string => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M bbl`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K bbl`;
    } else {
      return `${volume} bbl`;
    }
  };

  // Get CSS class based on price change
  const getPriceChangeClass = (change: number): string => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  // Get icon based on price change
  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    if (change < 0) return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    return <Repeat className="h-4 w-4 text-gray-600" />;
  };

  // Handle form input changes
  const handleFormChange = (field: keyof NewDealForm, value: any) => {
    setNewDealForm(prev => ({ ...prev, [field]: value }));
  };

  // Handle deal creation
  const handleCreateDeal = () => {
    // In a real app, this would make an API call to create the deal
    toast({
      title: "New Deal Created",
      description: `Created new deal for ${formatVolume(newDealForm.volume)} of ${newDealForm.cargoType}`,
      variant: "default"
    });
    setShowNewDealDialog(false);
  };

  // Toggle live trading mode
  const toggleLiveTrading = () => {
    setLiveTradingMode(!liveTradingMode);
    toast({
      title: liveTradingMode ? "Live Trading Disabled" : "Live Trading Enabled",
      description: liveTradingMode ? 
        "Switched to standard trading view" : 
        "Real-time market updates are now active",
      variant: "default"
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <BarChart3 className="h-8 w-8 mr-2 text-primary" />
            <span className="mr-2">Trading Dashboard</span>
            <span className="text-primary/70 font-medium">لوحة تحكم التداول</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor oil prices, active deals and market trends
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={showNewDealDialog} onOpenChange={setShowNewDealDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Deal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Oil Deal صفقة جديدة</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new trading deal.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cargoType">Cargo Type نوع الشحنة</Label>
                    <Select 
                      value={newDealForm.cargoType}
                      onValueChange={(val) => handleFormChange('cargoType', val)}
                    >
                      <SelectTrigger id="cargoType">
                        <SelectValue placeholder="Select cargo type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Crude Oil">Crude Oil</SelectItem>
                        <SelectItem value="Light Crude">Light Crude</SelectItem>
                        <SelectItem value="Heavy Crude">Heavy Crude</SelectItem>
                        <SelectItem value="Condensate">Condensate</SelectItem>
                        <SelectItem value="Brent Blend">Brent Blend</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="volume">Volume (in barrels) الحجم</Label>
                    <Input 
                      id="volume" 
                      type="number" 
                      value={newDealForm.volume}
                      onChange={(e) => handleFormChange('volume', Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USD/barrel) السعر</Label>
                    <Input 
                      id="price" 
                      type="number" 
                      value={newDealForm.price}
                      onChange={(e) => handleFormChange('price', Number(e.target.value))}
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eta">Estimated Arrival تاريخ الوصول</Label>
                    <Input 
                      id="eta" 
                      type="date" 
                      value={newDealForm.eta} 
                      onChange={(e) => handleFormChange('eta', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Deal Status حالة الصفقة</Label>
                  <Select 
                    value={newDealForm.status}
                    onValueChange={(val) => handleFormChange('status', val as DealStatus)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending (معلق)</SelectItem>
                      <SelectItem value="active">Active (نشط)</SelectItem>
                      <SelectItem value="completed">Completed (مكتمل)</SelectItem>
                      <SelectItem value="cancelled">Cancelled (ملغي)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes ملاحظات إضافية</Label>
                  <Textarea id="notes" placeholder="Enter any additional deal information..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewDealDialog(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" onClick={handleCreateDeal}>
                  <Check className="h-4 w-4 mr-2" />
                  Create Deal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Tabs 
        defaultValue="dashboard" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-4 sm:w-auto">
          <TabsTrigger value="dashboard" className="flex items-center">
            <LucideBarChart className="h-4 w-4 mr-2" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="oil-prices" className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            <span>Oil Prices</span>
          </TabsTrigger>
          <TabsTrigger value="active-deals" className="flex items-center">
            <Repeat className="h-4 w-4 mr-2" />
            <span>Active Deals</span>
          </TabsTrigger>
          <TabsTrigger value="market-trends" className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            <span>Market Trends</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Main Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoadingPrices ? (
              // Skeleton loaders for oil prices
              Array(4).fill(0).map((_, index) => (
                <Card key={`skeleton-${index}`} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-24 mb-4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full mt-2" />
                  </CardContent>
                </Card>
              ))
            ) : (
              // Display oil prices cards
              oilPrices.slice(0, 4).map((oil) => (
                <Card key={oil.name} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{oil.name}</span>
                      <DollarSign className="h-5 w-5 text-primary" />
                    </CardTitle>
                    <CardDescription>{oil.arabicName}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">
                      ${oil.price.toFixed(2)}
                    </div>
                    <div className="flex items-center">
                      {getPriceChangeIcon(oil.change)}
                      <span className={`ml-1 ${getPriceChangeClass(oil.change)}`}>
                        {oil.change > 0 ? '+' : ''}{oil.change.toFixed(2)} ({oil.change > 0 ? '+' : ''}{oil.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Last updated: {new Date(oil.lastUpdated).toLocaleTimeString()}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Market Overview Card */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                    <span>Market Overview</span>
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toast({ title: "Options", description: "Chart options menu clicked" })}>
                        Show as Line Chart
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast({ title: "Options", description: "Chart options menu clicked" })}>
                        Show as Bar Chart
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast({ title: "Options", description: "Chart options menu clicked" })}>
                        Export Data
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>نظرة عامة على سوق النفط</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  {isLoadingPrices ? (
                    <div className="h-full flex items-center justify-center">
                      <Skeleton className="h-[180px] w-full" />
                    </div>
                  ) : (
                    <div className="h-full">
                      {/* Real Interactive Chart using Recharts */}
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={oilPrices.map((price, index) => ({
                            name: price.name,
                            price: price.price,
                            time: new Date(price.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                            index
                          }))}
                          margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 12 }}
                            interval={0}
                          />
                          <YAxis 
                            domain={['dataMin - 1', 'dataMax + 1']}
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value: number) => `$${value}`}
                          />
                          <RechartsTooltip 
                            formatter={(value: number) => [`$${value}`, 'Price']}
                            labelFormatter={(label: string) => `${label}`}
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                              padding: '8px'
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="price"
                            stroke="var(--primary)"
                            strokeWidth={2}
                            dot={{ fill: 'var(--primary)', r: 4 }}
                            activeDot={{ r: 6, fill: 'var(--primary)' }}
                            isAnimationActive={true}
                            animationDuration={1000}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Deals Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Repeat className="h-5 w-5 mr-2 text-primary" />
                  <span>Recent Deals</span>
                </CardTitle>
                <CardDescription>أحدث الصفقات</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoadingDeals ? (
                    // Skeleton loaders for deals
                    Array(3).fill(0).map((_, index) => (
                      <div key={`skeleton-deal-${index}`} className="flex items-center">
                        <Skeleton className="h-8 w-8 rounded-full mr-3" />
                        <div className="space-y-1 flex-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-4/5" />
                        </div>
                      </div>
                    ))
                  ) : (
                    // Display recent deals
                    deals.slice(0, 3).map((deal) => (
                      <div 
                        key={deal.id} 
                        className="flex items-start border-b pb-2 last:border-0 last:pb-0 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
                        onClick={() => navigateToVessel(deal.vesselId)}
                      >
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {deal.vesselName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1 flex-1">
                          <div className="font-medium text-sm flex justify-between">
                            <span>{deal.vesselName}</span>
                            <span className="text-primary">${deal.price.toFixed(2)}</span>
                          </div>
                          <div className="text-xs text-muted-foreground flex justify-between">
                            <span>
                              {formatVolume(deal.volume)} • ETA: {formatDate(new Date(deal.eta), 'dd MMM')}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {deal.cargoType}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  variant="ghost" 
                  className="w-full text-primary" 
                  onClick={() => setActiveTab('active-deals')}
                >
                  View All Deals
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Brokers Activity Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  <span>Top Brokers</span>
                </CardTitle>
                <CardDescription>أفضل الوسطاء نشاطاً</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isLoadingDeals ? (
                    Array(3).fill(0).map((_, index) => (
                      <div key={`skeleton-broker-${index}`} className="flex items-center">
                        <Skeleton className="h-8 w-8 rounded-full mr-3" />
                        <div className="space-y-1 flex-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-6 w-8" />
                      </div>
                    ))
                  ) : (
                    // Group deals by broker and show top 3
                    Object.entries(
                      deals.reduce((acc, deal) => {
                        acc[deal.brokerId] = acc[deal.brokerId] || { 
                          name: deal.brokerName, 
                          count: 0, 
                          volume: 0,
                          id: deal.brokerId
                        };
                        acc[deal.brokerId].count++;
                        acc[deal.brokerId].volume += deal.volume;
                        return acc;
                      }, {} as Record<string, { name: string, count: number, volume: number, id: number }>)
                    )
                    .sort((a, b) => b[1].volume - a[1].volume)
                    .slice(0, 3)
                    .map(([_, broker], index) => (
                      <div 
                        key={broker.id} 
                        className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
                        onClick={() => navigateToBroker(broker.id)}
                      >
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarFallback className="bg-amber-100 text-amber-800 text-xs">
                            {broker.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium text-sm flex items-center">
                            {broker.name}
                            {index === 0 && (
                              <Star className="h-3 w-3 ml-1 text-amber-500 fill-amber-500" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {broker.count} deals • {formatVolume(broker.volume)}
                          </div>
                        </div>
                        <div className="text-xl font-bold text-gray-400">
                          #{index + 1}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  variant="ghost" 
                  className="w-full text-primary"
                  onClick={() => navigate('/brokers')}
                >
                  View All Brokers
                </Button>
              </CardFooter>
            </Card>
            
            {/* Cargo Distribution Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Droplet className="h-5 w-5 mr-2 text-primary" />
                  <span>Cargo Types</span>
                </CardTitle>
                <CardDescription>أنواع الشحنات</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center">
                  <div className="w-full space-y-3">
                    {isLoadingDeals ? (
                      Array(4).fill(0).map((_, index) => (
                        <div key={`skeleton-cargo-${index}`} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-12" />
                          </div>
                          <Skeleton className="h-2 w-full rounded-full" />
                        </div>
                      ))
                    ) : (
                      // Group deals by cargo type and calculate percentages
                      Object.entries(
                        deals.reduce((acc, deal) => {
                          acc[deal.cargoType] = acc[deal.cargoType] || 0;
                          acc[deal.cargoType] += deal.volume;
                          return acc;
                        }, {} as Record<string, number>)
                      )
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 4)
                      .map(([type, volume], index) => {
                        const totalVolume = deals.reduce((sum, deal) => sum + deal.volume, 0);
                        const percentage = (volume / totalVolume) * 100;
                        
                        // Get color based on index
                        const colors = ["bg-blue-500", "bg-amber-500", "bg-green-500", "bg-purple-500"];
                        
                        return (
                          <div key={type} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{type}</span>
                              <span className="font-medium">{percentage.toFixed(1)}%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${colors[index % colors.length]}`} 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  variant="ghost" 
                  className="w-full text-primary"
                  onClick={() => toast({ title: "Cargo Analysis", description: "Opening detailed cargo analysis module" })}
                >
                  View Detailed Analysis
                </Button>
              </CardFooter>
            </Card>
            
            {/* Trading Activity Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <LucidePieChart className="h-5 w-5 mr-2 text-primary" />
                  <span>Trading Activity</span>
                </CardTitle>
                <CardDescription>نشاط التداول</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-md">
                      <div className="text-3xl font-bold text-blue-700">
                        {isLoadingDeals ? (
                          <Skeleton className="h-9 w-full mx-auto" />
                        ) : (
                          deals.length
                        )}
                      </div>
                      <div className="text-sm text-blue-600">Active Deals</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-md">
                      <div className="text-3xl font-bold text-green-700">
                        {isLoadingDeals ? (
                          <Skeleton className="h-9 w-full mx-auto" />
                        ) : (
                          `$${(deals.reduce((sum, deal) => sum + (deal.price * deal.volume), 0) / 1000000).toFixed(1)}M`
                        )}
                      </div>
                      <div className="text-sm text-green-600">Total Value</div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Recent Activity</h4>
                    {isLoadingDeals ? (
                      Array(3).fill(0).map((_, index) => (
                        <div key={`skeleton-activity-${index}`} className="flex justify-between text-sm">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      ))
                    ) : (
                      [
                        { 
                          label: 'New Deals Today', 
                          value: deals.filter(d => new Date(d.created).toDateString() === new Date().toDateString()).length 
                        },
                        { 
                          label: 'Avg Price (per barrel)', 
                          value: `$${(deals.reduce((sum, deal) => sum + deal.price, 0) / deals.length).toFixed(2)}` 
                        },
                        { 
                          label: 'Delivery This Week', 
                          value: deals.filter(d => {
                            const eta = new Date(d.eta);
                            const today = new Date();
                            const endOfWeek = new Date();
                            endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
                            return eta <= endOfWeek;
                          }).length
                        }
                      ].map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-medium">{item.value}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  variant="ghost" 
                  className="w-full text-primary"
                  onClick={() => toast({ title: "Activity Report", description: "Generating detailed trading activity report" })}
                >
                  Generate Report
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Oil Prices Tab */}
        <TabsContent value="oil-prices" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <DollarSign className="h-6 w-6 mr-2 text-primary" />
              <span className="mr-2">Live Oil Prices</span>
              <span className="text-primary/70 font-medium">أسعار النفط المباشرة</span>
            </h2>
            
            <div className="flex gap-2 mt-2 md:mt-0">
              <Select value={oilType} onValueChange={setOilType}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Oil Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="crude">Crude Oil</SelectItem>
                  <SelectItem value="brent">Brent</SelectItem>
                  <SelectItem value="wti">WTI</SelectItem>
                  <SelectItem value="opec">OPEC Basket</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoadingPrices ? (
              // Skeleton loaders for oil prices
              Array(6).fill(0).map((_, index) => (
                <Card key={`skeleton-price-${index}`} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-40 mb-1" />
                    <Skeleton className="h-4 w-28" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-10 w-32 mb-1" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full mt-4" />
                    <Skeleton className="h-4 w-4/5 mt-2" />
                  </CardContent>
                </Card>
              ))
            ) : (
              // Display all oil prices
              oilPrices.map((oil) => (
                <Card key={oil.name} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-center">
                      <span>{oil.name}</span>
                      <Badge variant={oil.change >= 0 ? "default" : "destructive"} className={oil.change >= 0 ? "bg-green-500" : ""}>
                        {oil.change >= 0 ? "▲ Rising" : "▼ Falling"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{oil.arabicName}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-3xl font-bold">
                        ${oil.price.toFixed(2)}
                      </div>
                      <div className={`text-lg font-semibold ${getPriceChangeClass(oil.change)}`}>
                        {oil.change > 0 ? '+' : ''}{oil.change.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="flex justify-between mt-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Change %:</span>
                        <span className={`ml-1 font-medium ${getPriceChangeClass(oil.change)}`}>
                          {oil.change > 0 ? '+' : ''}{oil.changePercent.toFixed(2)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Currency:</span>
                        <span className="ml-1 font-medium">{oil.currency}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-muted-foreground">
                      Last updated: {new Date(oil.lastUpdated).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                <span>Historical Price Trends</span>
              </CardTitle>
              <CardDescription>اتجاهات الأسعار التاريخية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <LucideBarChart className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>Interactive historical price chart will appear here</p>
                  <p className="text-sm">مخطط تفاعلي لأسعار النفط التاريخية</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Active Deals Tab */}
        <TabsContent value="active-deals" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <Repeat className="h-6 w-6 mr-2 text-primary" />
              <span className="mr-2">Active Deals</span>
              <span className="text-primary/70 font-medium">الصفقات النشطة</span>
            </h2>
            
            <div className="flex gap-2 mt-2 md:mt-0">
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <Droplet className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Cargo Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="crude">Crude Oil</SelectItem>
                  <SelectItem value="light">Light Crude</SelectItem>
                  <SelectItem value="heavy">Heavy Crude</SelectItem>
                  <SelectItem value="condensate">Condensate</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {isLoadingDeals ? (
              // Skeleton loaders for deals
              Array(4).fill(0).map((_, index) => (
                <Card key={`skeleton-deal-detailed-${index}`} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-40 mb-1" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <Skeleton className="h-20 w-full col-span-1" />
                      <div className="col-span-2 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              // Display all active deals
              deals.map((deal) => (
                <Card key={deal.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-lg flex items-center">
                        <Ship className="h-5 w-5 mr-2 text-primary" />
                        <span>{deal.vesselName}</span>
                      </CardTitle>
                      <Badge>
                        {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription>
                      ETA: {formatDate(new Date(deal.eta), 'dd MMM yyyy')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div 
                        className="bg-gray-50 rounded-md p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => navigateToBroker(deal.brokerId)}
                      >
                        <Avatar className="h-10 w-10 mb-2">
                          <AvatarFallback className="bg-amber-100 text-amber-800">
                            {deal.brokerName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm font-medium text-center">{deal.brokerName}</div>
                        <div className="text-xs text-muted-foreground">Broker</div>
                      </div>
                      
                      <div className="col-span-2 space-y-3">
                        <div 
                          className="flex items-center cursor-pointer hover:underline text-primary"
                          onClick={() => navigateToRefinery(deal.refineryId)}
                        >
                          <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="text-sm font-medium">{deal.refineryName}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <div>
                            <span className="text-muted-foreground">Cargo:</span>
                            <span className="ml-1 font-medium">{deal.cargoType}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Volume:</span>
                            <span className="ml-1 font-medium">{formatVolume(deal.volume)}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <div>
                            <span className="text-muted-foreground">Price:</span>
                            <span className="ml-1 font-medium">${deal.price.toFixed(2)}/bbl</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Value:</span>
                            <span className="ml-1 font-medium">${((deal.price * deal.volume) / 1000000).toFixed(2)}M</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between mt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigateToVessel(deal.vesselId)}
                          >
                            <Ship className="h-3.5 w-3.5 mr-1.5" />
                            Track Vessel
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigateToBroker(deal.brokerId)}
                          >
                            <Users className="h-3.5 w-3.5 mr-1.5" />
                            Contact Broker
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Market Trends Tab */}
        <TabsContent value="market-trends" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Market Trends Overview Card */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                    <span>Market Trends Analysis</span>
                  </CardTitle>
                  <Select defaultValue="month">
                    <SelectTrigger className="w-[130px]">
                      <Calendar className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                      <SelectItem value="quarter">Quarter</SelectItem>
                      <SelectItem value="year">Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <CardDescription>تحليل اتجاهات السوق واستقراء الاسعار</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>Interactive trend analysis chart will appear here</p>
                    <p className="text-sm">مخطط تحليل الاتجاهات التفاعلي</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price Forecast Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <LucidePieChart className="h-5 w-5 mr-2 text-primary" />
                    <span>Price Forecast</span>
                  </CardTitle>
                  <CardDescription>توقعات الأسعار</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoadingPrices ? (
                      Array(3).fill(0).map((_, i) => (
                        <div key={`forecast-skeleton-${i}`} className="space-y-2">
                          <Skeleton className="h-4 w-36" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      ))
                    ) : (
                      <div className="space-y-4">
                        {/* Brent Forecast */}
                        <div className="p-3 border rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <div className="font-medium">Brent Crude خام برنت</div>
                            <Badge variant={Math.random() > 0.5 ? "default" : "destructive"}>
                              {Math.random() > 0.5 ? 'Bullish صعودي' : 'Bearish هبوطي'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            30-day forecast based on market trends and historic data
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="text-xl font-bold">
                              ${(oilPrices.find(p => p.name === 'Brent Crude')?.price || 82) + 3.25}
                            </div>
                            <div className="flex items-center text-green-600">
                              <ArrowUpRight className="h-4 w-4 mr-1" />
                              <span>+3.25 (+3.95%)</span>
                            </div>
                          </div>
                        </div>

                        {/* WTI Forecast */}
                        <div className="p-3 border rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <div className="font-medium">WTI Crude خام غرب تكساس</div>
                            <Badge variant="outline" className="border-amber-500 text-amber-700">Neutral متعادل</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            30-day forecast based on market trends and historic data
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="text-xl font-bold">
                              ${(oilPrices.find(p => p.name === 'WTI Crude')?.price || 78) + 0.55}
                            </div>
                            <div className="flex items-center text-green-600">
                              <ArrowUpRight className="h-4 w-4 mr-1" />
                              <span>+0.55 (+0.70%)</span>
                            </div>
                          </div>
                        </div>

                        {/* Dubai Forecast */}
                        <div className="p-3 border rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <div className="font-medium">Dubai Crude خام دبي</div>
                            <Badge variant="destructive">Bearish هبوطي</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            30-day forecast based on market trends and historic data
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="text-xl font-bold">
                              ${(oilPrices.find(p => p.name === 'Dubai Crude')?.price || 80) - 1.65}
                            </div>
                            <div className="flex items-center text-red-600">
                              <ArrowDownRight className="h-4 w-4 mr-1" />
                              <span>-1.65 (-2.05%)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Full Forecast Report
                  </Button>
                </CardFooter>
              </Card>

              {/* Market Events Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    <span>Market Events</span>
                  </CardTitle>
                  <CardDescription>أحداث السوق المؤثرة</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* OPEC Meeting */}
                    <div className="border-l-4 border-blue-500 pl-3 py-1">
                      <div className="flex justify-between items-center">
                        <div className="font-medium">OPEC+ Meeting اجتماع أوبك+</div>
                        <Badge variant="outline">Upcoming قادم</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(new Date().setDate(new Date().getDate() + 12)).toLocaleDateString()}
                      </p>
                      <p className="text-sm mt-1">
                        Expected to discuss production quotas and market stability.
                      </p>
                      <div className="flex items-center mt-1 text-xs text-amber-600">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        <span>High Impact تأثير عالي</span>
                      </div>
                    </div>

                    {/* US Inventory Report */}
                    <div className="border-l-4 border-green-500 pl-3 py-1">
                      <div className="flex justify-between items-center">
                        <div className="font-medium">US Inventory Report تقرير المخزون الأمريكي</div>
                        <Badge variant="outline">Weekly أسبوعي</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(new Date().setDate(new Date().getDate() + 2)).toLocaleDateString()}
                      </p>
                      <p className="text-sm mt-1">
                        EIA crude oil inventory report showing supply levels.
                      </p>
                      <div className="flex items-center mt-1 text-xs text-orange-600">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        <span>Medium Impact تأثير متوسط</span>
                      </div>
                    </div>

                    {/* Saudi Production Announcement */}
                    <div className="border-l-4 border-purple-500 pl-3 py-1">
                      <div className="flex justify-between items-center">
                        <div className="font-medium">Saudi Production إعلان الإنتاج السعودي</div>
                        <Badge variant="outline">Expected متوقع</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(new Date().setDate(new Date().getDate() + 5)).toLocaleDateString()}
                      </p>
                      <p className="text-sm mt-1">
                        Saudi Arabia expected to announce production levels for next quarter.
                      </p>
                      <div className="flex items-center mt-1 text-xs text-amber-600">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        <span>High Impact تأثير عالي</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="outline" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Full Events Calendar
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Regional Analysis Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-primary" />
                  <span>Regional Demand Analysis</span>
                </CardTitle>
                <CardDescription>تحليل الطلب الإقليمي</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-[250px] flex items-center justify-center border rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <LucidePieChart className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>Regional demand chart will appear here</p>
                      <p className="text-sm">مخطط الطلب الإقليمي</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-lg">Key Insights تحليلات رئيسية</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <div className="bg-red-500 h-2 w-2 rounded-full mt-2 mr-2"></div>
                        <div>
                          <span className="font-medium">Asia Pacific آسيا والمحيط الهادئ</span>
                          <p className="text-sm text-muted-foreground">
                            Demand increased 3.2% YoY, driven by industrial recovery in China and India.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-blue-500 h-2 w-2 rounded-full mt-2 mr-2"></div>
                        <div>
                          <span className="font-medium">North America أمريكا الشمالية</span>
                          <p className="text-sm text-muted-foreground">
                            Stable consumption with 0.5% growth, affected by transition to renewables.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-green-500 h-2 w-2 rounded-full mt-2 mr-2"></div>
                        <div>
                          <span className="font-medium">Europe أوروبا</span>
                          <p className="text-sm text-muted-foreground">
                            Demand decreased by 1.8% due to economic conditions and green policies.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-yellow-500 h-2 w-2 rounded-full mt-2 mr-2"></div>
                        <div>
                          <span className="font-medium">Middle East الشرق الأوسط</span>
                          <p className="text-sm text-muted-foreground">
                            Consumption up 2.7%, driven by industrial and transportation sectors.
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Download Full Analysis Report
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}