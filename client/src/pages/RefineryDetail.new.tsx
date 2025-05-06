import { useState, useEffect } from 'react';
import { useDataStream } from '@/hooks/useDataStream';
import { Refinery, Vessel } from '@/types';
import { useToast } from '@/hooks/use-toast';
import RefineryMap from '@/components/map/RefineryMap';
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
  Anchor, RefreshCw, Gauge, Droplet
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

export default function RefineryDetail() {
  const [, params] = useRoute('/refineries/:id');
  const refineryId = params?.id ? parseInt(params.id) : null;
  const { refineries, vessels, loading } = useDataStream();
  const { toast } = useToast();
  const [associatedVessels, setAssociatedVessels] = useState<Vessel[]>([]);
  
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
                  
                  {/* Associated vessels */}
                  <div className="rounded-lg border border-border bg-muted/10 p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-medium">Associated Vessels</h4>
                      <Badge variant="outline" className="text-xs">
                        {associatedVessels.length}
                      </Badge>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {associatedVessels.length > 0 ? (
                        associatedVessels.slice(0, 4).map((vessel) => (
                          <div key={vessel.id} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-muted/20">
                            <div className="flex items-center">
                              <Ship className="h-3.5 w-3.5 mr-2 text-primary/70" />
                              <span>{vessel.name}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {vessel.vesselType}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground text-center py-2">
                          No vessels currently associated
                        </div>
                      )}
                    </div>
                    {associatedVessels.length > 4 && (
                      <div className="mt-3 text-center">
                        <Button variant="ghost" size="sm" className="text-xs w-full">
                          View all {associatedVessels.length} vessels
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Second and third columns - Map and Capacity */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  Location
                </CardTitle>
                <CardDescription>
                  Geographical location of the refinery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md overflow-hidden border border-border mb-4">
                  {refinery ? (
                    <RefineryMap 
                      refinery={refinery}
                      height="400px"
                    />
                  ) : (
                    <div className="h-[400px] bg-muted flex items-center justify-center">
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
                        label="Last Expansion" 
                        value="2025"
                      />
                      <InfoItem 
                        label="Area" 
                        value={(refinery?.capacity ?? 0) > 500000 ? "15.8 sq km" : 
                          (refinery?.capacity ?? 0) > 300000 ? "9.2 sq km" :
                          (refinery?.capacity ?? 0) > 100000 ? "6.5 sq km" : 
                          "3.2 sq km"}
                      />
                    </div>
                  </div>
                  
                  <div className="rounded-lg border border-border bg-muted/10 p-4">
                    <h4 className="text-sm font-medium flex items-center mb-3">
                      <BriefcaseBusiness className="h-4 w-4 mr-2 text-primary" />
                      Operator Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <InfoItem 
                        label="Operator" 
                        value={refinery?.country?.includes("Saudi") ? "Saudi Aramco" : 
                          refinery?.country?.includes("UAE") ? "ADNOC" :
                          refinery?.country?.includes("Kuwait") ? "Kuwait Petroleum Corp" : 
                          refinery?.country?.includes("Qatar") ? "Qatar Petroleum" :
                          refinery?.country?.includes("Russia") ? "Rosneft" :
                          refinery?.country?.includes("China") ? "Sinopec" :
                          refinery?.country?.includes("USA") ? "ExxonMobil" :
                          refinery?.country?.includes("India") ? "Indian Oil Corp" :
                          refinery?.region?.includes("Middle East") ? "Arabian Gulf Oil Co." :
                          refinery?.region?.includes("Europe") ? "Shell" :
                          refinery?.region?.includes("Asia") ? "PetroChina" :
                          refinery?.region?.includes("North America") ? "Chevron" :
                          refinery?.region?.includes("South America") ? "Petrobras" :
                          "Global Petroleum Ltd."}
                      />
                      <InfoItem 
                        label="Ownership" 
                        value={refinery?.country?.includes("Saudi") || 
                          refinery?.country?.includes("Kuwait") || 
                          refinery?.country?.includes("Qatar") ||
                          refinery?.country?.includes("Russia") || 
                          refinery?.country?.includes("China") ||
                          refinery?.country?.includes("Venezuela") ? "State Owned" :
                          refinery?.country?.includes("UAE") ? "60% State / 40% Private" :
                          "Private"}
                      />
                      <InfoItem 
                        label="Employees" 
                        value={(refinery?.capacity ?? 0) > 500000 ? "~3,500" : 
                          (refinery?.capacity ?? 0) > 300000 ? "~2,200" :
                          (refinery?.capacity ?? 0) > 100000 ? "~1,100" : 
                          "~650"}
                      />
                      <InfoItem 
                        label="Operating Since" 
                        value={refinery?.country?.includes("Saudi") ? "1978" : 
                          refinery?.country?.includes("UAE") ? "2000" :
                          refinery?.country?.includes("Kuwait") ? "1984" : 
                          refinery?.country?.includes("Qatar") ? "2007" :
                          refinery?.country?.includes("Russia") ? "1973" :
                          refinery?.country?.includes("China") ? "2004" :
                          refinery?.country?.includes("USA") ? "1970" :
                          refinery?.country?.includes("India") ? "1992" :
                          refinery?.region?.includes("Middle East") ? "1988" :
                          refinery?.region?.includes("Europe") ? "1975" :
                          refinery?.region?.includes("Asia") ? "1996" :
                          "1989"}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Capacity utilization */}
            <Card className="md:col-span-3">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-primary" />
                  Capacity Utilization
                </CardTitle>
                <CardDescription>
                  Current operational metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border border-border bg-muted/10">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium flex items-center">
                        <Flame className="h-4 w-4 mr-2 text-amber-500" />
                        Production
                      </h3>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      Current crude processing rate
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg border border-border bg-muted/10">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium flex items-center">
                        <Droplet className="h-4 w-4 mr-2 text-blue-500" />
                        Storage
                      </h3>
                      <span className="text-sm font-medium">42%</span>
                    </div>
                    <Progress value={42} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      Current tank storage utilization
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg border border-border bg-muted/10">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-green-500" />
                        Processing Time
                      </h3>
                      <span className="text-sm font-medium">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      Average throughput efficiency
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 p-4 rounded-lg border border-border bg-muted/10">
                  <h3 className="text-sm font-medium mb-3">Operational Notes</h3>
                  <div className="text-sm text-muted-foreground">
                    <p>
                      This refinery is currently operating at normal capacity with no significant disruptions. 
                      The last scheduled maintenance was completed in January 2025, with the next maintenance 
                      period planned for October 2025. Production efficiency has increased by 4% since the 
                      last expansion project.
                    </p>
                  </div>
                  
                  <div className="mt-4 flex items-start p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
                    <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Notice: Scheduled Inspection</p>
                      <p className="mt-1">
                        A routine safety inspection is scheduled for June 15, 2025. No production interruption is expected.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <Button variant="outline" size="sm" className="text-xs">
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Update Data
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    Export Report
                  </Button>
                  <Button size="sm" className="text-xs">
                    <Calendar className="h-3.5 w-3.5 mr-1.5" />
                    Schedule Visit
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}