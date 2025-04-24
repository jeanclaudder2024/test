import { useState, useEffect } from 'react';
import { useDataStream } from '@/hooks/useDataStream';
import { Refinery, Vessel } from '@/types';
import { useToast } from '@/hooks/use-toast';
import SimpleLeafletMap from '@/components/map/SimpleLeafletMap';
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
                            {refinery.lat !== null && refinery.lng !== null 
                              ? `${Number(refinery.lat).toFixed(4)}, ${Number(refinery.lng).toFixed(4)}`
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
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Refinery operational highlights */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="flex flex-col items-center justify-center p-2 bg-primary/5 rounded-lg text-center">
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
                  
                  <div className="flex flex-col items-center justify-center p-2 bg-primary/5 rounded-lg text-center">
                    <div className="text-xs text-muted-foreground mb-1">Last Expansion</div>
                    <div className="font-medium text-sm">
                      {refinery?.country?.includes("Saudi") ? "2021" : 
                      refinery?.country?.includes("UAE") ? "2019" :
                      refinery?.country?.includes("Kuwait") ? "2017" : 
                      refinery?.country?.includes("Qatar") ? "2022" :
                      "2020"}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center p-2 bg-primary/5 rounded-lg text-center">
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
                
                {/* Buttons for actions */}
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="w-full">
                    <Map className="h-4 w-4 mr-2" />
                    View on Map
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Details
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <div className="relative">
                {/* Background image based on refinery country */}
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-15 rounded-t-lg h-32"
                  style={{ 
                    backgroundImage: `url(${
                      refinery.country?.includes("Saudi") ? "https://images.unsplash.com/photo-1578895101408-1a6b23eb14f2?w=600&auto=format" : 
                      refinery.country?.includes("UAE") ? "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format" : 
                      refinery.country?.includes("Kuwait") ? "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&auto=format" : 
                      refinery.country?.includes("Qatar") ? "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=600&auto=format" : 
                      "https://images.unsplash.com/photo-1582846067186-84548411fefc?w=600&auto=format"
                    })`
                  }}
                />
                <CardHeader className="pb-3 relative z-10">
                  <CardTitle className="flex items-center">
                    <Map className="h-5 w-5 mr-2 text-primary" />
                    Location
                  </CardTitle>
                  <CardDescription>
                    Geographical location of the refinery
                  </CardDescription>
                </CardHeader>
              </div>
              <CardContent>
                <div className="aspect-video rounded-md overflow-hidden border border-muted">
                  {refinery?.lat && refinery?.lng ? (
                    <SimpleLeafletMap
                      vessels={associatedVessels.slice(0, 6)} // Show associated vessels on the map
                      refineries={[refinery]}
                      selectedRegion={null}
                      onRefineryClick={() => {}}
                      onVesselClick={(vessel) => {
                        // Navigate to vessel details on click
                        window.location.href = `/vessels/${vessel.id}`;
                      }}
                      isLoading={false}
                      initialCenter={[refinery.lat, refinery.lng]}
                      initialZoom={7} // Slightly zoomed out to show nearby vessels
                    />
                  ) : (
                    <div className="h-full bg-muted flex items-center justify-center">
                      <div className="text-center">
                        <Map className="h-12 w-12 text-primary mx-auto mb-2" />
                        <div>Map unavailable</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Coordinates missing
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <Building className="h-4 w-4 mr-2 text-primary" />
                      Facility Information
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span>Full Conversion</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Year Built:</span>
                        <span>
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
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Last Expansion:</span>
                        <span>
                          {refinery?.country?.includes("Saudi") ? "2021" : 
                          refinery?.country?.includes("UAE") ? "2019" :
                          refinery?.country?.includes("Kuwait") ? "2017" : 
                          refinery?.country?.includes("Qatar") ? "2022" :
                          refinery?.country?.includes("Russia") ? "2015" :
                          refinery?.country?.includes("China") ? "2023" :
                          refinery?.country?.includes("USA") ? "2016" :
                          refinery?.region?.includes("Europe") ? "2018" :
                          refinery?.region?.includes("Asia") ? "2020" :
                          "2019"}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Area:</span>
                        <span>
                          {(refinery?.capacity ?? 0) > 500000 ? "15.8 sq km" : 
                          (refinery?.capacity ?? 0) > 300000 ? "9.2 sq km" :
                          (refinery?.capacity ?? 0) > 100000 ? "6.5 sq km" : 
                          "3.2 sq km"}
                        </span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <BriefcaseBusiness className="h-4 w-4 mr-2 text-primary" />
                      Operator Information
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Operator:</span>
                        <span>
                          {refinery?.country?.includes("Saudi") ? "Saudi Aramco" : 
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
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Ownership:</span>
                        <span>
                          {refinery?.country?.includes("Saudi") || 
                           refinery?.country?.includes("Kuwait") || 
                           refinery?.country?.includes("Qatar") ||
                           refinery?.country?.includes("Russia") || 
                           refinery?.country?.includes("China") ||
                           refinery?.country?.includes("Venezuela") ? "State Owned" :
                           refinery?.country?.includes("UAE") ? "60% State / 40% Private" :
                           "Private"}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Employees:</span>
                        <span>
                          {(refinery?.capacity ?? 0) > 500000 ? "~3,500" : 
                          (refinery?.capacity ?? 0) > 300000 ? "~2,200" :
                          (refinery?.capacity ?? 0) > 100000 ? "~1,100" : 
                          "~650"}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Operating Since:</span>
                        <span>
                          {refinery?.country?.includes("Saudi") ? "1978" : 
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
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <div className="relative">
                {/* Background image based on refinery capacity */}
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-15 rounded-t-lg h-32"
                  style={{ 
                    backgroundImage: `url(${
                      (refinery?.capacity ?? 0) > 500000 ? "https://images.unsplash.com/photo-1626028693925-d886ec16a635?w=600&auto=format" : 
                      (refinery?.capacity ?? 0) > 300000 ? "https://images.unsplash.com/photo-1528468606546-33ca8f836154?w=600&auto=format" : 
                      (refinery?.capacity ?? 0) > 100000 ? "https://images.unsplash.com/photo-1610217053983-68feaee7e8e7?w=600&auto=format" : 
                      "https://images.unsplash.com/photo-1590794056873-cfd07dc5a25b?w=600&auto=format"
                    })`
                  }}
                />
                <CardHeader className="pb-3 relative z-10">
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-primary" />
                    Capacity Utilization
                  </CardTitle>
                  <CardDescription>
                    Current operational capacity
                  </CardDescription>
                </CardHeader>
              </div>
              <CardContent className="pb-2">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm flex items-center">
                        <Flame className="h-4 w-4 mr-1 text-orange-500" />
                        Production
                      </span>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm flex items-center">
                        <Droplet className="h-4 w-4 mr-1 text-blue-500" />
                        Storage
                      </span>
                      <span className="text-sm font-medium">42%</span>
                    </div>
                    <Progress value={42} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-green-500" />
                        Processing Time
                      </span>
                      <span className="text-sm font-medium">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-purple-500" />
                        Uptime
                      </span>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  <AlertTriangle className="h-3 w-3 inline mr-1" />
                  Values based on current operations
                </p>
              </CardFooter>
            </Card>
            
            {/* Associated Vessels Card */}
            <Card className="md:col-span-2">
              <div className="relative">
                {/* Background image for connected vessels */}
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-15 rounded-t-lg h-32"
                  style={{ 
                    backgroundImage: `url(${
                      "https://images.unsplash.com/photo-1575353803406-7cee4a383d21?w=600&auto=format"
                    })`
                  }}
                />
                <CardHeader className="pb-3 relative z-10">
                  <CardTitle className="flex items-center">
                    <Ship className="h-5 w-5 mr-2 text-primary" />
                    Connected Vessels
                  </CardTitle>
                  <CardDescription>
                    Vessels associated with this refinery - السفن المرتبطة بهذه المصفاة
                  </CardDescription>
                </CardHeader>
              </div>
              <CardContent>
                {associatedVessels.length > 0 ? (
                  <div className="space-y-4">
                    {/* Arabic/English heading for Connected Vessels */}
                    <div className="flex items-center justify-between mb-3 border-b pb-2">
                      <div className="flex items-center space-x-2">
                        <Ship className="h-5 w-5 text-primary" />
                        <span className="font-medium">Vessels - الناقلات البحرية</span>
                      </div>
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        {associatedVessels.length} {associatedVessels.length === 1 ? 'vessel' : 'vessels'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {associatedVessels.map(vessel => (
                        <Link key={vessel.id} href={`/vessels/${vessel.id}`}>
                          <div className="relative overflow-hidden p-4 bg-muted/40 border border-primary/10 hover:bg-muted/70 hover:border-primary/30 transition-all hover:shadow-md rounded-lg flex items-start justify-between group">
                            {/* Background pattern for vessel cards */}
                            <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                               <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M21 21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V12H21V21ZM21 10H3V6C3 5.44772 3.44772 5 4 5H10.5V3.37929C10.5 3.14771 10.6477 2.94542 10.8619 2.87876C10.9399 2.85656 11.0228 2.85291 11.1031 2.86866L16.5124 3.94195C16.8030 4.00122 17 4.2573 17 4.55315V5H20C20.5523 5 21 5.44772 21 6V10ZM12.5 5H15.5V4.31124L12.5 3.68457V5Z"></path>
                               </svg>
                            </div>
                            
                            <div className="flex items-center space-x-3 z-10">
                              {/* Vessel icon with cargo type coloring */}
                              <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                vessel.cargoType?.toLowerCase().includes('crude') ? 'bg-amber-100 text-amber-600 ring-2 ring-amber-200' :
                                vessel.cargoType?.toLowerCase().includes('gas') ? 'bg-emerald-100 text-emerald-600 ring-2 ring-emerald-200' :
                                vessel.cargoType?.toLowerCase().includes('diesel') ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-200' :
                                vessel.cargoType?.toLowerCase().includes('fuel') ? 'bg-orange-100 text-orange-600 ring-2 ring-orange-200' :
                                'bg-blue-100 text-blue-600 ring-2 ring-blue-200'
                              }`}>
                                <Ship className="h-6 w-6" />
                              </div>
                              
                              <div>
                                <h4 className="text-base font-medium group-hover:text-primary transition-colors">{vessel.name}</h4>
                                <p className="text-sm text-muted-foreground flex items-center mt-0.5">
                                  <span className="inline-flex mr-1.5 h-2.5 w-2.5 rounded-full bg-primary/30"></span>
                                  {vessel.cargoType || vessel.vesselType || 'Unknown Type'}
                                </p>
                                {/* Add origin/destination if available */}
                                {(vessel.departurePort || vessel.destinationPort) && (
                                  <p className="text-xs text-muted-foreground mt-2 flex items-center">
                                    {vessel.departurePort && (
                                      <span className="mr-1 flex items-center">
                                        <ArrowLeft className="h-3 w-3 mr-1" />
                                        <span className="text-primary/80 font-medium">{vessel.departurePort.split(',')[0]}</span>
                                      </span>
                                    )}
                                    {vessel.departurePort && vessel.destinationPort && <span className="mx-1 text-muted-foreground">→</span>}
                                    {vessel.destinationPort && (
                                      <span className="flex items-center">
                                        <ArrowLeft className="h-3 w-3 mr-1 rotate-180" />
                                        <span className="text-primary/80 font-medium">
                                          {vessel.destinationPort.includes('REF:') 
                                            ? vessel.destinationPort.split(':')[2] // Format is REF:id:name
                                            : vessel.destinationPort.split(',')[0]}
                                        </span>
                                      </span>
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end z-10">
                              {/* Status badge based on cargo and flag */}
                              <Badge 
                                variant="outline" 
                                className={`mb-1.5 ${
                                  vessel.cargoType?.toLowerCase().includes('crude') ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  vessel.cargoType?.toLowerCase().includes('gas') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  vessel.cargoType?.toLowerCase().includes('diesel') ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                  vessel.cargoType?.toLowerCase().includes('fuel') ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                  'bg-blue-50 text-blue-700 border-blue-200'
                                }`}
                              >
                                {vessel.flag || vessel.currentRegion || 'Unknown'}
                              </Badge>
                              
                              {/* Cargo capacity visualization */}
                              {vessel.cargoCapacity && (
                                <div className="mb-2 w-full max-w-[120px]">
                                  <div className="flex justify-between items-center text-xs mb-1">
                                    <span className="text-muted-foreground">Cargo</span>
                                    <span className="font-medium">{(vessel.cargoCapacity / 1000).toFixed(0)}K tons</span>
                                  </div>
                                  <Progress
                                    value={vessel.cargoCapacity > 500000 ? 100 : (vessel.cargoCapacity / 5000)}
                                    className={`h-1.5 ${
                                      vessel.cargoType?.toLowerCase().includes('crude') ? '[--progress-foreground:theme(colors.amber.500)]' :
                                      vessel.cargoType?.toLowerCase().includes('gas') ? '[--progress-foreground:theme(colors.emerald.500)]' :
                                      vessel.cargoType?.toLowerCase().includes('diesel') ? '[--progress-foreground:theme(colors.indigo.500)]' :
                                      vessel.cargoType?.toLowerCase().includes('fuel') ? '[--progress-foreground:theme(colors.orange.500)]' :
                                      '[--progress-foreground:theme(colors.blue.500)]'
                                    }`}
                                  />
                                </div>
                              )}
                              
                              <span className="text-xs bg-primary/5 rounded-full px-2 py-0.5 text-primary flex items-center mt-0.5 group-hover:bg-primary/10 transition-colors">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View Details
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    
                    {/* Real-time vessel tracking message */}
                    <div className="flex items-center px-4 py-3 bg-primary/5 rounded-lg mt-3 text-sm">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Real-time tracking active.</span> These vessels are determined to be associated with {refinery.name} based on proximity, destination port, or region data.
                      </p>
                    </div>
                    
                    {associatedVessels.length > 8 && (
                      <div className="text-center pt-2">
                        <Button variant="outline" size="sm" className="border-primary/30 hover:border-primary transition-colors">
                          View All {associatedVessels.length} Vessels
                          <ArrowLeft className="h-3.5 w-3.5 ml-1.5 rotate-180" />
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4">
                    <div className="bg-primary/5 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <Ship className="h-10 w-10 text-primary opacity-70" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No Connected Vessels - لا توجد ناقلات مرتبطة</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      No vessels are currently associated with this refinery. Vessels are linked based on destination, proximity, and region.
                    </p>
                    <Button variant="outline" size="sm" className="mt-6 border-primary/20">
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        View on Global Map
                      </div>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <div className="relative">
                {/* Background image for production overview */}
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-15 rounded-t-lg h-32"
                  style={{ 
                    backgroundImage: `url(${
                      "https://images.unsplash.com/photo-1589928558003-59b6bb406982?w=600&auto=format"
                    })`
                  }}
                />
                <CardHeader className="pb-3 relative z-10">
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-primary" />
                    Production Overview
                  </CardTitle>
                  <CardDescription>
                    Monthly output by product type
                  </CardDescription>
                </CardHeader>
              </div>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-2">
                      <Droplet className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold">4.2M</h3>
                    <p className="text-sm text-muted-foreground">Crude Oil (barrels)</p>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-2">
                      <Droplet className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold">2.8M</h3>
                    <p className="text-sm text-muted-foreground">Gasoline (barrels)</p>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 mb-2">
                      <Droplet className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold">1.5M</h3>
                    <p className="text-sm text-muted-foreground">Diesel (barrels)</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">Processing Units</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Crude Distillation Unit</span>
                        <span className="text-sm font-medium">350,000 bbl/d</span>
                      </div>
                      <Progress value={95} className="h-1.5" />
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Vacuum Distillation</span>
                        <span className="text-sm font-medium">175,000 bbl/d</span>
                      </div>
                      <Progress value={85} className="h-1.5" />
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Catalytic Reformer</span>
                        <span className="text-sm font-medium">120,000 bbl/d</span>
                      </div>
                      <Progress value={70} className="h-1.5" />
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Hydrocracker</span>
                        <span className="text-sm font-medium">80,000 bbl/d</span>
                      </div>
                      <Progress value={65} className="h-1.5" />
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
        </>
      ) : null}
    </div>
  );
}