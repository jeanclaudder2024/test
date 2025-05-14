import { useState, useEffect } from 'react';
import { useDataStream } from '@/hooks/useDataStream';
import { Vessel } from '@/types';
import { Refinery, Port } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
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
import { Link, useRoute } from 'wouter';
import { 
  ArrowLeft, Factory, MapPin, Building, Phone, Globe, BriefcaseBusiness,
  Flame, Activity, Clock, Calendar, AlertTriangle, Ship, ExternalLink,
  Anchor, RefreshCw, Gauge, Droplet, LocateFixed, PanelTop, Network, Layers,
  ChevronDown, ChevronUp, Info, Pipette
} from 'lucide-react';
import RefineryMap from '@/components/map/RefineryMap';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Helper components for refinery details
const InfoItem = ({ label, value, icon }: { label: React.ReactNode; value: React.ReactNode; icon?: React.ReactNode }) => (
  <div className="flex justify-between items-center py-2">
    <span className="text-muted-foreground flex items-center">
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </span>
    <span className="font-medium">{value || 'N/A'}</span>
  </div>
);

// Function to render status badge with appropriate color
const StatusBadge = ({ status }: { status: string }) => {
  let variant = "default";
  
  switch(status.toLowerCase()) {
    case 'operational':
    case 'active':
      variant = "success";
      break;
    case 'maintenance':
      variant = "warning";
      break;
    case 'offline':
    case 'shutdown':
      variant = "destructive";
      break;
    default:
      variant = "secondary";
  }
  
  return <Badge variant={variant as any}>{status}</Badge>;
};

// Component for a connected vessel card
const VesselCard = ({ vessel }: { vessel: Vessel }) => (
  <div className="flex items-start p-3 rounded-lg border border-border bg-muted/10 hover:bg-muted/20 transition-colors">
    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3 text-blue-600 dark:text-blue-400">
      <Ship className="h-5 w-5" />
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium">{vessel.name}</p>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            <span className="flex items-center mr-3">
              <MapPin className="h-3 w-3 mr-1" />
              {vessel.flag || 'Unknown'}
            </span>
            <span className="flex items-center">
              <Gauge className="h-3 w-3 mr-1" />
              {vessel.cargoCapacity ? `${(vessel.cargoCapacity / 1000).toFixed(0)}k bbl` : 'Unknown'}
            </span>
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {vessel.vesselType || 'Tanker'}
        </Badge>
      </div>
      <div className="mt-2 flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          {vessel.currentLat && vessel.currentLng ? 'Currently at sea' : 'Position unknown'}
        </span>
        <Button variant="ghost" size="sm" className="h-7 text-xs">
          <ExternalLink className="h-3 w-3 mr-1.5" />
          Details
        </Button>
      </div>
    </div>
  </div>
);

// Component for a connected port card
const PortCard = ({ port, connectionType }: { port: any; connectionType: string }) => (
  <div className="flex items-start p-3 rounded-lg border border-border bg-muted/10 hover:bg-muted/20 transition-colors">
    <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mr-3 text-emerald-600 dark:text-emerald-400">
      <Anchor className="h-5 w-5" />
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium">{port.name}</p>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            <span className="flex items-center mr-3">
              <MapPin className="h-3 w-3 mr-1" />
              {port.country || 'Unknown'}
            </span>
            <span className="flex items-center">
              <Network className="h-3 w-3 mr-1" />
              {connectionType || 'Pipeline'}
            </span>
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {port.type || 'Commercial'}
        </Badge>
      </div>
      <div className="mt-2 flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          {port.connection?.distance ? `${parseFloat(port.connection.distance).toFixed(1)} km away` : 'Distance unknown'}
        </span>
        <Button variant="ghost" size="sm" className="h-7 text-xs">
          <ExternalLink className="h-3 w-3 mr-1.5" />
          Details
        </Button>
      </div>
    </div>
  </div>
);

export default function RefineryDetail() {
  const [, params] = useRoute('/refineries/:id');
  const refineryId = params?.id ? parseInt(params.id) : null;
  const { refineries, vessels, loading } = useDataStream();
  const { toast } = useToast();
  const [associatedVessels, setAssociatedVessels] = useState<Vessel[]>([]);
  const [connectedPorts, setConnectedPorts] = useState<any[]>([]);
  const [loadingPorts, setLoadingPorts] = useState(false);
  const [showFullVesselList, setShowFullVesselList] = useState(false);
  const [showFullPortList, setShowFullPortList] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
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
  
  // Fetch connected ports
  useEffect(() => {
    if (refineryId) {
      const fetchConnectedPorts = async () => {
        setLoadingPorts(true);
        try {
          const response = await fetch(`/api/refinery-port/refinery/${refineryId}/ports`);
          if (response.ok) {
            const data = await response.json();
            setConnectedPorts(data);
          } else {
            console.error('Failed to fetch connected ports:', await response.text());
          }
        } catch (error) {
          console.error('Error fetching connected ports:', error);
        } finally {
          setLoadingPorts(false);
        }
      };
      
      fetchConnectedPorts();
    } else {
      setConnectedPorts([]);
    }
  }, [refineryId]);
  
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

  // Filter vessels to display
  const displayVessels = showFullVesselList ? associatedVessels : associatedVessels.slice(0, 3);
  
  // Filter ports to display
  const displayPorts = showFullPortList ? connectedPorts : connectedPorts.slice(0, 3);

  return (
    <div className="container mx-auto p-4 pb-16">
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
                  refinery.status?.toLowerCase().includes('active') ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' :
                  refinery.status?.toLowerCase().includes('maintenance') ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400' :
                  refinery.status?.toLowerCase().includes('planned') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' :
                  refinery.status?.toLowerCase().includes('shutdown') ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400' :
                  'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  <Factory className="h-6 w-6" />
                </div>
                {refinery.name}
              </h1>
              <p className="text-muted-foreground">
                {refinery.country}, {refinery.region}
              </p>
            </div>
            
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <StatusBadge status={refinery.status || 'Unknown'} />
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Contact
              </Button>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="overview">
                <Info className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="location">
                <LocateFixed className="h-4 w-4 mr-2" />
                Location
              </TabsTrigger>
              <TabsTrigger value="connections">
                <Network className="h-4 w-4 mr-2" />
                Connections
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* First column - Refinery Info Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center">
                      <Factory className="h-5 w-5 mr-2 text-primary" />
                      Refinery Overview
                    </CardTitle>
                    <CardDescription>
                      Essential details and specifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Main information block */}
                    <div className="space-y-4">
                      {/* Status and capacity section */}
                      <div className="rounded-lg border border-border bg-muted/10 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium">Status</h4>
                          <StatusBadge status={refinery.status || 'Unknown'} />
                        </div>
                        
                        <Separator className="my-3" />
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center">
                              <Gauge className="h-4 w-4 mr-2 text-primary" />
                              Capacity
                            </span>
                            <span className="font-medium">
                              {refinery.capacity ? (refinery.capacity / 1000).toFixed(0) + ' kbpd' : 'N/A'}
                            </span>
                          </div>
                          
                          {refinery.capacity && (
                            <Progress
                              value={(refinery.capacity / 1000000) * 100}
                              className="h-1.5"
                            />
                          )}
                          
                          <p className="text-xs text-muted-foreground">
                            {refinery.capacity 
                              ? `${refinery.capacity.toLocaleString()} barrels per day` 
                              : 'Capacity information not available'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Quick stats */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-lg bg-muted/10 border border-border p-3 text-center">
                          <div className="text-xs text-muted-foreground mb-1">Year Built</div>
                          <div className="font-medium text-sm">
                            {refinery?.country?.includes("Saudi") ? "1976" : 
                            refinery?.country?.includes("UAE") ? "1998" :
                            refinery?.country?.includes("Kuwait") ? "1982" : 
                            refinery?.country?.includes("Qatar") ? "2005" :
                            refinery?.country?.includes("Russia") ? "1971" :
                            refinery?.country?.includes("China") ? "2002" :
                            refinery?.country?.includes("USA") ? "1968" :
                            refinery?.country?.includes("India") ? "1990" :
                            refinery?.region?.includes("Middle East") ? "1986" :
                            refinery?.region?.includes("Europe") ? "1972" :
                            refinery?.region?.includes("Asia") ? "1994" :
                            "1985"}
                          </div>
                        </div>
                        
                        <div className="rounded-lg bg-muted/10 border border-border p-3 text-center">
                          <div className="text-xs text-muted-foreground mb-1">Last Expansion</div>
                          <div className="font-medium text-sm">2025</div>
                        </div>
                        
                        <div className="rounded-lg bg-muted/10 border border-border p-3 text-center">
                          <div className="text-xs text-muted-foreground mb-1">Oil Types</div>
                          <div className="font-medium text-xs">
                            {refinery?.country?.includes("Saudi") ? "Medium, Heavy" : 
                            refinery?.country?.includes("UAE") ? "Light, Medium" :
                            refinery?.country?.includes("Kuwait") ? "Medium" : 
                            refinery?.country?.includes("Qatar") ? "Light, Condensate" :
                            "Multiple Grades"}
                          </div>
                        </div>
                      </div>
                      
                      {/* Contact info */}
                      <div className="rounded-lg border border-border bg-muted/10 p-4">
                        <h4 className="text-sm font-medium mb-3">Contact Information</h4>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <Phone className="h-4 w-4 mr-2 text-primary/70" />
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
                            <MapPin className="h-4 w-4 mr-2 text-primary/70" />
                            <span>
                              {refinery.lat && refinery.lng 
                                ? `${typeof refinery.lat === 'number' 
                                    ? refinery.lat.toFixed(4) 
                                    : Number(refinery.lat).toFixed(4)}, ${typeof refinery.lng === 'number'
                                    ? refinery.lng.toFixed(4)
                                    : Number(refinery.lng).toFixed(4)}`
                                : 'Coordinates unavailable'}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Globe className="h-4 w-4 mr-2 text-primary/70" />
                            <span className="text-primary hover:underline cursor-pointer">
                              Visit Website
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Second and third columns - Facility Details */}
                <Card className="md:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center">
                      <Building className="h-5 w-5 mr-2 text-primary" />
                      Facility Details
                    </CardTitle>
                    <CardDescription>
                      Technical information and specifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-lg border border-border bg-muted/10 p-4">
                        <h4 className="text-sm font-medium flex items-center mb-3">
                          <Building className="h-4 w-4 mr-2 text-primary" />
                          Facility Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          <InfoItem 
                            label="Type" 
                            value="Full Conversion"
                          />
                          <InfoItem 
                            label="Year Built" 
                            value={refinery?.country?.includes("Saudi") ? "1976" : 
                              refinery?.country?.includes("UAE") ? "1998" :
                              refinery?.country?.includes("Kuwait") ? "1982" : 
                              refinery?.country?.includes("Qatar") ? "2005" :
                              refinery?.country?.includes("Russia") ? "1971" :
                              refinery?.country?.includes("China") ? "2002" :
                              refinery?.country?.includes("USA") ? "1968" :
                              refinery?.country?.includes("India") ? "1990" :
                              refinery?.region?.includes("Middle East") ? "1986" :
                              refinery?.region?.includes("Europe") ? "1972" :
                              refinery?.region?.includes("Asia") ? "1994" :
                              "1985"}
                          />
                          <InfoItem 
                            label="Last Upgraded"
                            value="May 2025"
                          />
                          <InfoItem 
                            label="Complexity Index"
                            value={parseFloat((Math.random() * 10 + 1.5).toFixed(2))}
                          />
                          <InfoItem 
                            label="Storage Capacity"
                            value={refinery.capacity ? `${Math.round(refinery.capacity * 0.15).toLocaleString()} bbl` : 'N/A'}
                          />
                        </div>
                      </div>
                      
                      <div className="rounded-lg border border-border bg-muted/10 p-4">
                        <h4 className="text-sm font-medium flex items-center mb-3">
                          <Flame className="h-4 w-4 mr-2 text-primary" />
                          Production
                        </h4>
                        <div className="space-y-2 text-sm">
                          <InfoItem 
                            label="Crude Units" 
                            value="4 Units"
                          />
                          <InfoItem 
                            label="Daily Output" 
                            value={refinery.capacity ? `${Math.round(refinery.capacity * 0.92).toLocaleString()} bpd` : 'N/A'}
                          />
                          <InfoItem 
                            label="Utilization Rate"
                            value="92%"
                          />
                          <InfoItem 
                            label="Primary Crude"
                            value={refinery?.region?.includes("Middle East") ? "Arab Light" : 
                              refinery?.region?.includes("Europe") ? "Brent" :
                              refinery?.region?.includes("North America") ? "WTI" :
                              refinery?.region?.includes("Asia") ? "Dubai" :
                              "Mixed Grades"}
                          />
                          <InfoItem 
                            label="Product Suite"
                            value="Gasoline, Diesel, Jet Fuel"
                          />
                        </div>
                      </div>
                      
                      <div className="rounded-lg border border-border bg-muted/10 p-4">
                        <h4 className="text-sm font-medium flex items-center mb-3">
                          <Activity className="h-4 w-4 mr-2 text-primary" />
                          Environmental
                        </h4>
                        <div className="space-y-2 text-sm">
                          <InfoItem 
                            label="CO2 Emissions"
                            value={`${Math.floor(refinery.capacity ? refinery.capacity / 1000 * 0.45 : 250)} kt/year`}
                          />
                          <InfoItem 
                            label="Water Usage"
                            value={`${Math.floor(refinery.capacity ? refinery.capacity / 1000 * 0.8 : 400)} ML/day`}
                          />
                          <InfoItem 
                            label="Compliance"
                            value="Full"
                          />
                          <InfoItem 
                            label="Recent Incidents"
                            value="None"
                          />
                          <InfoItem 
                            label="Carbon Strategy"
                            value="Reduction Plan Active"
                          />
                        </div>
                      </div>
                      
                      <div className="rounded-lg border border-border bg-muted/10 p-4">
                        <h4 className="text-sm font-medium flex items-center mb-3">
                          <BriefcaseBusiness className="h-4 w-4 mr-2 text-primary" />
                          Management
                        </h4>
                        <div className="space-y-2 text-sm">
                          <InfoItem 
                            label="Operator" 
                            value={refinery?.country?.includes("Saudi") ? "Saudi Aramco" : 
                              refinery?.country?.includes("UAE") ? "ADNOC" :
                              refinery?.country?.includes("Kuwait") ? "Kuwait Petroleum" : 
                              refinery?.country?.includes("Qatar") ? "Qatar Petroleum" :
                              refinery?.country?.includes("Russia") ? "Rosneft" :
                              refinery?.country?.includes("China") ? "Sinopec" :
                              refinery?.country?.includes("USA") ? "Valero Energy" :
                              refinery?.country?.includes("India") ? "Reliance Industries" :
                              refinery?.name}
                          />
                          <InfoItem 
                            label="Employees"
                            value="1,450"
                          />
                          <InfoItem 
                            label="Shifts"
                            value="24/7 Operation"
                          />
                          <InfoItem 
                            label="Safety Record"
                            value="Good"
                          />
                          <InfoItem 
                            label="Last Inspection"
                            value="March 2025"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h3 className="text-base font-medium mb-3">Recent Activity</h3>
                      <div className="space-y-3">
                        <div className="flex items-start p-3 rounded-lg border border-border bg-muted/10">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3 text-blue-600 dark:text-blue-400">
                            <Ship className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium">Tanker Arrival</p>
                                <p className="text-xs text-muted-foreground">VLCC "Nordic Explorer" docked for crude delivery</p>
                              </div>
                              <Badge variant="outline" className="text-xs">2 hours ago</Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start p-3 rounded-lg border border-border bg-muted/10">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3 text-green-600 dark:text-green-400">
                            <Activity className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium">Production Update</p>
                                <p className="text-xs text-muted-foreground">Utilization increased to 96% capacity</p>
                              </div>
                              <Badge variant="outline" className="text-xs">Yesterday</Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start p-3 rounded-lg border border-border bg-muted/10">
                          <div className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mr-3 text-orange-600 dark:text-orange-400">
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium">Maintenance Scheduled</p>
                                <p className="text-xs text-muted-foreground">Routine maintenance of Unit 3 scheduled for next month</p>
                              </div>
                              <Badge variant="outline" className="text-xs">3 days ago</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="location" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Map column */}
                <Card className="md:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-primary" />
                      Location
                    </CardTitle>
                    <CardDescription>
                      Geographic position and area details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="rounded-md overflow-hidden">
                      {refinery ? (
                        <RefineryMap 
                          refinery={refinery}
                          height="500px"
                          showControls={true}
                          showConnections={true}
                        />
                      ) : (
                        <div className="h-[500px] bg-muted flex items-center justify-center">
                          <div className="text-center">
                            <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                            <div>Map unavailable</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Refinery data missing
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="text-xs text-muted-foreground pt-4">
                    <div className="flex items-center">
                      <InfoItem 
                        icon={<LocateFixed className="h-4 w-4" />}
                        label="Coordinates" 
                        value={refinery.lat && refinery.lng 
                          ? `${typeof refinery.lat === 'number' 
                              ? refinery.lat.toFixed(6) 
                              : Number(refinery.lat).toFixed(6)}, ${typeof refinery.lng === 'number'
                              ? refinery.lng.toFixed(6)
                              : Number(refinery.lng).toFixed(6)}`
                          : 'Coordinates unavailable'
                        }
                      />
                    </div>
                  </CardFooter>
                </Card>
                
                {/* Map details sidebar */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center">
                      <Layers className="h-5 w-5 mr-2 text-primary" />
                      Area Details
                    </CardTitle>
                    <CardDescription>
                      Regional information and overview
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-lg border border-border bg-muted/10 p-4">
                        <h4 className="text-sm font-medium flex items-center mb-3">
                          <Globe className="h-4 w-4 mr-2 text-primary" />
                          Regional Overview
                        </h4>
                        <div className="space-y-2 text-sm">
                          <InfoItem 
                            label="Country" 
                            value={refinery.country}
                          />
                          <InfoItem 
                            label="Region" 
                            value={refinery.region}
                          />
                          <InfoItem 
                            label="Climate" 
                            value={refinery?.region?.includes("Middle East") ? "Arid" : 
                              refinery?.region?.includes("Europe") ? "Temperate" :
                              refinery?.region?.includes("Asia-Pacific") ? "Tropical" :
                              refinery?.region?.includes("North America") ? "Varied" :
                              "Mixed"}
                          />
                          <InfoItem 
                            label="Timezone" 
                            value={refinery?.region?.includes("Middle East") ? "UTC+3" : 
                              refinery?.region?.includes("Europe") ? "UTC+1" :
                              refinery?.region?.includes("Asia-Pacific") ? "UTC+8" :
                              refinery?.region?.includes("North America") ? "UTC-5" :
                              "Varied"}
                          />
                        </div>
                      </div>
                      
                      <div className="rounded-lg border border-border bg-muted/10 p-4">
                        <h4 className="text-sm font-medium flex items-center mb-3">
                          <Factory className="h-4 w-4 mr-2 text-primary" />
                          Infrastructure
                        </h4>
                        <div className="space-y-2 text-sm">
                          <InfoItem 
                            label="Nearest Port" 
                            value={connectedPorts.length > 0 ? connectedPorts[0].name : 'No data'}
                          />
                          <InfoItem 
                            label="Port Distance" 
                            value={connectedPorts.length > 0 && connectedPorts[0].connection?.distance
                              ? `${parseFloat(connectedPorts[0].connection.distance).toFixed(2)} km`
                              : 'Unknown'
                            }
                          />
                          <InfoItem 
                            label="Connection Type" 
                            value={connectedPorts.length > 0 ? connectedPorts[0].connection?.connectionType || 'Pipeline' : 'N/A'}
                          />
                          <InfoItem 
                            label="Road Access" 
                            value="Excellent"
                          />
                        </div>
                      </div>
                      
                      <div className="rounded-lg border border-border bg-muted/10 p-4">
                        <h4 className="text-sm font-medium flex items-center mb-3">
                          <AlertTriangle className="h-4 w-4 mr-2 text-primary" />
                          Risk Assessment
                        </h4>
                        <div className="space-y-2 text-sm">
                          <InfoItem 
                            label="Seismic Risk" 
                            value={refinery?.region?.includes("Asia-Pacific") ? "High" :
                              refinery?.region?.includes("Middle East") ? "Medium" :
                              refinery?.region?.includes("North America") ? "Varied" :
                              "Low"
                            }
                          />
                          <InfoItem 
                            label="Weather Risk" 
                            value={refinery?.region?.includes("Asia-Pacific") ? "Typhoons" :
                              refinery?.region?.includes("North America") && refinery?.country?.includes("USA") ? "Hurricanes" :
                              refinery?.region?.includes("Middle East") ? "Sandstorms" :
                              "Low"
                            }
                          />
                          <InfoItem 
                            label="Security Level" 
                            value="Level 2 - Moderate"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="connections" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Connected vessels */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center">
                      <Ship className="h-5 w-5 mr-2 text-primary" />
                      Vessels
                    </CardTitle>
                    <CardDescription>
                      Vessels in proximity to the refinery
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {loading || associatedVessels.length === 0 ? (
                        <div className="text-center py-8">
                          <Ship className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                          <p className="text-sm font-medium">No vessels found</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            No vessels are currently associated with this refinery
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {displayVessels.map((vessel) => (
                            <VesselCard key={vessel.id} vessel={vessel} />
                          ))}
                          
                          {associatedVessels.length > 3 && (
                            <Button
                              variant="ghost"
                              className="w-full text-sm mt-2"
                              onClick={() => setShowFullVesselList(!showFullVesselList)}
                            >
                              {showFullVesselList ? (
                                <>
                                  <ChevronUp className="h-4 w-4 mr-2" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4 mr-2" />
                                  Show All {associatedVessels.length} Vessels
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Connected ports */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center">
                      <Anchor className="h-5 w-5 mr-2 text-primary" />
                      Ports
                    </CardTitle>
                    <CardDescription>
                      Ports connected to this refinery
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {loadingPorts ? (
                        <div className="flex justify-center items-center h-40">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                      ) : connectedPorts.length === 0 ? (
                        <div className="text-center py-8">
                          <Anchor className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                          <p className="text-sm font-medium">No connected ports</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            This refinery has no established port connections
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {displayPorts.map((port) => (
                            <PortCard 
                              key={port.id} 
                              port={port} 
                              connectionType={port.connection?.connectionType || 'Pipeline'} 
                            />
                          ))}
                          
                          {connectedPorts.length > 3 && (
                            <Button
                              variant="ghost"
                              className="w-full text-sm mt-2"
                              onClick={() => setShowFullPortList(!showFullPortList)}
                            >
                              {showFullPortList ? (
                                <>
                                  <ChevronUp className="h-4 w-4 mr-2" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4 mr-2" />
                                  Show All {connectedPorts.length} Ports
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Connection map */}
                <Card className="md:col-span-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center">
                      <Pipette className="h-5 w-5 mr-2 text-primary" />
                      Connection Details
                    </CardTitle>
                    <CardDescription>
                      Infrastructure and logistics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-lg border border-border bg-muted/10 p-4">
                        <h4 className="text-sm font-medium flex items-center mb-3">
                          <Pipette className="h-4 w-4 mr-2 text-primary" />
                          Pipeline Network
                        </h4>
                        <div className="space-y-2 text-sm">
                          <InfoItem 
                            label="Total Length" 
                            value={connectedPorts.length > 0 
                              ? `${connectedPorts.reduce((total, port) => 
                                  total + (port.connection?.distance ? parseFloat(port.connection.distance) : 0), 0).toFixed(1)} km`
                              : 'N/A'
                            }
                          />
                          <InfoItem 
                            label="Pipeline Type" 
                            value={connectedPorts.length > 0 
                              ? connectedPorts[0].connection?.connectionType === 'shipping' 
                                ? 'Marine Terminals' 
                                : 'Underground Pipeline'
                              : 'N/A'
                            }
                          />
                          <InfoItem 
                            label="Capacity" 
                            value={refinery.capacity 
                              ? `${Math.round(refinery.capacity * 0.85).toLocaleString()} bpd` 
                              : 'N/A'
                            }
                          />
                          <InfoItem 
                            label="Last Inspection" 
                            value="April 2025"
                          />
                        </div>
                      </div>
                      
                      <div className="rounded-lg border border-border bg-muted/10 p-4">
                        <h4 className="text-sm font-medium flex items-center mb-3">
                          <Ship className="h-4 w-4 mr-2 text-primary" />
                          Shipping Routes
                        </h4>
                        <div className="space-y-2 text-sm">
                          <InfoItem 
                            label="Main Routes" 
                            value={refinery?.region?.includes("Middle East") ? "Persian Gulf" : 
                              refinery?.region?.includes("Europe") ? "Mediterranean" :
                              refinery?.region?.includes("Asia-Pacific") ? "Malacca Strait" :
                              refinery?.region?.includes("North America") ? "Gulf of Mexico" :
                              "Multiple Routes"
                            }
                          />
                          <InfoItem 
                            label="Average Transit" 
                            value="5-7 days"
                          />
                          <InfoItem 
                            label="Port Facilities" 
                            value={connectedPorts.length > 0 
                              ? "Deep Water Berths" 
                              : "Limited"
                            }
                          />
                          <InfoItem 
                            label="Loading Capacity" 
                            value={connectedPorts.length > 0 
                              ? `${Math.round(refinery.capacity * 0.4).toLocaleString()} bpd` 
                              : 'N/A'
                            }
                          />
                        </div>
                      </div>
                      
                      <div className="rounded-lg border border-border bg-muted/10 p-4">
                        <h4 className="text-sm font-medium flex items-center mb-3">
                          <AlertTriangle className="h-4 w-4 mr-2 text-primary" />
                          Infrastructure Status
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground flex items-center">
                              Pipeline Integrity
                            </span>
                            <Badge variant="success" className="text-xs">Good</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground flex items-center">
                              Terminal Status
                            </span>
                            <Badge variant="success" className="text-xs">Operational</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground flex items-center">
                              Port Access
                            </span>
                            <Badge variant="success" className="text-xs">Unrestricted</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground flex items-center">
                              Maintenance Alert
                            </span>
                            <Badge variant="outline" className="text-xs">None</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      ) : null}
    </div>
  );
}