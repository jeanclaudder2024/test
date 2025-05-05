import { useState, useEffect, useRef } from 'react';
import { useVesselWebSocket } from '@/hooks/useVesselWebSocket';
import { Vessel, ProgressEvent } from '@/types';
import { useVesselProgressEvents, useAddProgressEvent } from '@/hooks/useVessels';
import { useToast } from '@/hooks/use-toast';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from '@/lib/utils';
import { Link, useRoute } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft, Ship, Calendar, Map, Info, Edit, Plus, Navigation, Anchor,
  Flag, Droplet, Package, AlertCircle, Truck, Gauge, BarChart, History,
  Users, Clock, Compass, ArrowRight, FileText, Clipboard, Download, Globe,
  ZoomIn, ZoomOut, Fuel, Activity, Layers, Filter, Tag, Check, RotateCw,
  MapPin, ExternalLink, Factory
} from 'lucide-react';

// Define oil product categories for filtering
const OIL_CATEGORIES = {
  "Crude": ["CRUDE", "EXPORT BLEND CRUDE", "EASTERN SIBERIA PACIFIC OCEAN CRUDE OIL", "ESPO"],
  "Jet Fuel": ["JET FUEL", "JET A1", "AVIATION KEROSENE", "COLONIAL GRADE 54"],
  "Diesel": ["DIESEL", "GASOIL", "ULTRA‐LOW SULPHUR DIESEL", "AUTOMATIVE GAS OIL", "AGO OIL"],
  "Fuel Oil": ["FUEL OIL", "IFO", "HFO", "MFO", "MAZUT", "M100", "VIRGIN FUEL OIL D6", "CST-180"],
  "Gas": ["LPG", "LNG", "LIQUEFIED PETROLEUM GAS", "LIQUEFIED NATURAL GAS", "COMPRESSED NATURAL GAS", "CNG"],
  "Gasoline": ["GASOLINE", "PETROL", "MOGAS", "GASOLENE", "OCTANES"],
  "Other": ["NAPHTHA", "KEROSENE", "BITUMEN", "ASPHALT", "BASE OIL", "SULPHUR", "UREA", "DIAMMONIUM PHOSPHATE", "DAP"]
};

// Helper function to determine oil category
const getOilCategory = (cargoType: string | null | undefined): string => {
  if (!cargoType) return "Other";
  
// Helper function to get port coordinates from name
const getPortCoordinates = async (portName: string): Promise<[number, number] | null> => {
  try {
    console.log(`Searching for port coordinates: ${portName}`);
    
    // Check if it's a special format for refineries (REF:id:name)
    if (portName.startsWith('REF:')) {
      const parts = portName.split(':');
      if (parts.length > 2) {
        const refineryId = parts[1];
        try {
          // Fetch refinery data to get coordinates
          const response = await fetch(`/api/refineries/${refineryId}`);
          if (response.ok) {
            const refinery = await response.json();
            if (refinery && refinery.lat && refinery.lng) {
              console.log(`Found refinery coordinates for ${refinery.name}: [${refinery.lat}, ${refinery.lng}]`);
              return [parseFloat(refinery.lat), parseFloat(refinery.lng)];
            }
          }
        } catch (error) {
          console.error('Error fetching refinery coordinates:', error);
        }
      }
      return null;
    }
    
    // Search for port by name
    const response = await fetch(`/api/ports/search?name=${encodeURIComponent(portName)}`);
    if (!response.ok) {
      console.error(`Failed to search for port ${portName}: ${response.statusText}`);
      return null;
    }
    
    const ports = await response.json();
    if (ports && ports.length > 0) {
      // Use the first matching port
      const port = ports[0];
      if (port.lat && port.lng) {
        console.log(`Found port coordinates for ${port.name}: [${port.lat}, ${port.lng}]`);
        return [parseFloat(port.lat), parseFloat(port.lng)];
      }
    }
    
    console.log(`No coordinates found for port ${portName}`);
    return null;
  } catch (error) {
    console.error('Error getting port coordinates:', error);
    return null;
  }
};
  const upperCargoType = cargoType.toUpperCase();
  
  for (const [category, keywords] of Object.entries(OIL_CATEGORIES)) {
    if (keywords.some(keyword => upperCargoType.includes(keyword))) {
      return category;
    }
  }
  return "Other";
};

// Helper components for vessel details
const InfoItem = ({ label, value }: { label: React.ReactNode; value: React.ReactNode }) => (
  <div className="flex justify-between py-2">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value || 'N/A'}</span>
  </div>
);

const ProgressTimeline = ({ events }: { events: ProgressEvent[] }) => {
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedEvents.map((event, index) => (
        <div key={event.id} className="relative pl-6">
          {index !== sortedEvents.length - 1 && (
            <div className="absolute left-[9px] top-6 bottom-0 w-[2px] bg-muted"></div>
          )}
          <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            {event.event && event.event.toLowerCase().includes('departure') ? (
              <Navigation className="h-3 w-3 text-white" />
            ) : event.event && event.event.toLowerCase().includes('arrival') ? (
              <Anchor className="h-3 w-3 text-white" />
            ) : (
              <div className="h-2 w-2 rounded-full bg-white" />
            )}
          </div>
          
          <div className="bg-muted/50 p-3 rounded-md">
            <div className="font-medium">{event.event}</div>
            <div className="text-sm text-muted-foreground">
              {formatDate(event.date)}
              {event.location && ` at ${event.location}`}
              {(event.lat && event.lng) && 
                <div className="text-xs">
                  Coordinates: {event.lat}, {event.lng}
                </div>
              }
            </div>
          </div>
        </div>
      ))}
      
      {sortedEvents.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          No progress events recorded yet
        </div>
      )}
    </div>
  );
};

// Form component for updating vessel location
// MapControls component for zoom in/out functionality
const MapControls = () => {
  const map = useMap();
  
  return (
    <div className="absolute top-2 right-2 z-[1000] bg-white rounded-md shadow-sm">
      <Button 
        variant="ghost" 
        size="icon" 
        className="p-1 text-gray-600 hover:bg-gray-100 hover:text-primary h-8 w-8"
        onClick={() => map.zoomIn()}
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="p-1 text-gray-600 hover:bg-gray-100 hover:text-primary h-8 w-8 border-t border-gray-100"
        onClick={() => map.zoomOut()}
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Helper function to generate a curved path between two points
const generateCurvedPath = (
  startPoint: [number, number], 
  endPoint: [number, number], 
  curvature = 0.2
): [number, number][] => {
  // Calculate midpoint
  const midX = (startPoint[0] + endPoint[0]) / 2;
  const midY = (startPoint[1] + endPoint[1]) / 2;
  
  // Calculate distance between points
  const dx = endPoint[0] - startPoint[0];
  const dy = endPoint[1] - startPoint[1];
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Calculate control point for curve (perpendicular to line)
  const controlX = midX - dy * curvature;
  const controlY = midY + dx * curvature;
  
  // Generate path with more points for smoothness
  const path: [number, number][] = [];
  const steps = 20; // Number of points on the curve
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Quadratic Bezier curve formula
    const x = (1 - t) * (1 - t) * startPoint[0] + 
              2 * (1 - t) * t * controlX + 
              t * t * endPoint[0];
    const y = (1 - t) * (1 - t) * startPoint[1] + 
              2 * (1 - t) * t * controlY + 
              t * t * endPoint[1];
    path.push([x, y]);
  }
  
  return path;
};

// VesselRoutes component to display the vessel's route
const VesselRoutes = ({ 
  currentPos, 
  departureCoords, 
  destinationCoords 
}: { 
  currentPos: [number, number], 
  departureCoords?: [number, number] | null, 
  destinationCoords?: [number, number] | null 
}) => {
  const routeOptions = {
    past: {
      color: '#3b82f6', // blue
      weight: 3,
      opacity: 0.7,
      className: 'past-route'
    },
    future: {
      color: '#ef4444', // red
      weight: 3,
      opacity: 0.5,
      dashArray: '5, 5',
      className: 'future-route'
    }
  };
  
  return (
    <>
      {/* Past route: from departure to current position */}
      {departureCoords && (
        <Polyline
          positions={generateCurvedPath(departureCoords, currentPos)}
          pathOptions={routeOptions.past}
        >
          <Popup>
            <div className="text-sm font-medium">Past route</div>
            <div className="text-xs text-gray-500">From departure to current position</div>
          </Popup>
        </Polyline>
      )}
      
      {/* Future route: from current position to destination */}
      {destinationCoords && (
        <Polyline
          positions={generateCurvedPath(currentPos, destinationCoords)}
          pathOptions={routeOptions.future}
        >
          <Popup>
            <div className="text-sm font-medium">Projected route</div>
            <div className="text-xs text-gray-500">From current position to destination</div>
          </Popup>
        </Polyline>
      )}
      
      {/* Add origin marker if we have departure coordinates */}
      {departureCoords && (
        <Marker
          position={departureCoords as LatLngExpression}
          icon={L.divIcon({
            className: 'departure-marker',
            html: `<div class="w-3 h-3 rounded-full bg-blue-500 border-2 border-white"></div>`,
            iconSize: [12, 12]
          })}
        >
          <Popup>Departure port</Popup>
        </Marker>
      )}
      
      {/* Add destination marker if we have destination coordinates */}
      {destinationCoords && (
        <Marker
          position={destinationCoords as LatLngExpression}
          icon={L.divIcon({
            className: 'destination-marker',
            html: `<div class="w-3 h-3 rounded-full bg-red-500 border-2 border-white"></div>`,
            iconSize: [12, 12]
          })}
        >
          <Popup>Destination port</Popup>
        </Marker>
      )}
    </>
  );
};

const LocationUpdateForm = ({ 
  vesselId, 
  initialLat, 
  initialLng, 
  onSuccess 
}: { 
  vesselId: number, 
  initialLat?: string | number | null, 
  initialLng?: string | number | null, 
  onSuccess: () => void 
}) => {
  const { toast } = useToast();
  const [lat, setLat] = useState(initialLat || "");
  const [lng, setLng] = useState(initialLng || "");
  const [eventDescription, setEventDescription] = useState("");
  const [destinationType, setDestinationType] = useState<'none' | 'refinery' | 'port'>('none');
  const [destinationRefineryId, setDestinationRefineryId] = useState<string>("");
  const [destinationPort, setDestinationPort] = useState<string>("");
  const [refineries, setRefineries] = useState<any[]>([]);
  const [isLoadingRefineries, setIsLoadingRefineries] = useState(false);
  
  // Load refineries on component mount
  useEffect(() => {
    const fetchRefineries = async () => {
      setIsLoadingRefineries(true);
      try {
        const response = await fetch('/api/refineries');
        if (response.ok) {
          const data = await response.json();
          setRefineries(data);
        }
      } catch (error) {
        console.error('Failed to fetch refineries:', error);
      } finally {
        setIsLoadingRefineries(false);
      }
    };
    
    fetchRefineries();
  }, []);
  
  const updateLocationMutation = useMutation({
    mutationFn: async (data: { 
      lat: string, 
      lng: string, 
      eventDescription?: string,
      destinationRefineryId?: string,
      destinationPort?: string
    }) => {
      const response = await fetch(`/api/vessels/${vesselId}/update-location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update location");
      }
      return await response.json();
    },
    onSuccess: (data) => {
      let destinationMsg = "";
      if (data.destination && data.destination !== "At sea") {
        destinationMsg = ` heading to ${data.destination}`;
      }
      
      toast({
        title: "Location updated",
        description: `Vessel location updated to ${lat}, ${lng} in the ${data.region} region${destinationMsg}.`,
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update location",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updateData: any = { lat, lng, eventDescription };
    
    // Add destination information based on selection
    if (destinationType === 'refinery' && destinationRefineryId) {
      updateData.destinationRefineryId = destinationRefineryId;
    } else if (destinationType === 'port' && destinationPort) {
      updateData.destinationPort = destinationPort;
    }
    
    updateLocationMutation.mutate(updateData);
  };
  
  return (
    <div className="rounded-md border p-4 mt-2 bg-muted/20">
      <h4 className="text-sm font-medium mb-3 flex items-center">
        <MapPin className="h-4 w-4 mr-2 text-primary" />
        تحديث الموقع والوجهة - Update Location & Destination
      </h4>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="latitude">Latitude - خط العرض</Label>
            <Input
              id="latitude"
              placeholder="e.g. 25.2048"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="longitude">Longitude - خط الطول</Label>
            <Input
              id="longitude"
              placeholder="e.g. 55.2708"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              required
            />
          </div>
        </div>
        
        {/* Destination Section */}
        <div className="space-y-2 pt-2">
          <Label>Destination Type - نوع الوجهة</Label>
          <div className="flex space-x-2">
            <Button 
              type="button" 
              size="sm"
              variant={destinationType === 'none' ? 'default' : 'outline'}
              onClick={() => setDestinationType('none')}
            >
              None
            </Button>
            <Button 
              type="button" 
              size="sm"
              variant={destinationType === 'refinery' ? 'default' : 'outline'}
              onClick={() => setDestinationType('refinery')}
            >
              Refinery - مصفاة
            </Button>
            <Button 
              type="button" 
              size="sm"
              variant={destinationType === 'port' ? 'default' : 'outline'}
              onClick={() => setDestinationType('port')}
            >
              Port - ميناء
            </Button>
          </div>
          
          {destinationType === 'refinery' && (
            <div className="space-y-1 pt-2">
              <Label htmlFor="destinationRefinery">
                Destination Refinery - مصفاة الوجهة
              </Label>
              <select
                id="destinationRefinery"
                className="w-full p-2 rounded-md border"
                value={destinationRefineryId}
                onChange={(e) => setDestinationRefineryId(e.target.value)}
                required={destinationType === 'refinery'}
              >
                <option value="">Select a refinery...</option>
                {isLoadingRefineries ? (
                  <option disabled>Loading refineries...</option>
                ) : (
                  refineries.map(refinery => (
                    <option key={refinery.id} value={refinery.id.toString()}>
                      {refinery.name} ({refinery.country})
                    </option>
                  ))
                )}
              </select>
            </div>
          )}
          
          {destinationType === 'port' && (
            <div className="space-y-1 pt-2">
              <Label htmlFor="destinationPort">
                Destination Port - ميناء الوجهة
              </Label>
              <Input
                id="destinationPort"
                placeholder="e.g. Rotterdam Port"
                value={destinationPort}
                onChange={(e) => setDestinationPort(e.target.value)}
                required={destinationType === 'port'}
              />
            </div>
          )}
        </div>
        
        <div className="space-y-1 pt-2">
          <Label htmlFor="event-description">
            Event Description (optional) - وصف الحدث
          </Label>
          <Input
            id="event-description"
            placeholder="e.g. Updated position via satellite tracking"
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-2 justify-end pt-3">
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => onSuccess()}
            disabled={updateLocationMutation.isPending}
          >
            Cancel - إلغاء
          </Button>
          <Button 
            type="submit" 
            size="sm"
            disabled={updateLocationMutation.isPending}
          >
            {updateLocationMutation.isPending ? (
              <>
                <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Update - تحديث
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

// Helper function to get port coordinates by name
const getPortCoordinates = async (portName: string | null | undefined): Promise<[number, number] | null> => {
  if (!portName) return null;
  
  try {
    const response = await fetch(`/api/ports/search?name=${encodeURIComponent(portName)}`);
    if (!response.ok) return null;
    
    const ports = await response.json();
    if (ports && ports.length > 0) {
      // Use the first matching port
      return [parseFloat(ports[0].lat), parseFloat(ports[0].lng)];
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching port coordinates:", error);
    return null;
  }
};

// Using the existing generateCurvedPath, MapControls, and VesselRoutes functions defined above

export default function VesselDetail() {
  const [, params] = useRoute('/vessels/:id');
  const vesselId = params?.id ? parseInt(params.id) : null;
  const { vessels, loading } = useVesselWebSocket('global');
  const { data: progressEvents = [], isLoading: progressLoading } = useVesselProgressEvents(vesselId);
  const { toast } = useToast();
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [showRoute, setShowRoute] = useState(true);
  const [departureCoords, setDepartureCoords] = useState<[number, number] | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null);
  const [isLoadingPortData, setIsLoadingPortData] = useState(false);
  
  // Find the vessel from our stream data
  console.log('VesselDetail: Looking for vessel with ID:', vesselId);
  console.log('VesselDetail: Number of vessels in data:', vessels.length);
  console.log('VesselDetail: First few vessel IDs:', vessels.slice(0, 5).map((v: any) => v.id));
  
  const vessel = vessels.find((v: any) => v.id === vesselId);
  
  // Log result of search
  if (vessel) {
    console.log('VesselDetail: Found vessel:', vessel.name, vessel.id);
  } else {
    console.log('VesselDetail: Vessel not found with ID:', vesselId);
  }
  
  // Fetch port coordinates for route visualization
  useEffect(() => {
    if (!vessel) return;
    
    const fetchPortCoordinates = async () => {
      setIsLoadingPortData(true);
      
      try {
        // Fetch departure port coordinates
        if (vessel.departurePort) {
          console.log('Fetching coordinates for departure port:', vessel.departurePort);
          const depCoords = await getPortCoordinates(vessel.departurePort);
          if (depCoords) {
            console.log('Found departure port coordinates:', depCoords);
            setDepartureCoords(depCoords);
          } else if (vessel.departureLat && vessel.departureLng) {
            // Use vessel's departure coordinates if port lookup fails
            console.log('Using vessel departure coordinates');
            setDepartureCoords([
              parseFloat(vessel.departureLat as string), 
              parseFloat(vessel.departureLng as string)
            ]);
          }
        }
        
        // Fetch destination port coordinates
        if (vessel.destinationPort) {
          console.log('Fetching coordinates for destination port:', vessel.destinationPort);
          const destCoords = await getPortCoordinates(vessel.destinationPort);
          if (destCoords) {
            console.log('Found destination port coordinates:', destCoords);
            setDestinationCoords(destCoords);
          } else if (vessel.destinationLat && vessel.destinationLng) {
            // Use vessel's destination coordinates if port lookup fails
            console.log('Using vessel destination coordinates');
            setDestinationCoords([
              parseFloat(vessel.destinationLat as string), 
              parseFloat(vessel.destinationLng as string)
            ]);
          }
        }
      } catch (error) {
        console.error('Error fetching port coordinates:', error);
      } finally {
        setIsLoadingPortData(false);
      }
    };
    
    fetchPortCoordinates();
  }, [vessel]);
  
  // Redirect to vessels page if vessel not found and not loading
  if (!loading && !vessel) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="py-12">
          <Ship className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Vessel not found</h3>
          <p className="text-muted-foreground mb-8">
            The vessel with ID {vesselId} does not exist or was deleted.
          </p>
          <Link href="/vessels">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Vessels
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Link href="/vessels">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vessels
        </Button>
      </Link>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : vessel ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Ship className="h-8 w-8 mr-2 text-primary" />
                {vessel.name}
              </h1>
              <p className="text-muted-foreground">
                IMO: {vessel.imo} | MMSI: {vessel.mmsi} | {vessel.flag}
              </p>
            </div>
            
            <div className="flex gap-4 mt-4 md:mt-0">
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Vessel
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Progress Event
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="details">
            <TabsList className="mb-4">
              <TabsTrigger value="details">
                <Info className="h-4 w-4 mr-2" />
                Details
              </TabsTrigger>
              <TabsTrigger value="journey">
                <Map className="h-4 w-4 mr-2" />
                Journey
              </TabsTrigger>
              <TabsTrigger value="documents">
                <Calendar className="h-4 w-4 mr-2" />
                Documents
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center">
                      <Ship className="h-5 w-5 mr-2 text-primary" />
                      Vessel Information
                    </CardTitle>
                    <CardDescription>
                      Technical details and specifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium mb-3 flex items-center">
                          <Info className="h-4 w-4 mr-2 text-primary" />
                          Vessel Identity
                        </h3>
                        <InfoItem 
                          label={<span className="flex items-center"><Ship className="h-4 w-4 mr-1" /> Name</span>} 
                          value={vessel.name} 
                        />
                        <InfoItem 
                          label={<span className="flex items-center"><FileText className="h-4 w-4 mr-1" /> IMO Number</span>} 
                          value={vessel.imo} 
                        />
                        <InfoItem 
                          label={<span className="flex items-center"><Gauge className="h-4 w-4 mr-1" /> MMSI</span>} 
                          value={vessel.mmsi} 
                        />
                        <InfoItem 
                          label={<span className="flex items-center"><Package className="h-4 w-4 mr-1" /> Vessel Type</span>} 
                          value={vessel.vesselType} 
                        />
                        <InfoItem 
                          label={<span className="flex items-center"><Flag className="h-4 w-4 mr-1" /> Flag</span>} 
                          value={vessel.flag} 
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-3 flex items-center">
                          <BarChart className="h-4 w-4 mr-2 text-primary" />
                          Technical Specifications
                        </h3>
                        <InfoItem 
                          label={<span className="flex items-center"><Calendar className="h-4 w-4 mr-1" /> Year Built</span>} 
                          value={vessel.built || 'N/A'} 
                        />
                        <InfoItem 
                          label={<span className="flex items-center"><Package className="h-4 w-4 mr-1" /> Deadweight</span>} 
                          value={vessel.deadweight ? `${vessel.deadweight.toLocaleString()} tons` : 'N/A'} 
                        />
                        <InfoItem 
                          label={<span className="flex items-center"><Droplet className="h-4 w-4 mr-1" /> Cargo Capacity</span>} 
                          value={vessel.cargoCapacity ? `${vessel.cargoCapacity.toLocaleString()} barrels` : 'N/A'} 
                        />
                        <InfoItem 
                          label={<span className="flex items-center"><Droplet className="h-4 w-4 mr-1" /> Cargo Type</span>} 
                          value={vessel.cargoType || 'N/A'} 
                        />
                        <InfoItem 
                          label={<span className="flex items-center"><Globe className="h-4 w-4 mr-1" /> Current Region</span>} 
                          value={vessel.currentRegion || 'N/A'} 
                        />
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium mb-3 flex items-center">
                          <Users className="h-4 w-4 mr-2 text-primary" />
                          Ownership & Class
                        </h3>
                        <InfoItem 
                          label="Owner"
                          value="Global Tanker Corp." 
                        />
                        <InfoItem 
                          label="Operator"
                          value="Oceanic Shipping Ltd." 
                        />
                        <InfoItem 
                          label="Class Society"
                          value="American Bureau of Shipping (ABS)" 
                        />
                        <InfoItem 
                          label="P&I Club"
                          value="North of England P&I" 
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-3 flex items-center">
                          <Gauge className="h-4 w-4 mr-2 text-primary" />
                          Dimensions & Equipment
                        </h3>
                        <InfoItem 
                          label="Length Overall"
                          value="333.0 m" 
                        />
                        <InfoItem 
                          label="Breadth"
                          value="60.0 m" 
                        />
                        <InfoItem 
                          label="Summer Draft"
                          value="22.5 m" 
                        />
                        <InfoItem 
                          label="Main Engine"
                          value="MAN B&W 7G80ME-C9.5" 
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <p className="text-xs text-muted-foreground">
                      <AlertCircle className="h-3 w-3 inline mr-1" />
                      Last verified: April 10, 2023
                    </p>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center">
                      <Navigation className="h-5 w-5 mr-2 text-primary" />
                      Current Location
                    </CardTitle>
                    <CardDescription>
                      Last reported coordinates - الإحداثيات الحالية
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {vessel.currentLat && vessel.currentLng ? (
                      <>
                        <div className="aspect-square bg-muted rounded-md overflow-hidden mb-4 relative">
                          <MapContainer
                            center={[parseFloat(vessel.currentLat as string), parseFloat(vessel.currentLng as string)]}
                            zoom={6}
                            zoomControl={false}
                            className="h-full w-full"
                            whenReady={() => {
                              setTimeout(() => {
                                // Fix map size when tab changes
                                const mapElement = document.querySelector('.leaflet-container');
                                if (mapElement) {
                                  const map = (mapElement as any)._leaflet_map;
                                  if (map) map.invalidateSize();
                                }
                              }, 0);
                            }}
                          >
                            <TileLayer
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker
                              position={[parseFloat(vessel.currentLat as string), parseFloat(vessel.currentLng as string)]}
                              icon={L.divIcon({
                                className: 'vessel-position-marker',
                                html: `<div class="w-4 h-4 rounded-full bg-orange-500 border-2 border-white pulse-animation"></div>`,
                                iconSize: [16, 16],
                              })}
                            >
                              <Popup>Current position of {vessel.name}</Popup>
                            </Marker>
                            
                            {/* Display vessel routes if enabled */}
                            {showRoute && !isLoadingPortData && (
                              <VesselRoutes 
                                currentPos={[
                                  parseFloat(vessel.currentLat as string), 
                                  parseFloat(vessel.currentLng as string)
                                ]}
                                departureCoords={departureCoords}
                                destinationCoords={destinationCoords}
                              />
                            )}
                            
                            {/* Map controls */}
                            <MapControls />
                            
                            {/* Route toggle control */}
                            <div className="absolute top-2 left-2 z-[1000] bg-white rounded-md shadow-sm">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className={`p-1 text-gray-600 hover:bg-gray-100 h-8 w-8 ${showRoute ? 'text-primary' : ''}`}
                                onClick={() => setShowRoute(prev => !prev)}
                                title={showRoute ? "Hide vessel route" : "Show vessel route"}
                              >
                                <Compass className="h-4 w-4" />
                              </Button>
                            </div>
                          </MapContainer>
                          
                          {/* Map controls panel */}
                          <div className="absolute bottom-2 left-2 z-[1000] bg-white/80 backdrop-blur-sm rounded-md shadow-sm p-2">
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant={showRoute ? "default" : "outline"} 
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => setShowRoute(prev => !prev)}
                              >
                                <Layers className="h-3 w-3 mr-1" />
                                {showRoute ? 'Hide Route' : 'Show Route'}
                              </Button>
                              
                              {isLoadingPortData && (
                                <div className="animate-spin h-3 w-3 border-t-2 border-primary rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <InfoItem 
                            label={<span className="flex items-center"><Compass className="h-4 w-4 mr-1" /> Latitude</span>} 
                            value={vessel.currentLat} 
                          />
                          <InfoItem 
                            label={<span className="flex items-center"><Compass className="h-4 w-4 mr-1" /> Longitude</span>} 
                            value={vessel.currentLng} 
                          />
                          <InfoItem 
                            label={<span className="flex items-center"><Clock className="h-4 w-4 mr-1" /> Last Updated</span>} 
                            value={"2 hours ago"} 
                          />
                          <InfoItem 
                            label={<span className="flex items-center"><Gauge className="h-4 w-4 mr-1" /> Speed</span>} 
                            value={"12.5 knots"} 
                          />
                          <InfoItem 
                            label={<span className="flex items-center"><Compass className="h-4 w-4 mr-1" /> Heading</span>} 
                            value={"135° SE"} 
                          />
                        </div>
                        
                        <div className="mt-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full mb-3"
                            onClick={() => setIsUpdatingLocation(prev => !prev)}
                          >
                            <MapPin className="h-4 w-4 mr-2" />
                            {isUpdatingLocation ? 'Cancel Update' : 'Update Location'}
                          </Button>
                          
                          {isUpdatingLocation && (
                            <LocationUpdateForm 
                              vesselId={vessel.id} 
                              initialLat={vessel.currentLat}
                              initialLng={vessel.currentLng}
                              onSuccess={() => {
                                setIsUpdatingLocation(false);
                                queryClient.invalidateQueries({ queryKey: ['/api/vessels'] });
                              }}
                            />
                          )}
                        </div>
                        
                        <div className="mt-4 bg-muted/30 rounded-md p-3">
                          <h4 className="text-sm font-medium mb-2">Nearby Vessels</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                              <span>Celestial Voyager</span>
                              <Badge variant="outline">22.4 nm</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Northern Star</span>
                              <Badge variant="outline">35.1 nm</Badge>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No location data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <Card className="mt-6">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Truck className="h-5 w-5 mr-2 text-primary" />
                    Current Voyage
                  </CardTitle>
                  <CardDescription>
                    Details of ongoing journey
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-muted/30 p-4 rounded-md">
                      <h3 className="font-medium mb-3 flex items-center">
                        <Navigation className="h-4 w-4 mr-2 text-primary" />
                        Departure
                      </h3>
                      <InfoItem 
                        label={<span className="flex items-center"><Anchor className="h-4 w-4 mr-1" /> Port</span>} 
                        value={vessel.departurePort || 'N/A'} 
                      />
                      <InfoItem 
                        label={<span className="flex items-center"><Calendar className="h-4 w-4 mr-1" /> Date</span>} 
                        value={vessel.departureDate ? formatDate(vessel.departureDate) : 'N/A'} 
                      />
                      <InfoItem 
                        label={<span className="flex items-center"><Clock className="h-4 w-4 mr-1" /> Terminal</span>} 
                        value="North Terminal, Berth 12" 
                      />
                      <InfoItem 
                        label={<span className="flex items-center"><Droplet className="h-4 w-4 mr-1" /> Loading Qty</span>} 
                        value={vessel.cargoCapacity ? `${(vessel.cargoCapacity * 0.95).toLocaleString()} barrels` : 'N/A'} 
                      />
                    </div>
                    
                    <div className="bg-muted/30 p-4 rounded-md">
                      <h3 className="font-medium mb-3 flex items-center">
                        <Anchor className="h-4 w-4 mr-2 text-primary" />
                        Destination
                      </h3>
                      {/* Format destination display based on destinationPort format */}
                      {(() => {
                        // Helper function to format destination
                        const formatDestination = () => {
                          if (!vessel.destinationPort) return 'N/A';
                          
                          if (vessel.destinationPort.startsWith('REF:')) {
                            // Extract refinery name from the format REF:id:name
                            const parts = vessel.destinationPort.split(':');
                            if (parts.length > 2) {
                              const refineryId = parts[1];
                              const refineryName = parts[2];
                              return (
                                <div className="flex items-center">
                                  <Link 
                                    href={`/refineries/${refineryId}`} 
                                    className="text-primary hover:underline flex items-center"
                                  >
                                    {refineryName}
                                    <ExternalLink className="h-3 w-3 ml-1" />
                                  </Link>
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    Refinery
                                  </Badge>
                                </div>
                              );
                            }
                          }
                          // Regular port name
                          return vessel.destinationPort;
                        };
                        
                        // Determine what label to use
                        const destinationLabel = vessel.destinationPort?.startsWith('REF:') ? (
                          <span className="flex items-center">
                            <Factory className="h-4 w-4 mr-1" /> Facility
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Anchor className="h-4 w-4 mr-1" /> Port
                          </span>
                        );
                        
                        return (
                          <InfoItem 
                            label={destinationLabel} 
                            value={formatDestination()} 
                          />
                        );
                      })()}
                      <InfoItem 
                        label={<span className="flex items-center"><Calendar className="h-4 w-4 mr-1" /> ETA</span>} 
                        value={vessel.eta ? formatDate(vessel.eta) : 'N/A'} 
                      />
                      <InfoItem 
                        label={<span className="flex items-center"><Clock className="h-4 w-4 mr-1" /> Terminal</span>} 
                        value="South Basin Terminal" 
                      />
                      <InfoItem 
                        label={<span className="flex items-center"><History className="h-4 w-4 mr-1" /> Status</span>} 
                        value={<Badge className="ml-1" variant="outline">In Transit</Badge>} 
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-medium mb-3 flex items-center justify-between">
                      <span>Journey Progress</span>
                      {(departureCoords || destinationCoords) && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 px-2 text-xs"
                          onClick={() => setShowRoute(prev => !prev)}
                        >
                          {showRoute ? 
                            <span className="flex items-center"><Check className="h-3 w-3 mr-1" />Route visible</span> : 
                            <span className="flex items-center"><Map className="h-3 w-3 mr-1" />Show route</span>
                          }
                        </Button>
                      )}
                    </h3>
                    
                    {/* Route information */}
                    {(departureCoords || destinationCoords) && (
                      <div className="bg-muted/30 p-2 rounded-md mb-4 text-xs">
                        <div className="flex items-center">
                          <div className="flex-1">
                            {departureCoords && (
                              <div className="flex items-center mb-1">
                                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                                <span>Departure: {vessel.departurePort || "Unknown port"}</span>
                              </div>
                            )}
                            {destinationCoords && (
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                                <span>Destination: {vessel.destinationPort?.replace(/REF:\d+:/, '') || "Unknown port"}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-right text-muted-foreground">
                            {isLoadingPortData ? 
                              <div className="animate-spin h-3 w-3 border-t-2 border-primary rounded-full ml-2"></div> :
                              <span>Route {showRoute ? 'visible' : 'hidden'}</span>
                            }
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block text-primary">
                            {"64% Complete"}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold text-muted-foreground">
                            9 days remaining
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary/20">
                        <div style={{ width: "64%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <div>{vessel.departurePort}</div>
                        <div>Current Position</div>
                        <div>
                          {vessel.destinationPort?.startsWith('REF:') 
                            ? vessel.destinationPort.split(':')[2] + ' (Refinery)' 
                            : vessel.destinationPort}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="ml-auto">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    View Detailed Tracking
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="journey">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cargo Information Card */}
                <Card>
                  <div className="relative">
                    {/* Background image based on cargo type */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-15 rounded-t-lg h-32"
                      style={{ 
                        backgroundImage: `url(${
                          getOilCategory(vessel.cargoType) === 'Crude' ? "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=600&auto=format" : 
                          getOilCategory(vessel.cargoType) === 'Jet Fuel' ? "https://images.unsplash.com/photo-1526841535633-ef3be0b23ad9?w=600&auto=format" : 
                          getOilCategory(vessel.cargoType) === 'Diesel' ? "https://images.unsplash.com/photo-1527671507471-3c83585da23f?w=600&auto=format" : 
                          getOilCategory(vessel.cargoType) === 'Fuel Oil' ? "https://images.unsplash.com/photo-1495321308589-43affb814eee?w=600&auto=format" : 
                          getOilCategory(vessel.cargoType) === 'Gas' ? "https://images.unsplash.com/photo-1622058275800-82c2226305f0?w=600&auto=format" :
                          getOilCategory(vessel.cargoType) === 'Gasoline' ? "https://images.unsplash.com/photo-1581525231557-d932c9a51c92?w=600&auto=format" :
                          "https://images.unsplash.com/photo-1580810746032-cede1e872c66?w=600&auto=format"
                        })`
                      }}
                    />
                    <CardHeader className="pb-2 relative z-10">
                      <CardTitle className="flex items-center">
                        <Droplet className="h-5 w-5 mr-2 text-primary" />
                        Cargo Information
                      </CardTitle>
                      <CardDescription>
                        Current cargo details and status - تفاصيل وحالة الحمولة
                      </CardDescription>
                    </CardHeader>
                  </div>
                  <CardContent className="pt-2">
                    <div className="space-y-4">
                      {/* Oil Type Badge */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Oil Product Type:</span>
                        <Badge 
                          variant="outline"
                          className={`
                            ${getOilCategory(vessel.cargoType) === 'Crude' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              getOilCategory(vessel.cargoType) === 'Jet Fuel' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              getOilCategory(vessel.cargoType) === 'Diesel' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                              getOilCategory(vessel.cargoType) === 'Fuel Oil' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                              getOilCategory(vessel.cargoType) === 'Gas' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              getOilCategory(vessel.cargoType) === 'Gasoline' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-gray-50 text-gray-700 border-gray-200'
                            }
                          `}
                        >
                          <div className="flex items-center gap-1">
                            <Droplet className={`h-3 w-3 
                              ${getOilCategory(vessel.cargoType) === 'Crude' ? 'text-amber-500' :
                                getOilCategory(vessel.cargoType) === 'Jet Fuel' ? 'text-blue-500' :
                                getOilCategory(vessel.cargoType) === 'Diesel' ? 'text-indigo-500' :
                                getOilCategory(vessel.cargoType) === 'Fuel Oil' ? 'text-orange-500' :
                                getOilCategory(vessel.cargoType) === 'Gas' ? 'text-emerald-500' :
                                getOilCategory(vessel.cargoType) === 'Gasoline' ? 'text-red-500' :
                                'text-gray-500'
                              }
                            `} />
                            {getOilCategory(vessel.cargoType)}
                          </div>
                        </Badge>
                      </div>
                      
                      {/* Cargo Details */}
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm flex items-center">
                            <Tag className="h-4 w-4 mr-1 text-primary" />
                            Cargo Type
                          </span>
                          <span className="text-sm font-medium">
                            {vessel.cargoType || 'Not specified'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Cargo Volume with Visuals */}
                      <div className="space-y-3">
                        <div className="text-sm font-medium">Cargo Volume</div>
                        
                        {/* Show default cargo capacity */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Capacity:</span>
                            <span>{vessel.cargoCapacity ? `${vessel.cargoCapacity.toLocaleString()} barrels` : 'Unknown'}</span>
                          </div>
                          {vessel.cargoCapacity ? (
                            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-primary" style={{ width: '100%' }} />
                            </div>
                          ) : null}
                        </div>
                        
                        {/* Show estimated current cargo (95% of capacity) */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Current Cargo:</span>
                            <span>{vessel.cargoCapacity ? `${Math.round(vessel.cargoCapacity * 0.95).toLocaleString()} barrels` : 'Unknown'}</span>
                          </div>
                          {vessel.cargoCapacity ? (
                            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-blue-500" style={{ width: '95%' }} />
                            </div>
                          ) : null}
                        </div>
                        
                        {/* Show weight equivalent */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Weight Equivalent:</span>
                            <span>{vessel.cargoCapacity ? `${Math.round(vessel.cargoCapacity * 0.136).toLocaleString()} metric tons` : 'Unknown'}</span>
                          </div>
                        </div>
                        
                        {/* Add Arabic label */}
                        <div className="mt-2 text-xs text-center text-muted-foreground">
                          حجم الحمولة وسعة الشحن
                        </div>
                      </div>
                      
                      {/* Additional Cargo Details */}
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <h4 className="text-sm font-medium mb-2">Cargo Status</h4>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm flex items-center">
                            <Fuel className="h-4 w-4 mr-1 text-green-500" />
                            Loading Status
                          </span>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Fully Loaded
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm flex items-center">
                            <Activity className="h-4 w-4 mr-1 text-blue-500" />
                            Cargo Density
                          </span>
                          <span className="text-sm font-medium">
                            {getOilCategory(vessel.cargoType) === 'Crude' ? '0.85 g/ml' :
                             getOilCategory(vessel.cargoType) === 'Jet Fuel' ? '0.81 g/ml' :
                             getOilCategory(vessel.cargoType) === 'Diesel' ? '0.83 g/ml' :
                             getOilCategory(vessel.cargoType) === 'Fuel Oil' ? '0.92 g/ml' :
                             getOilCategory(vessel.cargoType) === 'Gas' ? '0.75 g/ml' :
                             getOilCategory(vessel.cargoType) === 'Gasoline' ? '0.72 g/ml' :
                             '0.85 g/ml'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Cargo Manifest
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Journey Progress Timeline Card */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <History className="h-5 w-5 mr-2 text-primary" />
                      Voyage Progress
                    </CardTitle>
                    <CardDescription>
                      Timeline of vessel's journey - جدول زمني لرحلة السفينة
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProgressTimeline events={progressEvents} />
                  </CardContent>
                </Card>
                
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Add Progress Event</CardTitle>
                      <CardDescription>
                        Record a new location or status update
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="event" className="text-sm font-medium">
                            Event Type
                          </label>
                          <Input id="event" placeholder="e.g. Departure, Arrival, Position Update" />
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="location" className="text-sm font-medium">
                            Location
                          </label>
                          <Input id="location" placeholder="Port or location name" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="lat" className="text-sm font-medium">
                              Latitude
                            </label>
                            <Input id="lat" placeholder="e.g. 51.5074" />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="lng" className="text-sm font-medium">
                              Longitude
                            </label>
                            <Input id="lng" placeholder="e.g. -0.1278" />
                          </div>
                        </div>
                        
                        <Button className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Event
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Vessel Documents</CardTitle>
                      <CardDescription>
                        Certificates, bills of lading, and other documents
                      </CardDescription>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Document
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    No documents available for this vessel
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