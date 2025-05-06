import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation, Link } from 'wouter';
import { type Vessel, type Refinery } from '@shared/schema';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from '@/components/ui/separator';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import SimpleLeafletMap from '@/components/map/SimpleLeafletMap';
import {
  AlertCircle,
  BarChart,
  Calendar,
  ChevronLeft,
  Clock,
  CloudSun,
  Compass,
  Droplets,
  Factory,
  FileText,
  Flag,
  Globe,
  History,
  Info,
  Map,
  Menu,
  MessageSquare,
  Milestone,
  MoreHorizontal,
  Navigation,
  Ship,
  Thermometer,
  Timer,
  Truck,
  Wind,
} from 'lucide-react';

// Vessel card component to display nearby vessels
const VesselItem = ({ vessel, distance }: { vessel: Vessel, distance: number }) => {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
      <div className="flex-shrink-0 bg-background rounded-md p-2 border border-border">
        <Ship className="h-6 w-6 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-foreground truncate">{vessel.name}</h4>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <Flag className="h-3 w-3" />
          <span>{vessel.flag || 'Unknown'}</span>
          
          <span className="mx-1">•</span>
          
          <Droplets className="h-3 w-3" />
          <span>{vessel.cargoType || 'Unknown cargo'}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <Navigation className="h-3 w-3" />
          <span>{distance.toFixed(1)} km away</span>
          
          <span className="mx-1">•</span>
          
          <Clock className="h-3 w-3" />
          <span>
            {vessel.estimatedArrival 
              ? new Date(vessel.estimatedArrival).toLocaleDateString() 
              : 'Unknown ETA'}
          </span>
        </div>
      </div>
      <Link to={`/vessels/${vessel.id}`}>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">View vessel details</span>
        </Button>
      </Link>
    </div>
  );
};

export default function RefineryOverview() {
  const [, params] = useParams();
  const [, navigate] = useLocation();
  const refineryId = params.id;
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch refinery details with nearby vessels, weather, and AI insights
  const { data: refineryData, isLoading: isRefineryLoading } = useQuery<{ refinery: Refinery, vessels: Array<{ vessel: Vessel, distance: number }> }>({
    queryKey: ['/api/refineries', refineryId, 'details'],
    enabled: !!refineryId,
  });
  
  const { data: weatherData, isLoading: isWeatherLoading } = useQuery<{ 
    temperature: number, 
    conditions: string, 
    windSpeed: number, 
    windDirection: string, 
    humidity: number,
    forecast: Array<{ day: string, condition: string, temperature: number }>
  }>({
    queryKey: ['/api/refineries', refineryId, 'weather'],
    enabled: !!refineryId,
  });
  
  const { data: insightsData, isLoading: isInsightsLoading } = useQuery<{ 
    summary: string, 
    activityLevel: 'low' | 'moderate' | 'high',
    recentTrends: string,
    riskAssessment: string,
    recommendations: string[],
    keyMetrics: { label: string, value: string, change: number }[]
  }>({
    queryKey: ['/api/refineries', refineryId, 'insights'],
    enabled: !!refineryId,
  });
  
  // Handle back navigation
  const handleBack = () => {
    navigate('/refineries');
  };
  
  // If loading or no data yet, show skeleton UI
  if (isRefineryLoading || !refineryData) {
    return (
      <div className="container py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-8 w-52" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-[500px] w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-[500px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }
  
  const { refinery, vessels } = refineryData;
  
  // Generate map markers for the refinery and nearby vessels
  const mapMarkers = [
    {
      id: refinery.id,
      position: [
        typeof refinery.lat === 'number' ? refinery.lat : parseFloat(String(refinery.lat)),
        typeof refinery.lng === 'number' ? refinery.lng : parseFloat(String(refinery.lng))
      ] as [number, number],
      tooltip: `${refinery.name}`,
      type: 'refinery'
    },
    ...vessels.slice(0, 5).map(({ vessel }) => ({
      id: vessel.id,
      position: [
        typeof vessel.currentLat === 'number' ? vessel.currentLat : parseFloat(String(vessel.currentLat)),
        typeof vessel.currentLng === 'number' ? vessel.currentLng : parseFloat(String(vessel.currentLng))
      ] as [number, number],
      tooltip: vessel.name,
      type: 'ship'
    }))
  ];
  
  // Format the founded date if available
  const foundedDate = refinery.founded_year 
    ? new Date(refinery.founded_year, 0).getFullYear() 
    : 'Unknown';
  
  // Calculate refinery age
  const refineryAge = refinery.founded_year 
    ? new Date().getFullYear() - new Date(refinery.founded_year, 0).getFullYear() 
    : null;
    
  // Format capacity with proper units
  const formattedCapacity = refinery.capacity 
    ? `${refinery.capacity.toLocaleString()} bpd` 
    : 'Unknown';
  
  // Format ownership type
  const ownershipType = () => {
    if (!refinery.ownership_type) return 'Unknown';
    return refinery.ownership_type.charAt(0).toUpperCase() + refinery.ownership_type.slice(1);
  };
  
  // Format recent expansions from array or string
  const recentExpansions = () => {
    if (!refinery.recent_expansions) return [];
    
    if (typeof refinery.recent_expansions === 'string') {
      try {
        return JSON.parse(refinery.recent_expansions);
      } catch (e) {
        return [refinery.recent_expansions];
      }
    }
    
    return Array.isArray(refinery.recent_expansions) 
      ? refinery.recent_expansions 
      : [String(refinery.recent_expansions)];
  };
  
  // Format operational status
  const operationalStatus = () => {
    if (!refinery.operational_status) return 'Unknown';
    
    const status = refinery.operational_status.toLowerCase();
    if (status === 'active') return 'Active';
    if (status === 'maintenance') return 'Under Maintenance';
    if (status === 'offline') return 'Offline';
    if (status === 'construction') return 'Under Construction';
    
    return refinery.operational_status.charAt(0).toUpperCase() + refinery.operational_status.slice(1);
  };
  
  // Get status color
  const getStatusColor = () => {
    if (!refinery.operational_status) return 'default';
    
    const status = refinery.operational_status.toLowerCase();
    if (status === 'active') return 'success';
    if (status === 'maintenance') return 'warning';
    if (status === 'offline') return 'destructive';
    if (status === 'construction') return 'secondary';
    
    return 'default';
  };
  
  return (
    <div className="container py-6 max-w-7xl mx-auto">
      {/* Header with back button and refinery name */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBack} className="h-9 w-9">
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Back to refineries</span>
          </Button>
          <h1 className="text-2xl font-bold">{refinery.name}</h1>
          <Badge variant={getStatusColor()}>
            {operationalStatus()}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden md:flex items-center gap-1"
            asChild
          >
            <Link to={`/documents/generate?refinery=${refinery.id}`}>
              <FileText className="h-4 w-4" />
              <span>Generate Report</span>
            </Link>
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Refinery Options</SheetTitle>
                <SheetDescription>
                  Access tools and actions for {refinery.name}
                </SheetDescription>
              </SheetHeader>
              <div className="py-6 space-y-4">
                <Link to={`/documents/generate?refinery=${refinery.id}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </Link>
                <Link to={`/refineries/${refinery.id}/history`}>
                  <Button variant="outline" className="w-full justify-start">
                    <History className="h-4 w-4 mr-2" />
                    View History
                  </Button>
                </Link>
                <Link to={`/refineries/${refinery.id}/edit`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Milestone className="h-4 w-4 mr-2" />
                    Edit Refinery
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="hidden md:flex">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Refinery Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`/refineries/${refinery.id}/history`} className="cursor-pointer">
                  <History className="h-4 w-4 mr-2" />
                  View History
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/refineries/${refinery.id}/edit`} className="cursor-pointer">
                  <Milestone className="h-4 w-4 mr-2" />
                  Edit Refinery
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map and Tabs section - takes 2/3 of the screen on desktop */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map card */}
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-lg flex items-center gap-2">
                <Map className="h-5 w-5 text-primary" />
                Location & Nearby Vessels
              </CardTitle>
              <CardDescription>
                Interactive map showing {refinery.name} and nearby vessels
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <SimpleLeafletMap 
                markers={mapMarkers}
                center={[
                  typeof refinery.lat === 'number' ? refinery.lat : parseFloat(String(refinery.lat)),
                  typeof refinery.lng === 'number' ? refinery.lng : parseFloat(String(refinery.lng))
                ]}
                zoom={10}
                dragging={true}
                className="h-[400px]"
              />
            </CardContent>
          </Card>
          
          {/* Tabs for different content sections */}
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 pt-4">
              {/* Quick Facts Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    Quick Facts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Globe className="h-3.5 w-3.5" />
                        Country
                      </p>
                      <p className="font-medium">{refinery.country || 'Unknown'}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Factory className="h-3.5 w-3.5" />
                        Owner
                      </p>
                      <p className="font-medium">{refinery.owner || 'Unknown'}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Droplets className="h-3.5 w-3.5" />
                        Capacity
                      </p>
                      <p className="font-medium">{formattedCapacity}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Founded
                      </p>
                      <p className="font-medium">
                        {foundedDate}
                        {refineryAge && ` (${refineryAge} years)`}
                      </p>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <BarChart className="h-3.5 w-3.5" />
                        Type
                      </p>
                      <p className="font-medium">{ownershipType()}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Truck className="h-3.5 w-3.5" />
                        Products
                      </p>
                      <p className="font-medium">{refinery.primary_products?.split(',').length || 0} types</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Compass className="h-3.5 w-3.5" />
                        Region
                      </p>
                      <p className="font-medium">{refinery.region || 'Unknown'}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Timer className="h-3.5 w-3.5" />
                        Last Updated
                      </p>
                      <p className="font-medium">
                        {refinery.last_updated 
                          ? new Date(refinery.last_updated).toLocaleDateString() 
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Weather Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CloudSun className="h-5 w-5 text-primary" />
                    Current Weather
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isWeatherLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : weatherData ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-background border-muted">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">Temperature</p>
                            <p className="text-xl font-bold mt-1">{weatherData.temperature}°C</p>
                          </div>
                          <Thermometer className="h-8 w-8 text-primary" />
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-background border-muted">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">Wind</p>
                            <p className="text-xl font-bold mt-1">{weatherData.windSpeed} km/h</p>
                            <p className="text-xs text-muted-foreground">{weatherData.windDirection}</p>
                          </div>
                          <Wind className="h-8 w-8 text-primary" />
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-background border-muted">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">Conditions</p>
                            <p className="text-xl font-bold mt-1">{weatherData.conditions}</p>
                            <p className="text-xs text-muted-foreground">{weatherData.humidity}% humidity</p>
                          </div>
                          <CloudSun className="h-8 w-8 text-primary" />
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm">
                      Weather data not available
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Primary Products Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-primary" />
                    Primary Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {refinery.primary_products ? (
                    <div className="flex flex-wrap gap-2">
                      {refinery.primary_products.split(',').map((product, index) => (
                        <Badge key={index} variant="outline" className="px-3 py-1 bg-background">
                          {product.trim()}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm">
                      No product information available
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Recent Expansions Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Milestone className="h-5 w-5 text-primary" />
                    Recent Expansions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentExpansions().length > 0 ? (
                    <div className="space-y-4">
                      {recentExpansions().map((expansion, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{expansion}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm">
                      No recent expansions recorded
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* AI Insights Tab */}
            <TabsContent value="insights" className="space-y-6 pt-4">
              {isInsightsLoading ? (
                <div className="space-y-6">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-48 w-full" />
                </div>
              ) : insightsData ? (
                <>
                  {/* Activity Summary Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart className="h-5 w-5 text-primary" />
                        Activity Summary
                      </CardTitle>
                      <Badge 
                        variant={
                          insightsData.activityLevel === 'high' ? 'default' : 
                          insightsData.activityLevel === 'moderate' ? 'secondary' : 
                          'outline'
                        }
                      >
                        {insightsData.activityLevel.toUpperCase()} ACTIVITY
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground leading-relaxed">
                        {insightsData.summary}
                      </p>
                    </CardContent>
                  </Card>
                  
                  {/* Key Metrics Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart className="h-5 w-5 text-primary" />
                        Key Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {insightsData.keyMetrics.map((metric, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <p className="text-xs text-muted-foreground">{metric.label}</p>
                            <p className="text-lg font-bold mt-1">{metric.value}</p>
                            <div className={`text-xs flex items-center mt-1 ${
                              metric.change > 0 ? 'text-green-500' : 
                              metric.change < 0 ? 'text-red-500' : 
                              'text-muted-foreground'
                            }`}>
                              {metric.change > 0 ? '↑' : metric.change < 0 ? '↓' : '–'}
                              <span className="ml-1">
                                {Math.abs(metric.change)}% from last period
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Recent Trends Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart className="h-5 w-5 text-primary" />
                        Recent Trends
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground leading-relaxed">
                        {insightsData.recentTrends}
                      </p>
                    </CardContent>
                  </Card>
                  
                  {/* Risk Assessment Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-primary" />
                        Risk Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground leading-relaxed">
                        {insightsData.riskAssessment}
                      </p>
                    </CardContent>
                  </Card>
                  
                  {/* Recommendations Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        AI Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {insightsData.recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <span className="text-primary">•</span>
                            <span>{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <BarChart className="h-12 w-12 text-muted-foreground mx-auto" />
                      <h3 className="font-medium text-lg">No AI insights available</h3>
                      <p className="text-sm text-muted-foreground">
                        AI-generated insights about this refinery are not available at this time.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* History Tab */}
            <TabsContent value="history" className="space-y-6 pt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <History className="h-12 w-12 text-muted-foreground mx-auto" />
                    <h3 className="font-medium text-lg">Historical Data</h3>
                    <p className="text-sm text-muted-foreground">
                      Historical operations data will be available in a future update.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-6 pt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                    <h3 className="font-medium text-lg">Documents</h3>
                    <p className="text-sm text-muted-foreground">
                      Related documents for this refinery will be listed here.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      asChild
                    >
                      <Link to={`/documents/generate?refinery=${refinery.id}`}>
                        <FileText className="h-4 w-4 mr-2" />
                        Generate New Report
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar - takes 1/3 of the screen on desktop */}
        <div className="space-y-6">
          {/* Nearby Vessels Card */}
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-lg flex items-center gap-2">
                <Ship className="h-5 w-5 text-primary" />
                Nearby Vessels
              </CardTitle>
              <CardDescription>
                Showing vessels within 20km of this refinery
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {vessels.length > 0 ? (
                  vessels.map(({ vessel, distance }) => (
                    <VesselItem key={vessel.id} vessel={vessel} distance={distance} />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No vessels currently near this refinery
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                asChild
              >
                <Link to={`/live-vessels?refinery=${refinery.id}`}>
                  <Map className="h-4 w-4 mr-2" />
                  View All Nearby Vessels
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Refinery Details Card */}
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-lg flex items-center gap-2">
                <Factory className="h-5 w-5 text-primary" />
                Refinery Details
              </CardTitle>
              <CardDescription>
                Additional information and specifications
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {refinery.description && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                    <p className="text-sm">{refinery.description}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Coordinates</h4>
                  <p className="text-sm">
                    Lat: {typeof refinery.lat === 'number' ? refinery.lat.toFixed(6) : refinery.lat}, 
                    Lng: {typeof refinery.lng === 'number' ? refinery.lng.toFixed(6) : refinery.lng}
                  </p>
                </div>
                
                {refinery.refining_technology && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Refining Technology</h4>
                    <p className="text-sm">{refinery.refining_technology}</p>
                  </div>
                )}
                
                {refinery.storage_capacity && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Storage Capacity</h4>
                    <p className="text-sm">{refinery.storage_capacity}</p>
                  </div>
                )}
                
                {refinery.environmental_compliance && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Environmental Compliance</h4>
                    <p className="text-sm">{refinery.environmental_compliance}</p>
                  </div>
                )}
                
                {refinery.certifications && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Certifications</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {refinery.certifications.split(',').map((cert, index) => (
                        <Badge key={index} variant="outline">
                          {cert.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}