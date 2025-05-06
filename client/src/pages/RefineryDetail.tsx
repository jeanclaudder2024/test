import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams, useLocation } from 'wouter';
import { Refinery, Port } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Chart, BarElement, CategoryScale, 
  LinearScale, Tooltip, Legend 
} from 'chart.js';
import { 
  Bar, 
} from 'react-chartjs-2';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SimpleLeafletMap from '@/components/map/SimpleLeafletMap';
import { 
  ArrowLeft, Factory, Map, Edit, PieChart, Droplet, 
  CalendarClock, MapPin, Building, Phone, Globe, BriefcaseBusiness,
  Flame, Activity, Clock, Calendar, AlertTriangle, Ship, ExternalLink,
  CheckCircle, XCircle, CircleDashed, FileBarChart, BarChart3, Truck,
  Warehouse, Anchor, RefreshCw, Plus, Wrench, Shield, ShieldAlert, Thermometer, 
  BookOpen, FileText, Share2, Download, Users, CheckSquare
} from 'lucide-react';

// Register chart components
Chart.register(
  BarElement, CategoryScale, 
  LinearScale, Tooltip, Legend
);

// Helper components for refinery details
const InfoItem = ({ icon, label, value, className = "" }: { 
  icon?: React.ReactNode; 
  label: React.ReactNode; 
  value: React.ReactNode;
  className?: string;
}) => (
  <div className={`flex justify-between items-center py-2 ${className}`}>
    <span className="text-muted-foreground flex items-center">
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </span>
    <span className="font-medium">{value || 'N/A'}</span>
  </div>
);

// Function to render status badge with appropriate color
const StatusBadge = ({ status }: { status: string }) => {
  let className = "";
  let icon = <CircleDashed className="h-3 w-3 mr-1" />;
  let variant: "default" | "destructive" | "outline" | "secondary" = "default";
  
  const lowercaseStatus = status?.toLowerCase() || '';
  
  if (lowercaseStatus.includes('active') || lowercaseStatus.includes('operational')) {
    className = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900";
    icon = <CheckCircle className="h-3 w-3 mr-1" />;
  } else if (lowercaseStatus.includes('maintenance') || lowercaseStatus.includes('planned')) {
    className = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900";
    icon = <Wrench className="h-3 w-3 mr-1" />;
  } else if (lowercaseStatus.includes('offline') || lowercaseStatus.includes('shutdown')) {
    variant = "destructive";
    icon = <XCircle className="h-3 w-3 mr-1" />;
  }
  
  return (
    <Badge variant={variant} className={`flex items-center ${className}`}>
      {icon}
      {status}
    </Badge>
  );
};

// Format capacity in a reader-friendly way
const formatCapacity = (capacity: number | null): string => {
  if (!capacity) return 'N/A';
  
  if (capacity >= 1000000) {
    return `${(capacity / 1000000).toFixed(2)} million bpd`;
  } else if (capacity >= 1000) {
    return `${(capacity / 1000).toFixed(0)}k bpd`;
  } else {
    return `${capacity.toLocaleString()} bpd`;
  }
};

// Component to display KPI card
const KpiCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  subtitle, 
  trendUp = true,
  className = ""
}: { 
  title: string; 
  value: React.ReactNode; 
  icon: React.ReactNode; 
  trend?: string;
  subtitle?: string;
  trendUp?: boolean;
  className?: string;
}) => (
  <Card className={`shadow-sm ${className}`}>
    <CardContent className="p-4">
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className="p-2 rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold">{value}</span>
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
        {trend && (
          <div className={`flex items-center mt-1 text-xs ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
            {trendUp ? 
              <span className="mr-1">↑</span> : 
              <span className="mr-1">↓</span>}
            {trend}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export default function RefineryDetail() {
  const { id } = useParams<{ id: string }>();
  const refineryId = id ? parseInt(id) : null;
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch refinery details from API
  const { 
    data: refinery, 
    isLoading: refineryLoading, 
    error: refineryError 
  } = useQuery({
    queryKey: ['/api/refineries', refineryId],
    queryFn: async () => {
      if (!refineryId) return null;
      const res = await apiRequest('GET', `/api/refineries/${refineryId}`);
      return await res.json();
    },
    enabled: !!refineryId
  });
  
  // Fetch connected ports from API
  const { 
    data: connectedPorts, 
    isLoading: portsLoading,
    error: portsError 
  } = useQuery({
    queryKey: ['/api/refineries', refineryId, 'connected-ports'],
    queryFn: async () => {
      if (!refineryId) return [];
      const res = await apiRequest('GET', `/api/refineries/${refineryId}/connected-ports`);
      return await res.json();
    },
    enabled: !!refineryId
  });
  
  // Fetch vessels associated with this refinery
  const { 
    data: associatedVessels, 
    isLoading: vesselsLoading,
    error: vesselsError 
  } = useQuery({
    queryKey: ['/api/refineries', refineryId, 'vessels'],
    queryFn: async () => {
      if (!refineryId) return [];
      const res = await apiRequest('GET', `/api/refineries/${refineryId}/vessels`);
      return await res.json();
    },
    enabled: !!refineryId
  });
  
  // Parse products array from JSON string if needed
  const products = refinery?.products ? 
    (typeof refinery.products === 'string' ? 
      JSON.parse(refinery.products) : 
      refinery.products) : 
    [];
    
  // Parse technical specs from JSON string if needed
  const technicalSpecs = refinery?.technicalSpecs ?
    (typeof refinery.technicalSpecs === 'string' ?
      JSON.parse(refinery.technicalSpecs) :
      refinery.technicalSpecs) :
    {};
  
  // Handle AI enhancement for this refinery
  const handleEnhanceRefinery = async () => {
    try {
      toast({
        title: "Enhancing refinery data...",
        description: "Using AI to generate additional details",
      });
      
      const res = await apiRequest('POST', `/api/refineries/${refineryId}/enhance`);
      
      if (res.status === 400) {
        const error = await res.json();
        if (error.missingKey) {
          toast({
            title: "API Key Required",
            description: "OpenAI API key is required for this feature.",
            variant: "destructive"
          });
          return;
        }
      }
      
      if (!res.ok) {
        throw new Error(`Error enhancing refinery: ${res.statusText}`);
      }
      
      const enhancedRefinery = await res.json();
      
      toast({
        title: "Refinery data enhanced",
        description: "Additional details have been generated successfully.",
        variant: "success"
      });
      
      // Force refetch of data
      window.location.reload();
    } catch (error) {
      console.error("Error enhancing refinery:", error);
      toast({
        title: "Enhancement failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  // Chart data for production capacity
  const capacityChartData = {
    labels: ['This Refinery', 'Regional Average', 'Global Average'],
    datasets: [
      {
        label: 'Processing Capacity (thousand bpd)',
        data: [
          refinery?.capacity ? refinery.capacity / 1000 : 0,
          // Regional average (mock data - would be from API)
          refinery?.region?.includes('Middle East') ? 400 : 
          refinery?.region?.includes('Asia') ? 320 : 
          refinery?.region?.includes('North America') ? 250 : 
          refinery?.region?.includes('Europe') ? 200 : 180,
          // Global average (mock data - would be from API)
          250
        ],
        backgroundColor: [
          'rgba(53, 162, 235, 0.8)',
          'rgba(53, 162, 235, 0.5)',
          'rgba(53, 162, 235, 0.3)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.raw.toLocaleString()} thousand bpd`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Capacity (thousand bpd)'
        }
      }
    }
  };
  
  // Redirect if refinery not found and not loading
  if (refineryError || ((!refinery || Object.keys(refinery).length === 0) && !refineryLoading)) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="py-12">
          <Factory className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Refinery not found</h3>
          <p className="text-muted-foreground mb-8">
            The refinery with ID {refineryId} does not exist or was deleted.
          </p>
          <Link href="/refineries">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Refineries
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Loading state
  if (refineryLoading) {
    return (
      <div className="container mx-auto p-4">
        <Link href="/refineries">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Refineries
          </Button>
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Link href="/refineries">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Refineries
        </Button>
      </Link>
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
              refinery?.status?.toLowerCase().includes('active') ? 'bg-green-100 text-green-600' :
              refinery?.status?.toLowerCase().includes('maintenance') ? 'bg-orange-100 text-orange-600' :
              refinery?.status?.toLowerCase().includes('planned') ? 'bg-blue-100 text-blue-600' :
              refinery?.status?.toLowerCase().includes('shutdown') ? 'bg-red-100 text-red-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              <Factory className="h-6 w-6" />
            </div>
            {refinery?.name}
          </h1>
          <p className="text-muted-foreground flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {refinery?.city ? `${refinery.city}, ` : ''}{refinery?.country}, {refinery?.region}
          </p>
        </div>
        
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <StatusBadge status={refinery?.status || 'Unknown'} />
          <Button variant="outline" onClick={handleEnhanceRefinery}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Enhance Data
          </Button>
          <Button variant="default">
            <Edit className="h-4 w-4 mr-2" />
            Edit Refinery
          </Button>
        </div>
      </div>
      
      {/* Key Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard 
          title="Processing Capacity" 
          value={formatCapacity(refinery?.capacity)}
          icon={<Droplet className="h-5 w-5" />}
          subtitle="Barrels per day"
        />
        <KpiCard 
          title="Nelson Complexity" 
          value={refinery?.complexity ? parseFloat(String(refinery.complexity)).toFixed(1) : 'N/A'}
          icon={<BarChart3 className="h-5 w-5" />}
          subtitle="Index rating"
          trend={refinery?.complexity && parseFloat(String(refinery.complexity)) > 8 ? "Above average" : "Industry standard"}
          trendUp={refinery?.complexity ? parseFloat(String(refinery.complexity)) > 8 : true}
        />
        <KpiCard 
          title="Connected Ports" 
          value={!portsLoading ? (connectedPorts?.length || 0) : '...'}
          icon={<Anchor className="h-5 w-5" />}
          subtitle="Shipping connections"
        />
        <KpiCard 
          title="Current Status" 
          value={
            <StatusBadge status={refinery?.status || 'Unknown'} />
          }
          icon={<Activity className="h-5 w-5" />}
          subtitle={refinery?.status?.toLowerCase().includes('maintenance') ? 
            "Until " + (new Date().getFullYear() + 1) + "-" + (new Date().getMonth() + 1) : 
            "Last updated " + new Date().toLocaleDateString()}
        />
      </div>
      
      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="technical">Technical Specs</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="logistics">Logistics</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Map Card */}
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Map className="h-5 w-5 mr-2 text-primary" />
                    Refinery Location
                  </CardTitle>
                  <CardDescription>
                    Geographic location and surrounding area
                  </CardDescription>
                </CardHeader>
                <div className="h-[400px] relative">
                  {refinery?.lat && refinery?.lng && (
                    <SimpleLeafletMap 
                      center={[
                        parseFloat(String(refinery.lat)), 
                        parseFloat(String(refinery.lng))
                      ]} 
                      zoom={10} 
                      markers={[
                        {
                          position: [
                            parseFloat(String(refinery.lat)), 
                            parseFloat(String(refinery.lng))
                          ],
                          title: refinery.name,
                          popup: `<b>${refinery.name}</b><br>${refinery.city || ''}, ${refinery.country}<br>${formatCapacity(refinery.capacity)}`,
                          type: 'refinery'
                        },
                        ...(connectedPorts || []).map((port: any) => ({
                          position: [
                            parseFloat(String(port.lat)), 
                            parseFloat(String(port.lng))
                          ],
                          title: port.name,
                          popup: `<b>${port.name}</b><br>${port.country}<br>Distance: ${
                            port.connection?.distance ? 
                            `${parseFloat(String(port.connection.distance)).toFixed(1)} km` : 
                            'Unknown'
                          }`,
                          type: 'port'
                        }))
                      ]}
                    />
                  )}
                </div>
                <CardFooter className="pt-3">
                  <span className="text-xs text-muted-foreground">
                    Coordinates: {
                      refinery?.lat && refinery?.lng ? 
                      `${parseFloat(String(refinery.lat)).toFixed(6)}, ${parseFloat(String(refinery.lng)).toFixed(6)}` : 
                      'N/A'
                    }
                  </span>
                </CardFooter>
              </Card>
              
              {/* Description/About Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-primary" />
                    About this Refinery
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose max-w-none dark:prose-invert text-sm">
                    {refinery?.description ? (
                      <div>
                        {typeof refinery.description === 'string' && 
                          refinery.description.split('\n').map((paragraph: string, idx: number) => (
                            paragraph.trim() ? <p key={idx}>{paragraph}</p> : null
                          ))
                        }
                      </div>
                    ) : (
                      <p className="text-muted-foreground italic">
                        No detailed description available. Click "Enhance Data" to generate additional information.
                      </p>
                    )}
                  </div>
                  
                  {/* Key Facts */}
                  <div className="bg-muted/30 p-4 rounded-lg border border-border">
                    <h4 className="font-medium mb-3">Key Facts</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                      <InfoItem
                        icon={<Building className="h-4 w-4 text-primary" />}
                        label="Operator"
                        value={refinery?.operator || 'Unknown'}
                      />
                      <InfoItem
                        icon={<Users className="h-4 w-4 text-primary" />}
                        label="Owner"
                        value={refinery?.owner || 'Unknown'}
                      />
                      <InfoItem
                        icon={<Calendar className="h-4 w-4 text-primary" />}
                        label="Year Built"
                        value={refinery?.yearBuilt || 'Unknown'}
                      />
                      <InfoItem
                        icon={<FileBarChart className="h-4 w-4 text-primary" />}
                        label="Type"
                        value={refinery?.type || 'Standard Refinery'}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Chart Card - Regional Comparison */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                    Regional Capacity Comparison
                  </CardTitle>
                  <CardDescription>
                    Processing capacity compared to regional and global averages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Bar data={capacityChartData} options={chartOptions} />
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <span className="text-xs text-muted-foreground">
                    Source: Global Refinery Database (Updated {new Date().toLocaleDateString()})
                  </span>
                </CardFooter>
              </Card>
            </div>
            
            {/* Sidebar Column */}
            <div className="space-y-6">
              {/* Quick Info Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Refinery Information</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1">
                    <InfoItem
                      label="Status"
                      value={<StatusBadge status={refinery?.status || 'Unknown'} />}
                    />
                    <Separator />
                    <InfoItem
                      label="Processing Capacity"
                      value={formatCapacity(refinery?.capacity)}
                    />
                    <InfoItem
                      label="Operator"
                      value={refinery?.operator || 'Unknown'}
                    />
                    <InfoItem
                      label="Owner"
                      value={refinery?.owner || 'Unknown'}
                    />
                    <Separator />
                    <InfoItem
                      label="Type"
                      value={refinery?.type || 'Standard Refinery'}
                    />
                    <InfoItem
                      label="Year Built"
                      value={refinery?.yearBuilt || 'Unknown'}
                    />
                    <InfoItem
                      label="Last Maintenance"
                      value={refinery?.lastMaintenance ? 
                        new Date(refinery.lastMaintenance).toLocaleDateString() : 
                        'Unknown'
                      }
                    />
                    <InfoItem
                      label="Next Maintenance"
                      value={refinery?.nextMaintenance ? 
                        new Date(refinery.nextMaintenance).toLocaleDateString() : 
                        'Not scheduled'
                      }
                    />
                    <Separator />
                    <InfoItem
                      label="Location"
                      value={`${refinery?.city ? refinery.city + ', ' : ''}${refinery?.country || 'Unknown'}`}
                    />
                    <InfoItem
                      label="Region"
                      value={refinery?.region || 'Unknown'}
                    />
                    <InfoItem
                      label="Address"
                      value={refinery?.address || 'Unknown'}
                    />
                    <Separator />
                    <InfoItem
                      label="Email"
                      value={refinery?.email || 'Unknown'}
                    />
                    <InfoItem
                      label="Phone"
                      value={refinery?.phone || 'Unknown'}
                    />
                    <InfoItem
                      label="Website"
                      value={refinery?.website ? (
                        <a 
                          href={refinery.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary flex items-center"
                        >
                          {refinery.website.replace(/^https?:\/\//, '')}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      ) : 'Unknown'}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Products Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Droplet className="h-5 w-5 mr-2 text-primary" />
                    Products
                  </CardTitle>
                  <CardDescription>
                    Main products produced at this refinery
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {products && products.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {products.map((product: string, idx: number) => (
                        <div key={idx} className="flex items-center">
                          <CheckSquare className="h-4 w-4 mr-2 text-primary" />
                          <span>{product}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground italic">
                      No product information available
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Connected Ports Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Anchor className="h-5 w-5 mr-2 text-primary" />
                    Connected Ports
                  </CardTitle>
                  <CardDescription>
                    Ports connected to this refinery
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {portsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">Loading ports...</p>
                    </div>
                  ) : connectedPorts && connectedPorts.length > 0 ? (
                    <div className="space-y-2">
                      {connectedPorts.slice(0, 5).map((port: any) => (
                        <div key={port.id} className="flex justify-between items-center py-1 text-sm">
                          <div className="flex items-center">
                            <Ship className="h-4 w-4 mr-2 text-primary" />
                            <span>{port.name}</span>
                          </div>
                          <div className="text-muted-foreground">
                            {port.connection?.distance ? `${parseFloat(String(port.connection.distance)).toFixed(1)} km` : 'N/A'}
                          </div>
                        </div>
                      ))}
                      {connectedPorts.length > 5 && (
                        <Button 
                          variant="link" 
                          className="px-0 h-auto py-0 text-xs"
                          onClick={() => setActiveTab("logistics")}
                        >
                          View all {connectedPorts.length} ports
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground italic">
                      No connected ports found
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Technical Specs Tab */}
        <TabsContent value="technical" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Technical Specifications Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wrench className="h-5 w-5 mr-2 text-primary" />
                    Technical Specifications
                  </CardTitle>
                  <CardDescription>
                    Detailed technical data for {refinery?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(technicalSpecs).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="process-units">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center text-left">
                                <Factory className="h-4 w-4 mr-2 text-primary" />
                                <span>Process Units</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 py-2 pl-6 text-sm">
                                {technicalSpecs.processUnits ? (
                                  Object.entries(technicalSpecs.processUnits).map(([key, value]: [string, any]) => (
                                    <div key={key} className="flex justify-between">
                                      <span className="text-muted-foreground">{key}</span>
                                      <span className="font-medium">{value}</span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-muted-foreground italic">No process unit data available</div>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="storage-capacity">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center text-left">
                                <Warehouse className="h-4 w-4 mr-2 text-primary" />
                                <span>Storage Capacity</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 py-2 pl-6 text-sm">
                                {technicalSpecs.storageCapacity ? (
                                  Object.entries(technicalSpecs.storageCapacity).map(([key, value]: [string, any]) => (
                                    <div key={key} className="flex justify-between">
                                      <span className="text-muted-foreground">{key}</span>
                                      <span className="font-medium">{value}</span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-muted-foreground italic">No storage capacity data available</div>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="operational-metrics">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center text-left">
                                <Activity className="h-4 w-4 mr-2 text-primary" />
                                <span>Operational Metrics</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 py-2 pl-6 text-sm">
                                {technicalSpecs.operationalMetrics ? (
                                  Object.entries(technicalSpecs.operationalMetrics).map(([key, value]: [string, any]) => (
                                    <div key={key} className="flex justify-between">
                                      <span className="text-muted-foreground">{key}</span>
                                      <span className="font-medium">{value}</span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-muted-foreground italic">No operational metrics available</div>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                      
                      <div className="space-y-4">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="environmental">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center text-left">
                                <Globe className="h-4 w-4 mr-2 text-primary" />
                                <span>Environmental Systems</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 py-2 pl-6 text-sm">
                                {technicalSpecs.environmentalSystems ? (
                                  Object.entries(technicalSpecs.environmentalSystems).map(([key, value]: [string, any]) => (
                                    <div key={key} className="flex justify-between">
                                      <span className="text-muted-foreground">{key}</span>
                                      <span className="font-medium">{value}</span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-muted-foreground italic">No environmental data available</div>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="utilities">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center text-left">
                                <Thermometer className="h-4 w-4 mr-2 text-primary" />
                                <span>Utilities & Infrastructure</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 py-2 pl-6 text-sm">
                                {technicalSpecs.utilities ? (
                                  Object.entries(technicalSpecs.utilities).map(([key, value]: [string, any]) => (
                                    <div key={key} className="flex justify-between">
                                      <span className="text-muted-foreground">{key}</span>
                                      <span className="font-medium">{value}</span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-muted-foreground italic">No utilities data available</div>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="safety">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center text-left">
                                <Shield className="h-4 w-4 mr-2 text-primary" />
                                <span>Safety Systems</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 py-2 pl-6 text-sm">
                                {technicalSpecs.safetySystems ? (
                                  Object.entries(technicalSpecs.safetySystems).map(([key, value]: [string, any]) => (
                                    <div key={key} className="flex justify-between">
                                      <span className="text-muted-foreground">{key}</span>
                                      <span className="font-medium">{value}</span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-muted-foreground italic">No safety systems data available</div>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="mb-4">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No Technical Specifications Available</h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-4">
                        Technical specifications for this refinery haven't been added yet. You can enhance the data to generate detailed specifications.
                      </p>
                      <Button onClick={handleEnhanceRefinery}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Generate Technical Specs
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Complexity Analysis Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                    Complexity Analysis
                  </CardTitle>
                  <CardDescription>
                    Nelson Complexity Index: {refinery?.complexity ? parseFloat(String(refinery.complexity)).toFixed(1) : 'N/A'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Nelson Complexity Index (NCI)</span>
                        <span className="font-medium">{refinery?.complexity ? parseFloat(String(refinery.complexity)).toFixed(1) : 'N/A'}/15.0</span>
                      </div>
                      <Progress 
                        value={refinery?.complexity ? (parseFloat(String(refinery.complexity)) / 15) * 100 : 0} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Simple</span>
                        <span>Moderate</span>
                        <span>Complex</span>
                      </div>
                    </div>
                    
                    <div className="text-sm space-y-2">
                      <p>
                        The Nelson Complexity Index (NCI) is a measure of secondary conversion capacity in comparison to the primary distillation capacity of a refinery.
                      </p>
                      <p className="text-muted-foreground">
                        Refineries with higher complexity indices are capable of processing lower quality crude oil into higher value products, thus typically commanding a market premium.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="bg-muted/30 p-3 rounded-lg border border-border">
                          <h4 className="font-medium mb-1 flex items-center">
                            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                            Simple (1-5)
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Basic topping and hydroskimming operations with limited conversion capability
                          </p>
                        </div>
                        
                        <div className="bg-muted/30 p-3 rounded-lg border border-border">
                          <h4 className="font-medium mb-1 flex items-center">
                            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                            Moderate (5-10)
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Includes catalytic cracking and reforming units for increased gasoline production
                          </p>
                        </div>
                        
                        <div className="bg-muted/30 p-3 rounded-lg border border-border">
                          <h4 className="font-medium mb-1 flex items-center">
                            <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                            Complex (10-15+)
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Full conversion with hydrocracking, coking, and deep conversion technologies
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              {/* Quick Technical Summary Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Technical Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1">
                    <InfoItem
                      label="Refinery Type"
                      value={refinery?.type || 'Standard Refinery'}
                    />
                    <InfoItem
                      label="Complexity Index"
                      value={refinery?.complexity ? parseFloat(String(refinery.complexity)).toFixed(1) : 'N/A'}
                    />
                    <Separator />
                    <InfoItem
                      label="Processing Units"
                      value={technicalSpecs?.processUnitCount || 'Unknown'}
                    />
                    <InfoItem
                      label="Storage Capacity"
                      value={technicalSpecs?.totalStorageCapacity || 'Unknown'}
                    />
                    <InfoItem
                      label="Crude Intake"
                      value={technicalSpecs?.crudeIntakeCapacity || 'Unknown'}
                    />
                    <Separator />
                    <InfoItem
                      label="Sulfur Recovery"
                      value={technicalSpecs?.sulfurRecoveryCapacity || 'Unknown'}
                    />
                    <InfoItem
                      label="Water Treatment"
                      value={technicalSpecs?.waterTreatmentCapacity || 'Unknown'}
                    />
                    <InfoItem
                      label="Power Generation"
                      value={technicalSpecs?.powerGenerationCapacity || 'Unknown'}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Products Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Droplet className="h-5 w-5 mr-2 text-primary" />
                    Products
                  </CardTitle>
                  <CardDescription>
                    Main products produced at this refinery
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {products && products.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {products.map((product: string, idx: number) => (
                        <div key={idx} className="flex items-center">
                          <CheckSquare className="h-4 w-4 mr-2 text-primary" />
                          <span>{product}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground italic">
                      No product information available
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Maintenance Schedule Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Wrench className="h-5 w-5 mr-2 text-primary" />
                    Maintenance Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Last Maintenance</p>
                        <p className="text-sm text-muted-foreground">
                          {refinery?.lastMaintenance ? 
                            new Date(refinery.lastMaintenance).toLocaleDateString() : 
                            'No data available'
                          }
                        </p>
                      </div>
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center
                        ${refinery?.status?.toLowerCase().includes('maintenance') ? 
                          'bg-orange-100 text-orange-600' : 
                          'bg-green-100 text-green-600'
                        }`}
                      >
                        {refinery?.status?.toLowerCase().includes('maintenance') ? 
                          <Wrench className="h-5 w-5" /> : 
                          <CheckCircle className="h-5 w-5" />
                        }
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Next Planned Maintenance</p>
                        <p className="text-sm text-muted-foreground">
                          {refinery?.nextMaintenance ? 
                            new Date(refinery.nextMaintenance).toLocaleDateString() : 
                            'Not scheduled'
                          }
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
                        <CalendarClock className="h-5 w-5" />
                      </div>
                    </div>
                    
                    {refinery?.status?.toLowerCase().includes('maintenance') && (
                      <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-md border border-orange-200 dark:border-orange-900">
                        <div className="flex items-start">
                          <AlertTriangle className="h-5 w-5 text-orange-500 mr-2 mt-0.5" />
                          <div>
                            <p className="font-medium text-orange-800 dark:text-orange-300">Currently Under Maintenance</p>
                            <p className="text-sm text-orange-700 dark:text-orange-400">
                              This refinery is currently undergoing scheduled maintenance work.
                              Expected completion: {
                                refinery?.nextMaintenance ? 
                                new Date(refinery.nextMaintenance).toLocaleDateString() : 
                                'Unknown'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Operations Tab */}
        <TabsContent value="operations">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-primary" />
                    Operational Status
                  </CardTitle>
                  <CardDescription>
                    Current operations and metrics for {refinery?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Current Status Section */}
                    <div className="bg-muted/30 p-4 rounded-lg border border-border">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 pb-3 border-b border-primary/10">
                        <div className="flex items-center mb-2 sm:mb-0">
                          <div className={`h-12 w-12 rounded-full flex items-center justify-center mr-3 ${
                            refinery?.status?.toLowerCase().includes('active') ? 'bg-green-100 text-green-600 ring-2 ring-green-200' :
                            refinery?.status?.toLowerCase().includes('maintenance') ? 'bg-orange-100 text-orange-600 ring-2 ring-orange-200' :
                            refinery?.status?.toLowerCase().includes('planned') ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-200' :
                            refinery?.status?.toLowerCase().includes('shutdown') ? 'bg-red-100 text-red-600 ring-2 ring-red-200' :
                            'bg-gray-100 text-gray-600 ring-2 ring-gray-200'
                          }`}>
                            {refinery?.status?.toLowerCase().includes('active') ? <CheckCircle className="h-6 w-6" /> : 
                             refinery?.status?.toLowerCase().includes('maintenance') ? <Wrench className="h-6 w-6" /> :
                             refinery?.status?.toLowerCase().includes('planned') ? <CalendarClock className="h-6 w-6" /> :
                             refinery?.status?.toLowerCase().includes('shutdown') ? <XCircle className="h-6 w-6" /> :
                             <CircleDashed className="h-6 w-6" />}
                          </div>
                          <div>
                            <h3 className="font-medium text-lg">Current Status: <StatusBadge status={refinery?.status || 'Unknown'} /></h3>
                            <p className="text-sm text-muted-foreground flex items-center">
                              {!refinery?.status?.toLowerCase().includes('maintenance') ? (
                                <>
                                  <Clock className="h-3 w-3 mr-1" /> 
                                  Last updated: {new Date().toLocaleString()}
                                </>
                              ) : (
                                <>
                                  <CalendarClock className="h-3 w-3 mr-1" /> 
                                  Maintenance until: {
                                    refinery?.nextMaintenance ? 
                                    new Date(refinery.nextMaintenance).toLocaleString() : 
                                    'Unknown'
                                  }
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Capacity Utilization */}
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm flex items-center text-muted-foreground">
                            <Droplet className="h-4 w-4 mr-1 text-primary/60" /> Current Utilization
                          </span>
                          <span className="text-sm font-medium">
                            {refinery?.status?.toLowerCase().includes('active') ? '92%' : 
                             refinery?.status?.toLowerCase().includes('maintenance') ? '15%' :
                             refinery?.status?.toLowerCase().includes('planned') ? '0%' :
                             refinery?.status?.toLowerCase().includes('shutdown') ? '0%' : 
                             'Unknown'}
                          </span>
                        </div>
                        <Progress
                          value={refinery?.status?.toLowerCase().includes('active') ? 92 : 
                                refinery?.status?.toLowerCase().includes('maintenance') ? 15 :
                                0}
                          className={`h-2 ${
                            refinery?.status?.toLowerCase().includes('active') ? '[--progress-foreground:theme(colors.green.500)]' :
                            refinery?.status?.toLowerCase().includes('maintenance') ? '[--progress-foreground:theme(colors.orange.500)]' :
                            refinery?.status?.toLowerCase().includes('planned') ? '[--progress-foreground:theme(colors.blue.500)]' :
                            '[--progress-foreground:theme(colors.red.500)]'
                          }`}
                        />
                      </div>
                      
                      {/* Status Messages */}
                      {refinery?.status?.toLowerCase().includes('maintenance') && (
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-md border border-orange-200 dark:border-orange-800 mb-4">
                          <div className="flex">
                            <AlertTriangle className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-orange-800 dark:text-orange-300">Scheduled Maintenance In Progress</p>
                              <p className="text-sm text-orange-700 dark:text-orange-400">
                                This refinery is currently operating at reduced capacity due to planned maintenance activities.
                                Limited production is still available for critical products.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {refinery?.status?.toLowerCase().includes('shutdown') && (
                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800 mb-4">
                          <div className="flex">
                            <ShieldAlert className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-red-800 dark:text-red-300">Refinery Temporarily Shutdown</p>
                              <p className="text-sm text-red-700 dark:text-red-400">
                                All production operations are currently halted. Please refer to the operational notes for details
                                on the expected restart timeline.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {refinery?.status?.toLowerCase().includes('active') && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-800 mb-4">
                          <div className="flex">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-green-800 dark:text-green-300">Fully Operational</p>
                              <p className="text-sm text-green-700 dark:text-green-400">
                                All production units are functioning at optimal capacity. Current operations are proceeding 
                                according to schedule with no significant disruptions.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Processing Units Table */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">Processing Units Status</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Unit</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Utilization</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {technicalSpecs?.processUnits ? (
                            Object.entries(technicalSpecs.processUnits).map(([name, capacity]: [string, any], idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">{name}</TableCell>
                                <TableCell>{capacity}</TableCell>
                                <TableCell>
                                  <StatusBadge status={
                                    refinery?.status?.toLowerCase().includes('shutdown') ? 'Offline' :
                                    refinery?.status?.toLowerCase().includes('maintenance') && Math.random() > 0.7 ? 'Maintenance' :
                                    'Operational'
                                  } />
                                </TableCell>
                                <TableCell className="text-right">
                                  {refinery?.status?.toLowerCase().includes('shutdown') ? '0%' :
                                   refinery?.status?.toLowerCase().includes('maintenance') ? 
                                   Math.floor(Math.random() * 30) + '%' :
                                   Math.floor(Math.random() * 20 + 80) + '%'}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-4 text-muted-foreground italic">
                                No processing units data available
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              {/* Operations Summary */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Operations Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1">
                    <InfoItem
                      label="Current Status"
                      value={<StatusBadge status={refinery?.status || 'Unknown'} />}
                    />
                    <InfoItem
                      label="Utilization"
                      value={refinery?.status?.toLowerCase().includes('active') ? '92%' : 
                             refinery?.status?.toLowerCase().includes('maintenance') ? '15%' :
                             refinery?.status?.toLowerCase().includes('planned') ? '0%' :
                             refinery?.status?.toLowerCase().includes('shutdown') ? '0%' : 
                             'Unknown'}
                    />
                    <Separator />
                    <InfoItem
                      label="Operator"
                      value={refinery?.operator || 'Unknown'}
                    />
                    <InfoItem
                      label="Owner"
                      value={refinery?.owner || 'Unknown'}
                    />
                    <Separator />
                    <InfoItem
                      label="Next Maintenance"
                      value={refinery?.nextMaintenance ? 
                        new Date(refinery.nextMaintenance).toLocaleDateString() : 
                        'Not scheduled'
                      }
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Operational Notes */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    Operational Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {refinery?.status?.toLowerCase().includes('active') ? (
                      <>
                        <div className="bg-muted/30 p-3 rounded-lg border border-border">
                          <p className="text-sm font-medium">Current Production at Full Capacity</p>
                          <p className="text-xs text-muted-foreground">
                            All units operating at optimal levels with no significant issues reported.
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Last updated: {new Date().toLocaleDateString()}
                          </p>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-lg border border-border">
                          <p className="text-sm font-medium">Scheduled Inspection Upcoming</p>
                          <p className="text-xs text-muted-foreground">
                            Routine inspection scheduled for next quarter with no expected production impact.
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Date: {new Date(new Date().setMonth(new Date().getMonth() + 3)).toLocaleDateString()}
                          </p>
                        </div>
                      </>
                    ) : refinery?.status?.toLowerCase().includes('maintenance') ? (
                      <>
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                          <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                            Maintenance Schedule Update
                          </p>
                          <p className="text-xs text-orange-700 dark:text-orange-400">
                            Catalytic cracker unit overhaul in progress. Expected to be completed in two weeks.
                          </p>
                          <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                            Completion: {new Date(new Date().setDate(new Date().getDate() + 14)).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-lg border border-border">
                          <p className="text-sm font-medium">
                            Limited Production Continuing
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Hydrocracker and atmospheric distillation units remain operational.
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground italic">
                        No operational notes available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Inspections Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                    Inspection History
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">Annual Safety Inspection</p>
                        <p className="text-xs text-muted-foreground">Result: Passed</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(new Date().setMonth(new Date().getMonth() - 4)).toLocaleDateString()}
                      </p>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">Environmental Compliance</p>
                        <p className="text-xs text-muted-foreground">Result: Compliant</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(new Date().setMonth(new Date().getMonth() - 2)).toLocaleDateString()}
                      </p>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">Process Safety Assessment</p>
                        <p className="text-xs text-muted-foreground">Result: Passed with notes</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(new Date().setMonth(new Date().getMonth() - 6)).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Logistics Tab */}
        <TabsContent value="logistics">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Map View with Connected Ports */}
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Map className="h-5 w-5 mr-2 text-primary" />
                    Logistics Network
                  </CardTitle>
                  <CardDescription>
                    Refinery and connected ports with shipping routes
                  </CardDescription>
                </CardHeader>
                <div className="h-[500px] relative">
                  {refinery?.lat && refinery?.lng && (
                    <SimpleLeafletMap 
                      center={[
                        parseFloat(String(refinery.lat)), 
                        parseFloat(String(refinery.lng))
                      ]} 
                      zoom={6} 
                      markers={[
                        {
                          position: [
                            parseFloat(String(refinery.lat)), 
                            parseFloat(String(refinery.lng))
                          ],
                          title: refinery.name,
                          popup: `<b>${refinery.name}</b><br>${refinery.city || ''}, ${refinery.country}<br>${formatCapacity(refinery.capacity)}`,
                          type: 'refinery'
                        },
                        ...(connectedPorts || []).map((port: any) => ({
                          position: [
                            parseFloat(String(port.lat)), 
                            parseFloat(String(port.lng))
                          ],
                          title: port.name,
                          popup: `<b>${port.name}</b><br>${port.country}<br>Distance: ${
                            port.connection?.distance ? 
                            `${parseFloat(String(port.connection.distance)).toFixed(1)} km` : 
                            'Unknown'
                          }`,
                          type: 'port'
                        }))
                      ]}
                      showConnections={true}
                      centralPoint={[parseFloat(String(refinery.lat)), parseFloat(String(refinery.lng))]}
                    />
                  )}
                </div>
                <CardFooter className="py-3 flex justify-between">
                  <span className="text-xs text-muted-foreground">
                    Showing {connectedPorts?.length || 0} connected ports
                  </span>
                  
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Map
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Connected Ports Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Anchor className="h-5 w-5 mr-2 text-primary" />
                    Connected Ports
                  </CardTitle>
                  <CardDescription>
                    Ports with connections to {refinery?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {portsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-4">Loading port data...</p>
                    </div>
                  ) : connectedPorts && connectedPorts.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Port</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Distance</TableHead>
                          <TableHead>Est. Transit Time</TableHead>
                          <TableHead>Connection Type</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {connectedPorts.map((port: any) => (
                          <TableRow key={port.id}>
                            <TableCell className="font-medium">{port.name}</TableCell>
                            <TableCell>{port.country}</TableCell>
                            <TableCell>
                              {port.connection?.distance ? 
                                `${parseFloat(String(port.connection.distance)).toFixed(1)} km` : 
                                'Unknown'}
                            </TableCell>
                            <TableCell>
                              {port.connection?.transitTimeHours ? 
                                `${port.connection.transitTimeHours} hours` : 
                                port.connection?.transitTimeDays ?
                                `${port.connection.transitTimeDays} days` :
                                'Unknown'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {port.connection?.connectionType || 'Standard'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <div className="mb-4">
                        <Anchor className="h-12 w-12 mx-auto text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No Connected Ports Found</h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-4">
                        This refinery doesn't have any connected ports in the database yet.
                      </p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Port Connection
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Associated Vessels */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Ship className="h-5 w-5 mr-2 text-primary" />
                    Associated Vessels
                  </CardTitle>
                  <CardDescription>
                    Vessels that operate with this refinery
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {vesselsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-4">Loading vessel data...</p>
                    </div>
                  ) : associatedVessels && associatedVessels.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vessel</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Flag</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Update</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {associatedVessels.map((vessel: any) => (
                          <TableRow key={vessel.id}>
                            <TableCell className="font-medium">
                              <Link href={`/vessels/${vessel.id}`} className="text-primary hover:underline">
                                {vessel.name}
                              </Link>
                            </TableCell>
                            <TableCell>{vessel.vesselType}</TableCell>
                            <TableCell>{vessel.flag}</TableCell>
                            <TableCell>
                              {vessel.departurePort?.includes(`REF:${refineryId}:`) ? 
                                <Badge variant="success">Departed</Badge> : 
                                vessel.destinationPort?.includes(`REF:${refineryId}:`) ?
                                <Badge>En Route</Badge> :
                                <Badge variant="outline">Connected</Badge>
                              }
                            </TableCell>
                            <TableCell>
                              {vessel.lastUpdated ? 
                                new Date(vessel.lastUpdated).toLocaleDateString() : 
                                'Unknown'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <div className="mb-4">
                        <Ship className="h-12 w-12 mx-auto text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No Associated Vessels</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        No vessels are currently associated with this refinery.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              {/* Logistics Summary */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Logistics Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1">
                    <InfoItem
                      label="Connected Ports"
                      value={connectedPorts?.length || 0}
                    />
                    <InfoItem
                      label="Associated Vessels"
                      value={associatedVessels?.length || 0}
                    />
                    <Separator />
                    <InfoItem
                      label="Nearest Port"
                      value={connectedPorts && connectedPorts.length > 0 ? 
                        connectedPorts.sort((a, b) => 
                          parseFloat(a.connection?.distance || '999999') - 
                          parseFloat(b.connection?.distance || '999999')
                        )[0].name : 'None'
                      }
                    />
                    <InfoItem
                      label="Typical Transit Time"
                      value={connectedPorts && connectedPorts.length > 0 && 
                        connectedPorts[0].connection?.transitTimeHours ? 
                        `${connectedPorts[0].connection.transitTimeHours} hours` : 'Variable'
                      }
                    />
                    <Separator />
                    <InfoItem
                      label="Primary Connection Type"
                      value={connectedPorts && connectedPorts.length > 0 ? 
                        (connectedPorts[0].connection?.connectionType || 'Standard') : 'N/A'
                      }
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Transportation Methods */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Truck className="h-5 w-5 mr-2 text-primary" />
                    Transportation Methods
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="bg-muted/30 p-3 rounded-lg border border-border">
                      <p className="text-sm font-medium flex items-center">
                        <Ship className="h-4 w-4 mr-2 text-primary" />
                        Marine Transportation
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Primary method for crude oil import and product export. Connected to {connectedPorts?.length || 0} ports.
                      </p>
                    </div>
                    
                    <div className="bg-muted/30 p-3 rounded-lg border border-border">
                      <p className="text-sm font-medium flex items-center">
                        <Droplet className="h-4 w-4 mr-2 text-primary" />
                        Pipeline Networks
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Connected to regional distribution network for domestic market supply.
                      </p>
                    </div>
                    
                    <div className="bg-muted/30 p-3 rounded-lg border border-border">
                      <p className="text-sm font-medium flex items-center">
                        <Truck className="h-4 w-4 mr-2 text-primary" />
                        Road Transportation
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Used for specialty products and local distribution within 200km radius.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Storage Capacity */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Warehouse className="h-5 w-5 mr-2 text-primary" />
                    Storage Capacity
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {technicalSpecs?.storageCapacity ? (
                    <div className="space-y-3">
                      {Object.entries(technicalSpecs.storageCapacity).map(([key, value]: [string, any], idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-sm">{key}</span>
                          <span className="text-sm font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground italic">
                      No storage capacity data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Documents Tab */}
        <TabsContent value="documents">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    Refinery Documentation
                  </CardTitle>
                  <CardDescription>
                    Technical and operational documents for {refinery?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="mb-4">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Documents Available</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-4">
                      There are currently no documents available for this refinery.
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Document
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              {/* Document Categories */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Document Categories</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1">
                    <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                      <Share2 className="h-4 w-4 mr-2" />
                      Technical Specifications
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                      <FileBarChart className="h-4 w-4 mr-2" />
                      Operational Reports
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                      <Shield className="h-4 w-4 mr-2" />
                      Safety Documentation
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                      <Globe className="h-4 w-4 mr-2" />
                      Environmental Compliance
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}