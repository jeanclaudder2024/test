import { useState, useEffect } from 'react';
import { useDataStream } from '@/hooks/useDataStream';
import { Refinery, Vessel } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import SimpleLeafletMap from '@/components/map/SimpleLeafletMap';
import LiveVesselMap from '@/components/map/LiveVesselMap';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link, useRoute } from 'wouter';
import { 
  ArrowLeft, Factory, Map, Edit, PieChart, Droplet, 
  CalendarClock, MapPin, Building, Phone, Globe, BriefcaseBusiness,
  Flame, Activity, Clock, Calendar, AlertTriangle, Ship, ExternalLink
} from 'lucide-react';

// Helper components for refinery details
const InfoItem = ({ label, value }: { label: React.ReactNode; value: React.ReactNode }) => (
  <div className="flex justify-between py-2">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value || 'N/A'}</span>
  </div>
);

// Function to render status badge with appropriate color
const StatusBadge = ({ status }: { status: string }) => {
  let variant = "default";
  
  switch(status.toLowerCase()) {
    case 'operational':
      variant = "success";
      break;
    case 'maintenance':
      variant = "warning";
      break;
    case 'offline':
      variant = "destructive";
      break;
    default:
      variant = "secondary";
  }
  
  return <Badge variant={variant as any}>{status}</Badge>;
};

export default function RefineryDetail() {
  const [, params] = useRoute('/refineries/:id');
  const refineryId = params?.id ? parseInt(params.id) : null;
  const { refineries, vessels, loading } = useDataStream();
  const { toast } = useToast();
  const [associatedVessels, setAssociatedVessels] = useState<Vessel[]>([]);
  const [activeTab, setActiveTab] = useState('details');
  
  // Find the refinery from our stream data
  const refinery = refineries.find(r => r.id === refineryId);
  
  // Fetch vessels from API that are associated with this refinery
  useEffect(() => {
    if (refineryId) {
      const fetchAssociatedVessels = async () => {
        try {
          const response = await fetch(`/api/refineries/${refineryId}/vessels`);
          if (response.ok) {
            const data = await response.json();
            setAssociatedVessels(data);
          } else {
            console.error('Failed to fetch associated vessels:', await response.text());
          }
        } catch (error) {
          console.error('Error fetching associated vessels:', error);
        }
      };
      
      fetchAssociatedVessels();
    } else {
      setAssociatedVessels([]);
    }
  }, [refineryId]);
  
  // Log for debugging when associated vessels change
  useEffect(() => {
    console.log(`Found ${associatedVessels.length} vessels associated with refinery ${refinery?.name}`);
  }, [associatedVessels, refinery?.name]);
  
  // Redirect to refineries page if refinery not found and not loading
  if (!loading && !refinery) {
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

  return (
    <div className="container mx-auto p-4">
      <Link href="/refineries">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Refineries
        </Button>
      </Link>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : refinery ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                  refinery.status?.toLowerCase().includes('active') ? 'bg-green-100 text-green-600' :
                  refinery.status?.toLowerCase().includes('maintenance') ? 'bg-orange-100 text-orange-600' :
                  refinery.status?.toLowerCase().includes('planned') ? 'bg-blue-100 text-blue-600' :
                  refinery.status?.toLowerCase().includes('shutdown') ? 'bg-red-100 text-red-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {refinery.country?.includes("Saudi") ? <Factory className="h-6 w-6" /> : 
                   refinery.country?.includes("UAE") ? <Factory className="h-6 w-6" /> :
                   refinery.country?.includes("Kuwait") ? <Droplet className="h-6 w-6" /> : 
                   refinery.country?.includes("Qatar") ? <Flame className="h-6 w-6" /> :
                   refinery.region?.includes("Middle East") ? <Droplet className="h-6 w-6" /> :
                   refinery.region?.includes("Africa") ? <Globe className="h-6 w-6" /> :
                   refinery.region?.includes("Europe") ? <Building className="h-6 w-6" /> :
                   refinery.region?.includes("Asia") ? <Ship className="h-6 w-6" /> :
                   <Factory className="h-6 w-6" />}
                </div>
                {refinery.name}
              </h1>
              <p className="text-muted-foreground">
                {refinery.country}, {refinery.region}
              </p>
            </div>
            
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <StatusBadge status={refinery.status || 'Unknown'} />
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Refinery
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="mb-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="vessels">
                Vessels
                {associatedVessels.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {associatedVessels.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="map">Live Tracking</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <div className="relative">
                    {/* Background image based on refinery region */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-15 rounded-t-lg h-32"
                      style={{ 
                        backgroundImage: `url(${
                          refinery.region?.includes("Middle East") ? "https://images.unsplash.com/photo-1605023040084-89c87644e368?w=600&auto=format" : 
                          refinery.region?.includes("Asia") ? "https://images.unsplash.com/photo-1500477967233-53333be64072?w=600&auto=format" : 
                          refinery.region?.includes("Europe") ? "https://images.unsplash.com/photo-1552128427-2e5de3b3d614?w=600&auto=format" : 
                          refinery.region?.includes("North America") ? "https://images.unsplash.com/photo-1532408840957-031d8034aeef?w=600&auto=format" : 
                          "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=600&auto=format"
                        })`
                      }}
                    />
                    <CardHeader className="pb-3 relative z-10">
                      <CardTitle className="flex items-center">
                        <Factory className="h-5 w-5 mr-2 text-primary" />
                        Refinery Information
                      </CardTitle>
                      <CardDescription>
                        Details and specifications
                      </CardDescription>
                    </CardHeader>
                  </div>
                  <CardContent>
                    {/* Main information block with improved styling */}
                    <div className="rounded-lg border border-primary/10 bg-muted/30 p-4 mb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 pb-3 border-b border-primary/10">
                        <div className="flex items-center mb-2 sm:mb-0">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                            refinery.status?.toLowerCase().includes('active') ? 'bg-green-100 text-green-600 ring-2 ring-green-200' :
                            refinery.status?.toLowerCase().includes('maintenance') ? 'bg-orange-100 text-orange-600 ring-2 ring-orange-200' :
                            refinery.status?.toLowerCase().includes('planned') ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-200' :
                            refinery.status?.toLowerCase().includes('shutdown') ? 'bg-red-100 text-red-600 ring-2 ring-red-200' :
                            'bg-gray-100 text-gray-600 ring-2 ring-gray-200'
                          }`}>
                            {refinery.country?.includes("Saudi") ? <Factory className="h-5 w-5" /> : 
                             refinery.country?.includes("UAE") ? <Factory className="h-5 w-5" /> :
                             refinery.country?.includes("Kuwait") ? <Droplet className="h-5 w-5" /> : 
                             refinery.country?.includes("Qatar") ? <Flame className="h-5 w-5" /> :
                             refinery.region?.includes("Middle East") ? <Droplet className="h-5 w-5" /> :
                             refinery.region?.includes("Africa") ? <Globe className="h-5 w-5" /> :
                             refinery.region?.includes("Europe") ? <Building className="h-5 w-5" /> :
                             refinery.region?.includes("Asia") ? <Ship className="h-5 w-5" /> :
                             <Factory className="h-5 w-5" />}
                          </div>
                          <div>
                            <h3 className="font-medium text-base">{refinery.name}</h3>
                            <p className="text-xs text-muted-foreground flex items-center">
                              <Globe className="h-3 w-3 mr-1 text-primary/60" /> 
                              {refinery.country}, {refinery.region}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={refinery.status || 'Unknown'} />
                      </div>
                      
                      {/* Capacity with visual indicator */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm flex items-center text-muted-foreground">
                            <Flame className="h-4 w-4 mr-1 text-primary/60" /> Processing Capacity
                          </span>
                          <span className="text-sm font-medium">
                            {refinery.capacity ? (refinery.capacity / 1000).toFixed(0) : 'N/A'} kbpd
                          </span>
                        </div>
                        {refinery.capacity && (
                          <Progress
                            value={(refinery.capacity / 1000000) * 100} // Assuming max around 1M barrels
                            className={`h-2 ${
                              refinery.status?.toLowerCase().includes('active') ? '[--progress-foreground:theme(colors.green.500)]' :
                              refinery.status?.toLowerCase().includes('maintenance') ? '[--progress-foreground:theme(colors.orange.500)]' :
                              refinery.status?.toLowerCase().includes('planned') ? '[--progress-foreground:theme(colors.blue.500)]' :
                              ''
                            }`}
                          />
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          <span>
                            {refinery.capacity 
                              ? `${refinery.capacity.toLocaleString()} barrels per day` 
                              : 'Capacity information not available'}
                          </span>
                        </p>
                      </div>
                      
                      {/* Additional details in a grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div className="bg-muted/40 rounded-lg p-3">
                          <h4 className="text-xs uppercase text-muted-foreground mb-2">Contact Information</h4>
                          <div className="space-y-2">
                            <div className="flex items-center text-sm">
                              <Phone className="h-4 w-4 mr-2 text-primary/60" />
                              <span>
                                {refinery?.country?.includes("Saudi") ? "+966 (13) 357-8000" : 
                                refinery?.country?.includes("UAE") ? "+971 (2) 602-3333" :
                                refinery?.country?.includes("Kuwait") ? "+965 2432-3000" : 
                                refinery?.country?.includes("Qatar") ? "+974 4013-2000" :
                                refinery?.region?.includes("Europe") ? "+44 20 7719 1000" :
                                refinery?.region?.includes("Asia") ? "+65 6263 6189" :
                                refinery?.region?.includes("North America") ? "+1 (713) 626-3500" :
                                "+971 (4) 123-4567"}
                              </span>
                            </div>
                            <div className="flex items-center text-sm">
                              <MapPin className="h-4 w-4 mr-2 text-primary/60" />
                              <span>
                                {refinery.lat && refinery.lng 
                                  ? `${typeof refinery.lat === 'number' 
                                       ? refinery.lat.toFixed(4) 
                                       : parseFloat(String(refinery.lat) || '0').toFixed(4)}, ${typeof refinery.lng === 'number'
                                       ? refinery.lng.toFixed(4)
                                       : parseFloat(String(refinery.lng) || '0').toFixed(4)}`
                                  : 'Coordinates unavailable'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-muted/40 rounded-lg p-3">
                          <h4 className="text-xs uppercase text-muted-foreground mb-2">Facility Information</h4>
                          <div className="space-y-2">
                            <div className="flex items-center text-sm">
                              <Building className="h-4 w-4 mr-2 text-primary/60" />
                              <span>
                                {refinery?.country?.includes("Saudi") ? "Full Conversion Refinery" : 
                                refinery?.country?.includes("UAE") ? "Integrated Petrochemical" :
                                refinery?.country?.includes("Kuwait") ? "Export Terminal" : 
                                refinery?.country?.includes("Qatar") ? "Gas Processing" :
                                refinery?.region?.includes("Middle East") ? "Oil Refinery" :
                                refinery?.region?.includes("Europe") ? "Hydrocracking" :
                                "Standard Refinery"}
                              </span>
                            </div>
                            <div className="flex items-center text-sm">
                              <CalendarClock className="h-4 w-4 mr-2 text-primary/60" />
                              <span>Last Inspection: April 15, 2025</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Activity className="h-4 w-4 mr-2 text-primary/60" />
                              <span>Utilization: 
                                {refinery?.status?.toLowerCase().includes('active') ? " 85-95%" : 
                                refinery?.status?.toLowerCase().includes('maintenance') ? " 40-50%" :
                                refinery?.status?.toLowerCase().includes('planned') ? " Not operational" : 
                                refinery?.status?.toLowerCase().includes('shutdown') ? " 0%" :
                                " Unknown"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional refinery information */}
                    <div className="space-y-4">
                      <div className="rounded-lg border border-primary/10 bg-muted/30 p-4">
                        <h3 className="font-medium mb-3 text-sm flex items-center">
                          <PieChart className="h-4 w-4 mr-2 text-primary/70" />
                          Production Data
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-muted-foreground">Crude Processing</span>
                              <span className="text-sm font-medium">240,000 bbl/d</span>
                            </div>
                            <Progress value={85} className="h-1.5" />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-muted-foreground">Gasoline Production</span>
                              <span className="text-sm font-medium">120,000 bbl/d</span>
                            </div>
                            <Progress value={72} className="h-1.5" />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-muted-foreground">Diesel Production</span>
                              <span className="text-sm font-medium">80,000 bbl/d</span>
                            </div>
                            <Progress value={65} className="h-1.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <CalendarClock className="h-3 w-3 mr-1" />
                      Last updated: April 22, 2025
                    </p>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="vessels" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ship className="h-5 w-5 text-primary" />
                    Associated Vessels
                  </CardTitle>
                  <CardDescription>
                    Vessels that have loaded cargo at {refinery.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {associatedVessels.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {associatedVessels.map((vessel) => (
                        <Card key={vessel.id} className="overflow-hidden">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base flex justify-between">
                              <span>{vessel.name}</span>
                              <StatusBadge status={vessel.status || 'Unknown'} />
                            </CardTitle>
                            <CardDescription>
                              {vessel.vesselType || 'Unknown vessel type'} · IMO: {vessel.imo || 'N/A'}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                              <div>
                                <span className="text-muted-foreground">Capacity:</span>{' '}
                                <span className="font-medium">{vessel.capacity ? vessel.capacity.toLocaleString() : 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Flag:</span>{' '}
                                <span className="font-medium">{vessel.flag || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Cargo:</span>{' '}
                                <span className="font-medium">{vessel.cargoType || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Built:</span>{' '}
                                <span className="font-medium">{vessel.yearBuilt || 'N/A'}</span>
                              </div>
                            </div>
                            
                            {vessel.originPort && vessel.destinationPort && (
                              <div className="text-xs text-muted-foreground border-t pt-2 mt-1">
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" /> 
                                    {vessel.originPort}
                                  </span>
                                  <span>→</span>
                                  <span className="flex items-center">
                                    {vessel.destinationPort} 
                                    <MapPin className="h-3 w-3 ml-1" />
                                  </span>
                                </div>
                              </div>
                            )}
                          </CardContent>
                          <CardFooter className="pt-2">
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="w-full"
                              onClick={() => window.location.href = `/vessels/${vessel.id}`}
                            >
                              View Details
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Ship className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No vessels found</h3>
                      <p className="text-muted-foreground mb-4">
                        There are no vessels currently associated with this refinery.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="map" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Live Vessel Tracking - {refinery.name}
                  </CardTitle>
                  <CardDescription>
                    Real-time location of vessels associated with this refinery
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 overflow-hidden">
                  <div className="h-[600px] w-full">
                    <LiveVesselMap 
                      height="600px"
                      initialRegion={refinery.region?.toLowerCase() || "global"}
                      showRoutes={true}
                      mapStyle="standard"
                      initialCenter={[
                        refinery.lat ? parseFloat(String(refinery.lat)) : 0,
                        refinery.lng ? parseFloat(String(refinery.lng)) : 0
                      ]}
                      initialZoom={6}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : null}
    </div>
  );
}