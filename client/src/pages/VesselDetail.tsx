import { useState, useEffect } from 'react';
import { Vessel } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import VoyageDetails from '@/components/vessels/VoyageDetails';
import EnhancedVesselMap from '@/components/map/EnhancedVesselMap';
import axios from 'axios';
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
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft, Ship, Calendar, Map, Info, Edit, Plus, Navigation, Anchor,
  Flag, Droplet, Package, AlertCircle, Truck, Gauge, BarChart, History,
  Users, Clock, Compass, ArrowRight, FileText, FileCheck, Clipboard, Download, Globe,
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

// Form component for updating vessel location
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
        } else {
          console.error('Failed to load refineries');
        }
      } catch (error) {
        console.error('Error fetching refineries', error);
      } finally {
        setIsLoadingRefineries(false);
      }
    };
    
    fetchRefineries();
  }, []);

  const updateLocationMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest(`/api/vessels/${vesselId}/update-location`, { 
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: 'Location updated',
        description: 'Vessel location has been updated successfully',
        duration: 3000,
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update location',
        description: error.message || 'An error occurred while updating vessel location',
        variant: 'destructive',
        duration: 5000,
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: any = {
      currentLat: lat,
      currentLng: lng,
      eventDescription
    };
    
    if (destinationType === 'refinery' && destinationRefineryId) {
      const selectedRefinery = refineries.find(r => r.id.toString() === destinationRefineryId);
      if (selectedRefinery) {
        data.destinationPort = `REF:${selectedRefinery.id}:${selectedRefinery.name}`;
      }
    } else if (destinationType === 'port' && destinationPort) {
      data.destinationPort = destinationPort;
    } else {
      data.destinationPort = null; // Clear destination
    }
    
    updateLocationMutation.mutate(data);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input 
              id="latitude"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="e.g. 25.1972"
              type="number"
              step="0.0001"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input 
              id="longitude"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="e.g. 55.2744"
              type="number"
              step="0.0001"
              required
            />
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <Label htmlFor="eventDesc">Event Description (Optional)</Label>
          <Input 
            id="eventDesc"
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
            placeholder="e.g. Vessel diverted due to weather"
          />
        </div>
        
        <div className="mt-4 space-y-2">
          <Label>Destination</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button 
              type="button"
              variant={destinationType === 'none' ? 'default' : 'outline'}
              onClick={() => setDestinationType('none')}
              className="justify-start"
            >
              None
            </Button>
            <Button 
              type="button"
              variant={destinationType === 'refinery' ? 'default' : 'outline'}
              onClick={() => setDestinationType('refinery')}
              className="justify-start"
            >
              <Factory className="h-4 w-4 mr-2" />
              Refinery
            </Button>
            <Button 
              type="button"
              variant={destinationType === 'port' ? 'default' : 'outline'}
              onClick={() => setDestinationType('port')}
              className="justify-start"
            >
              <Anchor className="h-4 w-4 mr-2" />
              Port
            </Button>
          </div>
        </div>
        
        {destinationType === 'refinery' && (
          <div className="mt-4 space-y-2">
            <Label htmlFor="refinery">Select Refinery</Label>
            <select 
              id="refinery"
              value={destinationRefineryId}
              onChange={(e) => setDestinationRefineryId(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              required={destinationType === 'refinery'}
            >
              <option value="">Select a refinery...</option>
              {refineries.map((refinery) => (
                <option key={refinery.id} value={refinery.id}>
                  {refinery.name} ({refinery.country})
                </option>
              ))}
            </select>
          </div>
        )}
        
        {destinationType === 'port' && (
          <div className="mt-4 space-y-2">
            <Label htmlFor="port">Port Name</Label>
            <Input 
              id="port"
              value={destinationPort}
              onChange={(e) => setDestinationPort(e.target.value)}
              placeholder="e.g. Port of Rotterdam"
              required={destinationType === 'port'}
            />
          </div>
        )}
        
        <div className="mt-6">
          <Button 
            type="submit" 
            className="w-full"
            disabled={updateLocationMutation.isPending}
          >
            {updateLocationMutation.isPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-background"></div>
                Updating...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Update Location
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default function VesselDetail() {
  const [, params] = useRoute('/vessels/:id');
  const vesselId = params?.id ? parseInt(params.id) : null;
  const { toast } = useToast();
  const [vessel, setVessel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [voyageProgress, setVoyageProgress] = useState<any>(null);
  const [isLoadingVoyage, setIsLoadingVoyage] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isGeneratingManifest, setIsGeneratingManifest] = useState(false);
  const [refineries, setRefineries] = useState<any[]>([]);
  const [ports, setPorts] = useState<any[]>([]);
  
  // Fetch refineries data for map connections
  useEffect(() => {
    const fetchRefineries = async () => {
      try {
        const response = await axios.get('/api/refineries');
        if (response.status === 200) {
          setRefineries(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch refineries for map:', error);
      }
    };
    
    fetchRefineries();
  }, []);
  
  // Fetch ports data for map connections
  useEffect(() => {
    const fetchPorts = async () => {
      try {
        const response = await axios.get('/api/ports');
        if (response.status === 200) {
          setPorts(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch ports for map:', error);
      }
    };
    
    fetchPorts();
  }, []);
  
  useEffect(() => {
    const fetchVessel = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/vessels/${vesselId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch vessel');
        }
        const data = await response.json();
        setVessel(data);
      } catch (error) {
        console.error('Error fetching vessel:', error);
        toast({
          title: 'Error',
          description: 'Failed to load vessel data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (vesselId) {
      fetchVessel();
    }
  }, [vesselId, toast]);

  const handleLocationUpdateSuccess = () => {
    // Refetch vessel
    const fetchVessel = async () => {
      try {
        const response = await fetch(`/api/vessels/${vesselId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch vessel');
        }
        const data = await response.json();
        setVessel(data);
      } catch (error) {
        console.error('Error refetching vessel:', error);
      }
    };
    
    fetchVessel();
    setIsUpdatingLocation(false);
  };
  
  // Generate a vessel document or manifest
  const generateVesselDocument = async (documentType: string) => {
    if (!vessel) return;
    
    setIsGeneratingManifest(true);
    try {
      // Use the reliable PDF generator endpoint that is guaranteed to work
      const response = await axios.post(`/api/vessels/${vessel.id}/reliable-pdf`, {
        documentType
      }, {
        responseType: 'blob', // Important: get response as binary data
      });
      
      // Create a download link and click it
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${vessel.name}_${documentType.toLowerCase().replace(/\s/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast({
        title: 'Document Generated',
        description: `The ${documentType} for ${vessel.name} has been downloaded`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error generating document:', error);
      toast({
        title: 'Document Generation Failed',
        description: 'An error occurred while generating the document',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsGeneratingManifest(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!vessel) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-destructive/15 p-4 rounded-md">
          <h1 className="text-xl font-semibold text-destructive">Vessel not found</h1>
          <p className="mt-2">The vessel you're looking for does not exist or has been removed.</p>
        </div>
        <div className="mt-4">
          <Link href="/vessels">
            <Button variant="outline" className="flex items-center">
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
        <Button variant="ghost" className="mb-4 hover:bg-blue-50 transition-colors">
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
          {/* Header with vessel name, status badge and actions */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg p-6 mb-6 shadow-lg">
            <div className="absolute opacity-10 right-0 bottom-0">
              <Ship className="h-64 w-64 text-white" />
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
              <div className="text-white">
                <div className="flex items-center space-x-3 mb-1">
                  <h1 className="text-3xl font-bold flex items-center">
                    {vessel.name}
                  </h1>
                  <Badge className="bg-blue-600 hover:bg-blue-700">
                    {getOilCategory(vessel.cargoType)}
                  </Badge>
                </div>
                <p className="text-blue-100">
                  {vessel.vesselType || 'Oil Tanker'} • IMO: {vessel.imo || 'N/A'} • MMSI: {vessel.mmsi || 'N/A'}
                </p>
              </div>
              
              <div className="flex space-x-2 mt-4 md:mt-0">
                <Button 
                  variant="outline" 
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
                  onClick={() => setIsUpdatingLocation(!isUpdatingLocation)}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {isUpdatingLocation ? 'Cancel' : 'Update Location'}
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
                  onClick={() => generateVesselDocument('Cargo Manifest')}
                  disabled={isGeneratingManifest}
                >
                  {isGeneratingManifest ? (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <FileText className="mr-2 h-4 w-4" />
                  )}
                  Generate Manifest
                </Button>
              </div>
            </div>
            
            {isUpdatingLocation && (
              <div className="mt-6 p-4 bg-white/10 rounded-md">
                <h3 className="text-white text-lg font-medium mb-4">Update Vessel Location</h3>
                <LocationUpdateForm 
                  vesselId={vessel.id}
                  initialLat={vessel.currentLat}
                  initialLng={vessel.currentLng}
                  onSuccess={handleLocationUpdateSuccess}
                />
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              {/* Main content area */}
              <Tabs defaultValue="details" className="mb-6">
                <TabsList className="mb-4">
                  <TabsTrigger value="details" className="flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Vessel Details
                  </TabsTrigger>
                  <TabsTrigger value="voyage" className="flex items-center">
                    <Compass className="h-4 w-4 mr-2" />
                    Voyage
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Documents
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="details">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center">
                        <Ship className="h-5 w-5 mr-2 text-primary" />
                        Vessel Specifications
                      </CardTitle>
                      <CardDescription>
                        Technical details and specifications - التفاصيل والمواصفات التقنية
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-medium mb-3 flex items-center">
                            <Info className="h-4 w-4 mr-2 text-primary" />
                            General Information
                          </h3>
                          <InfoItem 
                            label={<span className="flex items-center"><Ship className="h-4 w-4 mr-1" /> Vessel Type</span>}
                            value={vessel.vesselType || 'Oil Tanker'} 
                          />
                          <InfoItem 
                            label={<span className="flex items-center"><Info className="h-4 w-4 mr-1" /> IMO Number</span>}
                            value={vessel.imo || 'N/A'} 
                          />
                          <InfoItem 
                            label={<span className="flex items-center"><Info className="h-4 w-4 mr-1" /> MMSI</span>}
                            value={vessel.mmsi || 'N/A'} 
                          />
                          <InfoItem 
                            label={<span className="flex items-center"><Flag className="h-4 w-4 mr-1" /> Flag</span>}
                            value={vessel.flag || 'N/A'} 
                          />
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium mb-3 flex items-center">
                            <Droplet className="h-4 w-4 mr-2 text-primary" />
                            Cargo & Position
                          </h3>
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
                  
                  <Card className="mt-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center">
                        <Navigation className="h-5 w-5 mr-2 text-primary" />
                        Enhanced Live Tracking
                      </CardTitle>
                      <CardDescription>
                        Real-time position with nearby ports and refineries (20km radius)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      {vessel.currentLat && vessel.currentLng ? (
                        <div className="relative">
                          <EnhancedVesselMap 
                            vessel={vessel}
                            initialLat={vessel.currentLat}
                            initialLng={vessel.currentLng}
                          />
                        </div>
                      ) : (
                        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
                          <div className="text-center text-muted-foreground">
                            <MapPin className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
                            <p>No position data available</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="voyage">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center">
                        <Compass className="h-5 w-5 mr-2 text-primary" />
                        Current Voyage
                      </CardTitle>
                      <CardDescription>
                        Tracking information and progress - معلومات التتبع والتقدم
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <VoyageDetails 
                        vessel={vessel} 
                        voyageProgress={{ 
                          percentComplete: vessel.voyageProgress || 45,
                          distanceTraveled: 1825,
                          distanceRemaining: 2231,
                          currentSpeed: vessel.currentSpeed || 12.5,
                          averageSpeed: 13.2,
                          estimatedArrival: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                        }}
                        isLoadingVoyage={false}
                        onRefreshVoyage={() => {}}
                        currentLocation={{
                          lat: vessel.currentLat,
                          lng: vessel.currentLng
                        }}
                        isLoadingLocation={false}
                        onRefreshLocation={() => {}}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="documents">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-primary" />
                        Vessel Documents
                      </CardTitle>
                      <CardDescription>
                        Official documentation for this vessel - الوثائق الرسمية لهذه السفينة
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-start">
                              <div className="bg-primary/10 p-2 rounded-md mr-3">
                                <FileCheck className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-medium">Cargo Manifest</h3>
                                <p className="text-xs text-muted-foreground mt-1">Detailed inventory of cargo</p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-3"
                              onClick={() => generateVesselDocument('Cargo Manifest')}
                              disabled={isGeneratingManifest}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              {isGeneratingManifest ? 'Generating...' : 'Generate & Download'}
                            </Button>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-start">
                              <div className="bg-primary/10 p-2 rounded-md mr-3">
                                <FileCheck className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-medium">Bill of Lading</h3>
                                <p className="text-xs text-muted-foreground mt-1">Receipt of freight services</p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-3"
                              onClick={() => generateVesselDocument('Bill of Lading')}
                              disabled={isGeneratingManifest}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              {isGeneratingManifest ? 'Generating...' : 'Generate & Download'}
                            </Button>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-start">
                              <div className="bg-primary/10 p-2 rounded-md mr-3">
                                <FileCheck className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-medium">Certificate of Origin</h3>
                                <p className="text-xs text-muted-foreground mt-1">Proof of cargo origin</p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-3"
                              onClick={() => generateVesselDocument('Certificate of Origin')}
                              disabled={isGeneratingManifest}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              {isGeneratingManifest ? 'Generating...' : 'Generate & Download'}
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <Separator className="my-6" />
                      
                      <div>
                        <h3 className="text-sm font-medium mb-4 flex items-center">
                          <History className="h-4 w-4 mr-2 text-primary" />
                          Document History
                        </h3>
                        
                        <div className="text-sm">
                          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-3 text-muted-foreground" />
                              <span>Bill of Lading #OT-87654</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-xs text-muted-foreground mr-3">Generated on Apr 15, 2023</span>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-3 text-muted-foreground" />
                              <span>Cargo Manifest #CM-12345</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-xs text-muted-foreground mr-3">Generated on Apr 10, 2023</span>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between py-3">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-3 text-muted-foreground" />
                              <span>Certificate of Origin #CO-54321</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-xs text-muted-foreground mr-3">Generated on Apr 10, 2023</span>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Right sidebar with related information */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-primary" />
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Activity</span>
                      <Badge variant={Number(vessel.currentSpeed) > 3 ? "default" : "outline"} className={Number(vessel.currentSpeed) > 3 ? "bg-green-500" : ""}>
                        {Number(vessel.currentSpeed) > 3 ? "In Transit" : "Stationary"}
                      </Badge>
                    </div>
                    
                    {/* Journey Progress Section */}
                    {vessel.departurePort && vessel.destinationPort && (
                      <>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm text-muted-foreground">Voyage Progress</span>
                          <div className="text-sm font-medium">
                            {(() => {
                              // Extract enhanced vessel data from metadata if available
                              try {
                                const metadata = vessel.metadata ? JSON.parse(vessel.metadata) : null;
                                const voyageProgress = metadata?.voyageProgress || 0;
                                return (
                                  <span className="flex items-center">
                                    {Math.round(voyageProgress)}%
                                    {metadata?.generatedData && 
                                      <Badge variant="outline" className="ml-2 text-xs bg-blue-50 border-blue-200 text-blue-700">AI Enhanced</Badge>
                                    }
                                  </span>
                                );
                              } catch (error) {
                                console.error("Error parsing vessel metadata:", error);
                                return "N/A";
                              }
                            })()}
                          </div>
                        </div>
                        
                        <div className="mt-1 mb-2 relative">
                          <Progress 
                            value={(() => {
                              // Extract voyage progress from metadata
                              try {
                                const metadata = vessel.metadata ? JSON.parse(vessel.metadata) : null;
                                return metadata?.voyageProgress || 0;
                              } catch (error) {
                                return 0;
                              }
                            })()} 
                            className="h-2 voyage-progress-bar" 
                          />
                          {/* Pulsing indicator for active voyage */}
                          {(() => {
                            try {
                              const metadata = vessel.metadata ? JSON.parse(vessel.metadata) : null;
                              const progress = metadata?.voyageProgress || 0;
                              return progress > 0 && progress < 100 ? (
                                <div 
                                  className="absolute top-0 h-2 rounded pulse-animation" 
                                  style={{ 
                                    left: `${progress - 1}%`, 
                                    width: '6px', 
                                    backgroundColor: 'var(--primary)'
                                  }}
                                />
                              ) : null;
                            } catch (error) {
                              return null;
                            }
                          })()}
                        </div>
                        
                        <div className="flex text-xs justify-between px-1 mb-3">
                          <span className="text-muted-foreground">{vessel.departurePort.split(',')[0]}</span>
                          <span className="text-muted-foreground">{vessel.destinationPort.split(',')[0]}</span>
                        </div>
                      </>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current Speed</span>
                      <span className="font-medium">{vessel.currentSpeed || 0} knots</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Last Updated</span>
                      <span className="font-medium">
                        {vessel.lastUpdated ? formatDate(new Date(vessel.lastUpdated)) : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Voyage Progress</span>
                      <span className="font-medium">{voyageProgress?.percent || 0}%</span>
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <div className="mb-1 flex justify-between text-xs">
                        <span>Transit Progress</span>
                        <span>{vessel.voyageProgress || 0}%</span>
                      </div>
                      <Progress value={vessel.voyageProgress || 0} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    Voyage Info
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-4">
                    {vessel.departurePort && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Departed From</div>
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 text-red-500 mr-2 mt-0.5" />
                          <div>
                            <div className="font-medium">{vessel.departurePort}</div>
                            {vessel.lastPortDepatureTime && (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {formatDate(new Date(vessel.lastPortDepatureTime))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {vessel.destinationPort && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Destination</div>
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                          <div>
                            <div className="font-medium">
                              {vessel.destinationPort.startsWith('REF:') 
                                ? vessel.destinationPort.split(':')[2]
                                : vessel.destinationPort}
                            </div>
                            {vessel.estimatedArrivalTime && (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                ETA: {formatDate(new Date(vessel.estimatedArrivalTime))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Distance & Time</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                          <div className="text-xs text-muted-foreground">Total Distance</div>
                          <div className="font-medium">3,500 nm</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                          <div className="text-xs text-muted-foreground">Time Remaining</div>
                          <div className="font-medium">3 days 14 hrs</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <BarChart className="h-5 w-5 mr-2 text-primary" />
                    Cargo Info
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Cargo Type</span>
                      <span className="font-medium">
                        {vessel.cargoType || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Quantity</span>
                      <span className="font-medium">
                        {vessel.cargoCapacity 
                          ? `${vessel.cargoCapacity.toLocaleString()} barrels` 
                          : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Value (est.)</span>
                      <span className="font-medium">
                        {vessel.cargoType && vessel.cargoType.toLowerCase().includes('crude') 
                          ? '$45M - $60M USD'
                          : vessel.cargoType && vessel.cargoType.toLowerCase().includes('gas')
                          ? '$30M - $40M USD'
                          : '$25M - $35M USD'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Loading Status</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Fully Loaded
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium">Vessel Not Found</h3>
            <p className="text-muted-foreground mt-2">The vessel you're looking for doesn't exist.</p>
          </div>
        </div>
      )}
    </div>
  );
}