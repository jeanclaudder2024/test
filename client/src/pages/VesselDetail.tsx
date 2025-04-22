import { useState, useEffect } from 'react';
import { useDataStream } from '@/hooks/useDataStream';
import { Vessel, ProgressEvent } from '@/types';
import { useVesselProgressEvents, useAddProgressEvent } from '@/hooks/useVessels';
import { useToast } from '@/hooks/use-toast';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
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
import {
  ArrowLeft, Ship, Calendar, Map, Info, Edit, Plus, Navigation, Anchor,
  Flag, Droplet, Package, AlertCircle, Truck, Gauge, BarChart, History,
  Users, Clock, Compass, ArrowRight, FileText, Clipboard, Download, Globe,
  ZoomIn, ZoomOut, Fuel, Activity, Layers, Filter, Tag
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

export default function VesselDetail() {
  const [, params] = useRoute('/vessels/:id');
  const vesselId = params?.id ? parseInt(params.id) : null;
  const { vessels, loading } = useDataStream();
  const { data: progressEvents = [], isLoading: progressLoading } = useVesselProgressEvents(vesselId);
  const { toast } = useToast();
  
  // Find the vessel from our stream data
  const vessel = vessels.find(v => v.id === vesselId);
  
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
                            center={[vessel.currentLat, vessel.currentLng]}
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
                              position={[vessel.currentLat, vessel.currentLng]}
                              icon={L.divIcon({
                                className: 'vessel-position-marker',
                                html: `<div class="w-4 h-4 rounded-full bg-orange-500 border-2 border-white pulse-animation"></div>`,
                                iconSize: [16, 16],
                              })}
                            >
                              <Popup>Current position of {vessel.name}</Popup>
                            </Marker>
                          </MapContainer>
                          <div className="absolute top-2 right-2 z-[1000] bg-white rounded-md shadow-sm">
                            <Button variant="ghost" size="icon" className="p-1 text-gray-600 hover:bg-gray-100 hover:text-primary h-8 w-8">
                              <ZoomIn className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="p-1 text-gray-600 hover:bg-gray-100 hover:text-primary h-8 w-8 border-t border-gray-100">
                              <ZoomOut className="h-4 w-4" />
                            </Button>
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
                      <InfoItem 
                        label={<span className="flex items-center"><Anchor className="h-4 w-4 mr-1" /> Port</span>} 
                        value={vessel.destinationPort || 'N/A'} 
                      />
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
                    <h3 className="font-medium mb-3">Journey Progress</h3>
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block text-primary">
                            {vessel.departureDate && vessel.eta ? "48%" : "N/A"}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-primary">
                            {vessel.departureDate && vessel.eta ? formatDate(vessel.departureDate) + " → " + formatDate(vessel.eta) : "Unknown Duration"}
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary/20">
                        <div style={{ width: "48%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <div>{vessel.departurePort}</div>
                        <div>Current Position</div>
                        <div>{vessel.destinationPort}</div>
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