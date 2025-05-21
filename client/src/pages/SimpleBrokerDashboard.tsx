import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Building, 
  Users, 
  BarChart3, 
  FileText, 
  ArrowUpRight,
  ArrowRight,
  Search,
  Filter,
  Star,
  Check,
  Clock,
  XCircle,
  Handshake,
  Globe,
  Ship,
  Briefcase,
  Compass,
  ChevronUp,
  ChevronDown,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  AlertCircle
} from 'lucide-react';

// Company type definition
type Company = {
  id: number;
  name: string;
  country: string;
  region: string;
  products: string[];
  fleetSize: number;
  status: 'connected' | 'pending' | 'none';
  logoColor: string;
  revenueRange: string;
  established: number;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  description: string;
  premium: boolean;
};

// Deal type
type Deal = {
  id: number;
  seller: string;
  buyer: string;
  product: string;
  quantity: string;
  value: string;
  commission: string;
  status: 'completed' | 'in-progress' | 'proposed';
  date: string;
};

export default function SimpleBrokerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [companies, setCompanies] = useState<Company[]>([
    { 
      id: 1, 
      name: 'Saudi Aramco', 
      country: 'Saudi Arabia', 
      region: 'Middle East',
      products: ['Crude Oil', 'Natural Gas', 'LNG'], 
      fleetSize: 42, 
      status: 'connected',
      logoColor: 'bg-red-500',
      revenueRange: '$100B+',
      established: 1933,
      contactEmail: 'partnerships@aramco.com',
      contactPhone: '+966-13-872-0115',
      website: 'aramco.com',
      description: 'One of the largest oil producers in the world with extensive shipping operations across the globe.',
      premium: true
    },
    { 
      id: 2, 
      name: 'Shell Trading', 
      country: 'Netherlands', 
      region: 'Europe',
      products: ['Crude Oil', 'Refined Products', 'Chemicals'], 
      fleetSize: 67, 
      status: 'connected',
      logoColor: 'bg-yellow-500',
      revenueRange: '$50B-100B',
      established: 1907,
      contactEmail: 'trading@shell.com',
      contactPhone: '+31-70-377-9111',
      website: 'shell.com',
      description: 'Global leader in energy trading with extensive maritime logistics capabilities.',
      premium: true
    },
    { 
      id: 3, 
      name: 'ADNOC Distribution', 
      country: 'UAE', 
      region: 'Middle East',
      products: ['Refined Products', 'Lubricants'], 
      fleetSize: 29, 
      status: 'pending',
      logoColor: 'bg-blue-500',
      revenueRange: '$10B-50B',
      established: 1971,
      contactEmail: 'partnerships@adnoc.ae',
      contactPhone: '+971-2-677-1500',
      website: 'adnoc.ae',
      description: 'Leading distributor of petroleum products throughout the UAE and globally.',
      premium: false
    },
    { 
      id: 4, 
      name: 'BP Trading', 
      country: 'United Kingdom', 
      region: 'Europe',
      products: ['Crude Oil', 'Refined Products', 'LNG'], 
      fleetSize: 51, 
      status: 'connected',
      logoColor: 'bg-green-500',
      revenueRange: '$50B-100B',
      established: 1909,
      contactEmail: 'trading@bp.com',
      contactPhone: '+44-20-7496-4000',
      website: 'bp.com',
      description: 'Major energy company with significant maritime shipping operations.',
      premium: true
    },
    { 
      id: 5, 
      name: 'Kuwait Petroleum', 
      country: 'Kuwait', 
      region: 'Middle East',
      products: ['Crude Oil', 'LNG'], 
      fleetSize: 33, 
      status: 'connected',
      logoColor: 'bg-indigo-500',
      revenueRange: '$10B-50B',
      established: 1980,
      contactEmail: 'info@kpc.com.kw',
      contactPhone: '+965-2395-5000',
      website: 'kpc.com.kw',
      description: 'National oil company of Kuwait with extensive shipping operations.',
      premium: false
    },
    { 
      id: 6, 
      name: 'Total Energies', 
      country: 'France', 
      region: 'Europe',
      products: ['Crude Oil', 'Refined Products', 'LNG', 'Renewables'], 
      fleetSize: 59, 
      status: 'none',
      logoColor: 'bg-purple-500',
      revenueRange: '$50B-100B',
      established: 1924,
      contactEmail: 'partnerships@totalenergies.com',
      contactPhone: '+33-1-4744-4546',
      website: 'totalenergies.com',
      description: 'Global energy company with a strong focus on transitioning to sustainable energy.',
      premium: true
    },
    { 
      id: 7, 
      name: 'Sinopec', 
      country: 'China', 
      region: 'Asia Pacific',
      products: ['Crude Oil', 'Refined Products', 'Petrochemicals'], 
      fleetSize: 73, 
      status: 'none',
      logoColor: 'bg-red-600',
      revenueRange: '$100B+',
      established: 1983,
      contactEmail: 'intl@sinopec.com',
      contactPhone: '+86-10-5996-0114',
      website: 'sinopec.com',
      description: 'One of China\'s largest petroleum companies with global shipping operations.',
      premium: false
    },
    { 
      id: 8, 
      name: 'Petrobras', 
      country: 'Brazil', 
      region: 'South America',
      products: ['Crude Oil', 'Natural Gas'], 
      fleetSize: 47, 
      status: 'none',
      logoColor: 'bg-green-600',
      revenueRange: '$50B-100B',
      established: 1953,
      contactEmail: 'international@petrobras.com.br',
      contactPhone: '+55-21-3224-4477',
      website: 'petrobras.com.br',
      description: 'Brazil\'s national oil company with significant deepwater expertise.',
      premium: true
    },
    { 
      id: 9, 
      name: 'Chevron Shipping', 
      country: 'United States', 
      region: 'North America',
      products: ['Crude Oil', 'Refined Products'], 
      fleetSize: 53, 
      status: 'connected',
      logoColor: 'bg-blue-600',
      revenueRange: '$50B-100B',
      established: 1879,
      contactEmail: 'shipping@chevron.com',
      contactPhone: '+1-925-842-1000',
      website: 'chevron.com',
      description: 'Major global energy company with extensive shipping operations.',
      premium: true
    },
    { 
      id: 10, 
      name: 'Gazprom Neft', 
      country: 'Russia', 
      region: 'Europe',
      products: ['Crude Oil', 'Natural Gas'], 
      fleetSize: 35, 
      status: 'none',
      logoColor: 'bg-blue-800',
      revenueRange: '$10B-50B',
      established: 1995,
      contactEmail: 'international@gazprom-neft.ru',
      contactPhone: '+7-812-363-3152',
      website: 'gazprom-neft.com',
      description: 'Russian oil company with strong presence in European and Asian markets.',
      premium: false
    },
    { 
      id: 11, 
      name: 'PDVSA', 
      country: 'Venezuela', 
      region: 'South America',
      products: ['Crude Oil'], 
      fleetSize: 21, 
      status: 'none',
      logoColor: 'bg-red-700',
      revenueRange: '$10B-50B',
      established: 1976,
      contactEmail: 'info@pdvsa.com',
      contactPhone: '+58-212-708-4111',
      website: 'pdvsa.com',
      description: 'Venezuela\'s state-owned oil company with crude oil shipping operations.',
      premium: false
    },
    { 
      id: 12, 
      name: 'ExxonMobil Marine', 
      country: 'United States', 
      region: 'North America',
      products: ['Crude Oil', 'Refined Products', 'Chemicals'], 
      fleetSize: 62, 
      status: 'pending',
      logoColor: 'bg-blue-700',
      revenueRange: '$100B+',
      established: 1870,
      contactEmail: 'marine.ventures@exxonmobil.com',
      contactPhone: '+1-972-444-1000',
      website: 'exxonmobil.com',
      description: 'One of the world\'s largest publicly traded energy providers and chemical manufacturers.',
      premium: true
    }
  ]);
  
  // Sample deals data
  const [deals, setDeals] = useState<Deal[]>([
    {
      id: 1,
      seller: 'Saudi Aramco',
      buyer: 'Shell Trading',
      product: 'Crude Oil',
      quantity: '500,000 bbl',
      value: '$38.5M',
      commission: '$385K',
      status: 'completed',
      date: '2023-04-15'
    },
    {
      id: 2,
      seller: 'ADNOC Distribution',
      buyer: 'BP Trading',
      product: 'Jet Fuel',
      quantity: '250,000 bbl',
      value: '$24.2M',
      commission: '$242K',
      status: 'in-progress',
      date: '2023-05-03'
    },
    {
      id: 3,
      seller: 'Kuwait Petroleum',
      buyer: 'Total Energies',
      product: 'LNG',
      quantity: '150,000 cu.m',
      value: '$18.7M',
      commission: '$187K',
      status: 'completed',
      date: '2023-03-22'
    },
    {
      id: 4,
      seller: 'Chevron Shipping',
      buyer: 'Petrobras',
      product: 'Crude Oil',
      quantity: '300,000 bbl',
      value: '$27.9M',
      commission: '$279K',
      status: 'in-progress',
      date: '2023-05-10'
    },
    {
      id: 5,
      seller: 'ExxonMobil Marine',
      buyer: 'Sinopec',
      product: 'Petrochemicals',
      quantity: '120,000 tons',
      value: '$16.4M',
      commission: '$164K',
      status: 'proposed',
      date: '2023-05-18'
    }
  ]);
  
  // Activities log
  const [activities, setActivities] = useState([
    { type: 'connection', company: 'BP Trading', status: 'connected', time: '1 day ago' },
    { type: 'deal', deal: 'Saudi Aramco → Shell Trading', value: '$38.5M', time: '3 days ago' },
    { type: 'connection', company: 'Chevron Shipping', status: 'connected', time: '5 days ago' },
    { type: 'deal', deal: 'Kuwait Petroleum → Total Energies', value: '$18.7M', time: '1 week ago' },
    { type: 'notification', message: 'Your subscription will renew in 14 days', time: '1 week ago' }
  ]);
  
  // Function to handle viewing company details
  const handleViewDetails = (companyId: number) => {
    const company = companies.find(c => c.id === companyId);
    if (company) {
      alert(`Opening detailed profile for ${company.name}\n\nCountry: ${company.country}\nFleet Size: ${company.fleetSize} vessels\nProducts: ${company.products.join(', ')}\nEstablished: ${company.established}\nContact: ${company.contactEmail}`);
    }
  };
  
  // Function to handle connecting with a company
  const handleConnect = (companyId: number) => {
    const company = companies.find(c => c.id === companyId);
    if (company) {
      alert(`Initiating connection with ${company.name}\nA connection request will be sent to their business development team.`);
      
      // Update the company status
      setCompanies(companies.map(c => 
        c.id === companyId ? { ...c, status: 'pending' } : c
      ));
      
      // Add to activity log
      setActivities([
        { type: 'connection', company: company.name, status: 'pending', time: 'Just now' },
        ...activities
      ]);
    }
  };
  
  // Function to handle starting a new deal
  const handleNewDeal = (companyId: number) => {
    const company = companies.find(c => c.id === companyId);
    if (company) {
      alert(`Starting new deal proposal with ${company.name}\nYou'll be redirected to the deal creation form.`);
    }
  };
  
  // Function to filter companies
  const filteredCompanies = companies.filter(company => {
    // Text search
    const matchesSearch = searchTerm === '' || 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.products.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Region filter
    const matchesRegion = regionFilter === 'all' || company.region === regionFilter;
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
    
    return matchesSearch && matchesRegion && matchesStatus;
  });
  
  // Calculate metrics
  const connectionMetrics = {
    connected: companies.filter(c => c.status === 'connected').length,
    pending: companies.filter(c => c.status === 'pending').length,
    potential: companies.filter(c => c.status === 'none').length
  };
  
  const dealMetrics = {
    completed: deals.filter(d => d.status === 'completed').length,
    inProgress: deals.filter(d => d.status === 'in-progress').length,
    proposed: deals.filter(d => d.status === 'proposed').length,
    totalValue: deals.reduce((sum, deal) => sum + parseFloat(deal.value.replace('$', '').replace('M', '')), 0),
    totalCommission: deals.reduce((sum, deal) => sum + parseFloat(deal.commission.replace('$', '').replace('K', '')), 0) / 1000
  };
  
  // Company regions for filter
  const regions = ['North America', 'South America', 'Europe', 'Middle East', 'Africa', 'Asia Pacific'];
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Briefcase className="h-8 w-8 mr-2 text-primary" />
              PetroDeal Broker Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Connect oil shipping companies with clients and manage profitable deals
            </p>
          </div>
          
          <Tabs defaultValue="overview" className="w-full md:w-auto">
            <TabsList className="grid w-full md:w-auto grid-cols-3 h-auto">
              <TabsTrigger 
                value="overview" 
                className="px-3 py-2"
                onClick={() => setActiveTab('overview')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="companies" 
                className="px-3 py-2"
                onClick={() => setActiveTab('companies')}
              >
                <Building className="h-4 w-4 mr-2" />
                Companies
              </TabsTrigger>
              <TabsTrigger 
                value="deals" 
                className="px-3 py-2"
                onClick={() => setActiveTab('deals')}
              >
                <Handshake className="h-4 w-4 mr-2" />
                Deals
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Broker metrics for Overview tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Connected Companies</p>
                    <p className="text-3xl font-bold mt-1">{connectionMetrics.connected}</p>
                  </div>
                  <div className="p-3 bg-primary/20 rounded-full">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <ArrowUpRight className="h-4 w-4 mr-1 text-green-600" />
                  <span className="text-green-600 font-medium">{connectionMetrics.pending}</span>
                  <span className="text-muted-foreground ml-1">pending connections</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed Deals</p>
                    <p className="text-3xl font-bold mt-1">{dealMetrics.completed}</p>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-full">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <Clock className="h-4 w-4 mr-1 text-yellow-600" />
                  <span className="text-yellow-600 font-medium">{dealMetrics.inProgress}</span>
                  <span className="text-muted-foreground ml-1">deals in progress</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Deal Value (Month)</p>
                    <p className="text-3xl font-bold mt-1">${dealMetrics.totalValue.toFixed(1)}M</p>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-full">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <ArrowUpRight className="h-4 w-4 mr-1 text-green-600" />
                  <span className="text-green-600 font-medium">12%</span>
                  <span className="text-muted-foreground ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Commission (Month)</p>
                    <p className="text-3xl font-bold mt-1">${dealMetrics.totalCommission.toFixed(1)}M</p>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <ArrowUpRight className="h-4 w-4 mr-1 text-green-600" />
                  <span className="text-green-600 font-medium">8.5%</span>
                  <span className="text-muted-foreground ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main content area */}
        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Recent deals and activities section */}
            <div className="lg:col-span-8 space-y-6">
              {/* Recent deals */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Deals</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setActiveTab('deals')}
                    >
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    Your latest brokered oil trading deals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {deals.slice(0, 3).map(deal => (
                      <div key={deal.id} className="flex items-start justify-between p-4 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-md flex items-center justify-center ${
                            deal.status === 'completed' ? 'bg-green-500/10' : 
                            deal.status === 'in-progress' ? 'bg-yellow-500/10' : 'bg-blue-500/10'
                          }`}>
                            {deal.status === 'completed' ? (
                              <Check className={`h-5 w-5 text-green-600`} />
                            ) : deal.status === 'in-progress' ? (
                              <Clock className={`h-5 w-5 text-yellow-600`} />
                            ) : (
                              <FileText className={`h-5 w-5 text-blue-600`} />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center">
                              <p className="font-medium">{deal.seller} → {deal.buyer}</p>
                              <Badge className={`ml-2 ${
                                deal.status === 'completed' ? 'bg-green-500' : 
                                deal.status === 'in-progress' ? 'bg-yellow-500' : 'bg-blue-500'
                              }`}>
                                {deal.status === 'completed' ? 'Completed' : 
                                 deal.status === 'in-progress' ? 'In Progress' : 'Proposed'}
                              </Badge>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <Ship className="h-3.5 w-3.5 mr-1" />
                              <span>{deal.product} - {deal.quantity}</span>
                              <span className="mx-2">•</span>
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              <span>{new Date(deal.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{deal.value}</p>
                          <p className="text-sm text-green-600">{deal.commission} comm.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => alert("Opening deal creation form")}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Initiate New Deal
                  </Button>
                </CardFooter>
              </Card>

              {/* Company connections */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Connected Companies</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setActiveTab('companies')}
                    >
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    Your active connections with oil shipping companies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {companies
                      .filter(c => c.status === 'connected')
                      .slice(0, 4)
                      .map(company => (
                        <div key={company.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-md ${company.logoColor} flex items-center justify-center text-white font-bold`}>
                              {company.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium flex items-center">
                                {company.name}
                                {company.premium && (
                                  <Star className="h-4 w-4 ml-1 text-amber-500 fill-amber-500" />
                                )}
                              </p>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Globe className="h-3.5 w-3.5 mr-1" />
                                <span>{company.country}</span>
                                <span className="mx-1.5">•</span>
                                <Ship className="h-3.5 w-3.5 mr-1" />
                                <span>{company.fleetSize} vessels</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewDetails(company.id)}
                            >
                              Details
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleNewDeal(company.id)}
                            >
                              New Deal
                            </Button>
                          </div>
                        </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setActiveTab('companies')}
                  >
                    <Building className="mr-2 h-4 w-4" />
                    Find New Companies
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Activity feed and pending connections */}
            <div className="lg:col-span-4 space-y-6">
              {/* Pending connections */}
              <Card>
                <CardHeader>
                  <CardTitle>Pending Connections</CardTitle>
                  <CardDescription>
                    Awaiting approval from these companies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {companies.filter(c => c.status === 'pending').length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No pending connection requests</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {companies
                        .filter(c => c.status === 'pending')
                        .map(company => (
                          <div key={company.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-md ${company.logoColor} flex items-center justify-center text-white font-bold`}>
                                {company.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium">{company.name}</p>
                                <p className="text-sm text-muted-foreground">{company.country}</p>
                              </div>
                            </div>
                            <Badge className="bg-yellow-500">Pending</Badge>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Activity feed */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your latest actions and updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === 'connection' ? 'bg-blue-500/10' :
                          activity.type === 'deal' ? 'bg-green-500/10' : 'bg-yellow-500/10'
                        }`}>
                          {activity.type === 'connection' ? (
                            <Users className={`h-4 w-4 text-blue-600`} />
                          ) : activity.type === 'deal' ? (
                            <Handshake className={`h-4 w-4 text-green-600`} />
                          ) : (
                            <AlertCircle className={`h-4 w-4 text-yellow-600`} />
                          )}
                        </div>
                        <div>
                          <p className="text-sm">
                            {activity.type === 'connection' ? (
                              <>
                                Connection with <span className="font-medium">{activity.company}</span> is now {' '}
                                <Badge className={activity.status === 'connected' ? 'bg-green-500' : 'bg-yellow-500'}>
                                  {activity.status}
                                </Badge>
                              </>
                            ) : activity.type === 'deal' ? (
                              <>
                                Completed deal: <span className="font-medium">{activity.deal}</span> for {' '}
                                <span className="text-green-600 font-medium">{activity.value}</span>
                              </>
                            ) : (
                              <>{activity.message}</>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : activeTab === 'companies' ? (
          <div className="space-y-6">
            {/* Search and filters */}
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search companies..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <Select value={regionFilter} onValueChange={setRegionFilter}>
                      <SelectTrigger className="w-[180px]">
                        <Globe className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="All Regions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Regions</SelectItem>
                        {regions.map(region => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="connected">Connected</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="none">Not Connected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Companies grid */}
            {filteredCompanies.length === 0 ? (
              <div className="text-center py-12">
                <Building className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                <h3 className="mt-4 text-lg font-medium">No companies found</h3>
                <p className="text-muted-foreground mt-1">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCompanies.map(company => (
                  <Card key={company.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2 border-b">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-md ${company.logoColor} flex items-center justify-center text-white font-bold`}>
                            {company.name.charAt(0)}
                          </div>
                          <div>
                            <CardTitle className="text-lg flex items-center">
                              {company.name}
                              {company.premium && (
                                <Star className="h-4 w-4 ml-1 text-amber-500 fill-amber-500" />
                              )}
                            </CardTitle>
                            <CardDescription className="flex items-center">
                              <Globe className="h-3.5 w-3.5 mr-1" />
                              {company.country} • {company.region}
                            </CardDescription>
                          </div>
                        </div>
                        
                        <Badge className={
                          company.status === 'connected' ? "bg-green-500" : 
                          company.status === 'pending' ? "bg-yellow-500" : "bg-gray-200 text-gray-700"
                        }>
                          {company.status === 'connected' ? 'Connected' : 
                           company.status === 'pending' ? 'Pending' : 'Not Connected'}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Fleet Size</span>
                          <span className="font-medium">{company.fleetSize} vessels</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Products</span>
                          <span className="font-medium">{company.products.slice(0, 2).join(', ')}{company.products.length > 2 ? '...' : ''}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Revenue</span>
                          <span className="font-medium">{company.revenueRange}</span>
                        </div>
                        
                        <Separator className="my-3" />
                        
                        <p className="text-sm text-muted-foreground line-clamp-2">{company.description}</p>
                        
                        <div className="flex flex-col text-sm space-y-1.5 mt-2">
                          <div className="flex items-center">
                            <Mail className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            <span className="text-muted-foreground">{company.contactEmail || 'No email available'}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            <span className="text-muted-foreground">{company.contactPhone || 'No phone available'}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="border-t p-3 flex gap-2">
                      {company.status === 'connected' ? (
                        <>
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleViewDetails(company.id)}
                          >
                            <FileText className="h-4 w-4 mr-1.5" />
                            View Details
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={() => handleNewDeal(company.id)}
                          >
                            <Handshake className="h-4 w-4 mr-1.5" />
                            New Deal
                          </Button>
                        </>
                      ) : company.status === 'pending' ? (
                        <Button
                          disabled
                          className="w-full"
                        >
                          <Clock className="h-4 w-4 mr-1.5" />
                          Connection Pending
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={() => handleConnect(company.id)}
                        >
                          <Users className="h-4 w-4 mr-1.5" />
                          Connect Now
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Deals header */}
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">Deal Management</h2>
                    <Badge className="bg-green-500">{deals.length} Total</Badge>
                  </div>
                  
                  <Button onClick={() => alert("Opening deal creation form")}>
                    <FileText className="h-4 w-4 mr-1.5" />
                    Create New Deal
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Deals list */}
            <Card>
              <CardHeader>
                <CardTitle>All Deals</CardTitle>
                <CardDescription>
                  Monitor and manage all your oil trading deals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deals.map(deal => (
                    <Card key={deal.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-md flex items-center justify-center ${
                              deal.status === 'completed' ? 'bg-green-500/10' : 
                              deal.status === 'in-progress' ? 'bg-yellow-500/10' : 'bg-blue-500/10'
                            }`}>
                              {deal.status === 'completed' ? (
                                <Check className={`h-5 w-5 text-green-600`} />
                              ) : deal.status === 'in-progress' ? (
                                <Clock className={`h-5 w-5 text-yellow-600`} />
                              ) : (
                                <FileText className={`h-5 w-5 text-blue-600`} />
                              )}
                            </div>
                            
                            <div>
                              <div className="flex items-center">
                                <p className="font-medium">{deal.seller} → {deal.buyer}</p>
                                <Badge className={`ml-2 ${
                                  deal.status === 'completed' ? 'bg-green-500' : 
                                  deal.status === 'in-progress' ? 'bg-yellow-500' : 'bg-blue-500'
                                }`}>
                                  {deal.status === 'completed' ? 'Completed' : 
                                   deal.status === 'in-progress' ? 'In Progress' : 'Proposed'}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 md:flex md:items-center text-sm text-muted-foreground mt-2 gap-y-1 gap-x-4">
                                <div className="flex items-center">
                                  <Ship className="h-3.5 w-3.5 mr-1" />
                                  <span>{deal.product}</span>
                                </div>
                                
                                <div className="flex items-center">
                                  <Compass className="h-3.5 w-3.5 mr-1" />
                                  <span>{deal.quantity}</span>
                                </div>
                                
                                <div className="flex items-center">
                                  <Calendar className="h-3.5 w-3.5 mr-1" />
                                  <span>{new Date(deal.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between md:justify-end gap-4 mt-3 md:mt-0">
                            <div className="text-right">
                              <p className="font-medium">{deal.value}</p>
                              <p className="text-sm text-green-600">{deal.commission} comm.</p>
                            </div>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => alert(`Viewing details for deal #${deal.id}`)}
                            >
                              Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}