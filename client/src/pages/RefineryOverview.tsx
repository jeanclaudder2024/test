import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Refinery, Vessel } from '@shared/schema';
import { formatDistance } from 'date-fns';
import { MapPinIcon, AlertTriangle, ThermometerIcon, DropletIcon, Cloud, Wind, SunIcon, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import SimpleLeafletMap from '@/components/map/SimpleLeafletMap';

// Weather card component
const WeatherCard = ({ weather, isLoading }: { weather: any, isLoading: boolean }) => {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <ThermometerIcon className="h-5 w-5" />
            Weather Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <ThermometerIcon className="h-5 w-5" />
            Weather Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex flex-col items-center justify-center p-4 text-muted-foreground">
            <Cloud className="h-10 w-10 mb-2 opacity-50" />
            <p>Weather data unavailable</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <ThermometerIcon className="h-5 w-5" />
          Weather Conditions
        </CardTitle>
        <CardDescription>
          Last updated: {formatDistance(new Date(weather.lastUpdated), new Date(), { addSuffix: true })}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <ThermometerIcon className="h-4 w-4 text-orange-500" />
            <span className="text-sm">{weather.temperature}°C</span>
          </div>
          <div className="flex items-center gap-2">
            <DropletIcon className="h-4 w-4 text-blue-500" />
            <span className="text-sm">{weather.humidity}% Humidity</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-slate-500" />
            <span className="text-sm">{weather.windSpeed} km/h {weather.windDirection}</span>
          </div>
          <div className="flex items-center gap-2">
            <Cloud className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{weather.conditions}</span>
          </div>
          <div className="flex items-center gap-2">
            <SunIcon className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">UV: {weather.uvIndex}/10</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Seas: {weather.seaState}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Insights card component
const InsightsCard = ({ insights, isLoading, onRefresh }: { 
  insights: any, 
  isLoading: boolean,
  onRefresh: () => void 
}) => {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">AI Analysis</CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium">AI Analysis</CardTitle>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Generate
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex flex-col items-center justify-center p-4 text-muted-foreground">
            <p>No insights available. Click Generate to analyze refinery data.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">AI Analysis</CardTitle>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
        <CardDescription>
          {insights.generated_at && (
            <>Generated {formatDistance(new Date(insights.generated_at), new Date(), { addSuffix: true })}</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2 space-y-3">
        <div>
          <p className="font-medium text-sm">Summary</p>
          <p className="text-sm text-muted-foreground">{insights.summary}</p>
        </div>
        <Separator />
        <div>
          <p className="font-medium text-sm">Operations</p>
          <p className="text-sm text-muted-foreground">{insights.operational_insights}</p>
        </div>
        <div>
          <p className="font-medium text-sm">Supply Chain</p>
          <p className="text-sm text-muted-foreground">{insights.supply_chain_status}</p>
        </div>
        <div>
          <p className="font-medium text-sm">Market Impact</p>
          <p className="text-sm text-muted-foreground">{insights.market_impact}</p>
        </div>
        <Separator />
        <div>
          <p className="font-medium text-sm">Recommendations</p>
          <p className="text-sm text-muted-foreground">{insights.recommendations}</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Vessel item component
const VesselItem = ({ vessel, distance }: { vessel: Vessel, distance: number }) => {
  return (
    <div className="rounded-md border p-4 mb-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-medium text-base">{vessel.name}</h4>
          <p className="text-sm text-muted-foreground">
            {vessel.flag} · {vessel.vesselType}
          </p>
        </div>
        <Badge variant="outline">{distance.toFixed(1)} km</Badge>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
        <div className="text-xs">
          <span className="text-muted-foreground">Cargo: </span>
          <span>{vessel.cargoType || 'Unknown'}</span>
        </div>
        <div className="text-xs">
          <span className="text-muted-foreground">Capacity: </span>
          <span>{vessel.cargoCapacity?.toLocaleString() || 'Unknown'}</span>
        </div>
        <div className="text-xs">
          <span className="text-muted-foreground">IMO: </span>
          <span>{vessel.imo || 'Unknown'}</span>
        </div>
        <div className="text-xs">
          <span className="text-muted-foreground">Built: </span>
          <span>{vessel.built || 'Unknown'}</span>
        </div>
      </div>
    </div>
  );
};

// Status renderer
const StatusBadge = ({ status }: { status: string }) => {
  const statusMap: { [key: string]: { label: string, variant: "default" | "secondary" | "destructive" | "outline" } } = {
    operational: { label: "Operational", variant: "default" },
    maintenance: { label: "Maintenance", variant: "secondary" },
    shutdown: { label: "Shutdown", variant: "destructive" },
    construction: { label: "Under Construction", variant: "outline" },
    planned: { label: "Planned", variant: "outline" }
  };

  const { label, variant } = statusMap[status?.toLowerCase()] || { label: status, variant: "outline" };

  return <Badge variant={variant}>{label}</Badge>;
};

// Main Refinery Overview component
export default function RefineryOverview() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const refineryId = parseInt(id);

  // Fetch refinery details
  const { data: refinery, isLoading: isRefineryLoading, error: refineryError } = useQuery<Refinery>({
    queryKey: [`/api/refineries/${refineryId}`],
    enabled: !isNaN(refineryId)
  });

  // Fetch nearby vessels
  const { data: vesselsData, isLoading: isVesselsLoading } = useQuery<{ refinery: Refinery, vessels: Array<{ vessel: Vessel, distance: number }> }>({
    queryKey: [`/api/refineries/${refineryId}/vessels`],
    enabled: !isNaN(refineryId)
  });

  // Fetch weather data
  const { data: weatherData, isLoading: isWeatherLoading } = useQuery<any>({
    queryKey: [`/api/refineries/${refineryId}/weather`],
    enabled: !isNaN(refineryId)
  });

  // Fetch AI insights
  const { 
    data: insightsData, 
    isLoading: isInsightsLoading, 
    refetch: refetchInsights 
  } = useQuery<any>({
    queryKey: [`/api/refineries/${refineryId}/insights`],
    enabled: !isNaN(refineryId)
  });

  useEffect(() => {
    if (refineryError) {
      toast({
        title: "Error",
        description: "Failed to load refinery data. Please try again.",
        variant: "destructive"
      });
    }
  }, [refineryError, toast]);

  if (isNaN(refineryId)) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Invalid Refinery ID</h2>
          <p className="mb-6 text-muted-foreground">The requested refinery ID is not valid.</p>
          <Button asChild>
            <Link href="/refineries">Back to Refineries</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleRefreshInsights = () => {
    refetchInsights();
    toast({
      title: "Generating insights",
      description: "AI is analyzing refinery and vessel data...",
    });
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header section */}
      <div className="flex flex-col-reverse sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/refineries">
              <Button variant="ghost" size="sm" className="gap-1">
                Refineries
              </Button>
            </Link>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-2xl font-bold">
              {isRefineryLoading ? <Skeleton className="h-9 w-48" /> : refinery?.name}
            </h1>
            {refinery?.status && <StatusBadge status={refinery.status} />}
          </div>
          <div className="flex items-center text-muted-foreground">
            {isRefineryLoading ? (
              <Skeleton className="h-5 w-36" />
            ) : (
              <>
                <MapPinIcon className="h-4 w-4 mr-1" />
                <span>{refinery?.country}, {refinery?.region}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/refinery-logs/${refineryId}`}>Logs</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/refinery-security/${refineryId}`}>Security</Link>
          </Button>
          <Button asChild>
            <Link href={`/refinery-edit/${refineryId}`}>Edit</Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vessels">Nearby Vessels</TabsTrigger>
          <TabsTrigger value="logistics">Logistics</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        {/* Overview tab content */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main info */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Refinery Information</CardTitle>
                <CardDescription>
                  Key details about the refinery operation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isRefineryLoading ? (
                  <>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Owner</h3>
                        <p>{refinery?.owner || 'Not specified'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Capacity</h3>
                        <p>{refinery?.capacity?.toLocaleString() || 'Unknown'} barrels/day</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Founded</h3>
                        <p>{refinery?.foundedYear || 'Unknown'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Last Upgraded</h3>
                        <p>{refinery?.lastModernization ? new Date(refinery.lastModernization).getFullYear() : 'Unknown'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Complexity</h3>
                        <p>{refinery?.complexity ? `${refinery.complexity} NCI` : 'Not rated'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Products</h3>
                        <p>{refinery?.primaryProducts || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                      <p className="text-sm">{refinery?.description || 'No description available'}</p>
                    </div>
                    
                    {refinery?.crudeTypes && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Crude Types Processed</h3>
                          <p className="text-sm">{refinery.crudeTypes}</p>
                        </div>
                      </>
                    )}
                    
                    {refinery?.certifications && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Certifications</h3>
                          <div className="flex flex-wrap gap-2">
                            {refinery.certifications.split(',').map((cert, i) => (
                              <Badge key={i} variant="outline">{cert.trim()}</Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Map card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent className="p-0 aspect-square">
                {isRefineryLoading ? (
                  <div className="h-full w-full bg-muted animate-pulse flex items-center justify-center">
                    <MapPinIcon className="h-8 w-8 text-muted-foreground opacity-50" />
                  </div>
                ) : (
                  <SimpleLeafletMap
                    markers={[
                      {
                        id: refineryId,
                        position: [Number(refinery?.lat), Number(refinery?.lng)],
                        tooltip: refinery?.name || 'Refinery',
                        type: 'refinery'
                      }
                    ]}
                    center={[Number(refinery?.lat), Number(refinery?.lng)]}
                    zoom={9}
                    dragging={false}
                    className="h-full w-full rounded-b-lg"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Second row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weather card */}
            <WeatherCard 
              weather={weatherData} 
              isLoading={isWeatherLoading} 
            />

            {/* AI Insights card */}
            <InsightsCard 
              insights={insightsData} 
              isLoading={isInsightsLoading}
              onRefresh={handleRefreshInsights} 
            />
          </div>

          {/* Vessels preview */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Nearby Vessels</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('vessels')}>
                  View All
                </Button>
              </div>
              <CardDescription>
                Vessels within 20km of the refinery
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isVesselsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : !vesselsData?.vessels.length ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No vessels currently near this refinery</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vesselsData.vessels.slice(0, 3).map(({ vessel, distance }) => (
                    <VesselItem key={vessel.id} vessel={vessel} distance={distance} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vessels tab content */}
        <TabsContent value="vessels">
          <Card>
            <CardHeader>
              <CardTitle>Nearby Vessels</CardTitle>
              <CardDescription>
                All vessels near the refinery
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isVesselsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : !vesselsData?.vessels.length ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No vessels currently near this refinery</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-3 bg-muted rounded-md mb-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Found {vesselsData.vessels.length} vessels</h3>
                      <p className="text-sm text-muted-foreground">Within 20km radius</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vesselsData.vessels.map(({ vessel, distance }) => (
                      <VesselItem key={vessel.id} vessel={vessel} distance={distance} />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logistics tab content */}
        <TabsContent value="logistics">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Logistics</CardTitle>
              <CardDescription>
                Supply chain and transportation details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-6 text-muted-foreground">
                Logistics information coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics tab content */}
        <TabsContent value="analytics">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Operational metrics and performance data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-6 text-muted-foreground">
                Analytics dashboard coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}