import { useState, useEffect } from 'react';
import { Vessel } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import VoyageDetails from '@/components/vessels/VoyageDetails';
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

// Removed ProgressTimeline component as requested

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
  
  // Function to fetch vessel data directly using REST API
  const fetchVesselData = async () => {
    if (!vesselId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/vessels/${vesselId}`);
      console.log("Vessel API response:", response.data);
      
      if (response.data) {
        setVessel(response.data);
        console.log("Setting vessel data:", response.data);
      } else {
        console.warn("Vessel API returned unexpected format:", response.data);
        toast({
          title: "Unexpected data format",
          description: "The server returned vessel data in an unexpected format.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching vessel data:', error);
      toast({
        title: "Failed to fetch vessel data",
        description: "We couldn't retrieve the vessel information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Function to fetch voyage progress data
  const fetchVoyageProgress = async () => {
    if (!vesselId || !vessel?.destinationPort) return;
    
    setIsLoadingVoyage(true);
    try {
      const response = await axios.get(`/api/vessels/${vesselId}/voyage-progress`);
      console.log("Voyage progress API response:", response.data);
      
      // The server always includes voyage data in a voyageProgress object
      if (response.data && response.data.voyageProgress) {
        setVoyageProgress(response.data.voyageProgress);
        console.log("Setting voyage progress to:", response.data.voyageProgress);
      } else {
        console.warn("Voyage progress API returned unexpected format:", response.data);
        toast({
          title: "Unexpected data format",
          description: "The server returned voyage data in an unexpected format.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching voyage progress:', error);
      toast({
        title: "Failed to fetch voyage data",
        description: "We couldn't retrieve the latest journey information.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingVoyage(false);
    }
  };
  
  // Function to fetch current location data
  const fetchCurrentLocation = async () => {
    if (!vesselId) return;
    
    setIsLoadingLocation(true);
    try {
      const response = await axios.get(`/api/vessels/${vesselId}/location`);
      console.log("Location API response:", response.data);
      
      // The server always includes location data in a currentLocation object
      if (response.data && response.data.currentLocation) {
        setCurrentLocation(response.data.currentLocation);
        console.log("Setting current location to:", response.data.currentLocation);
      } else {
        console.warn("Location API returned unexpected format:", response.data);
        toast({
          title: "Unexpected data format",
          description: "The server returned location data in an unexpected format.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching current location:', error);
      toast({
        title: "Failed to fetch location data",
        description: "We couldn't retrieve the latest vessel location.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingLocation(false);
    }
  };
  
  // Function to generate cargo manifest
  const generateCargoManifest = async (manifestType = "standard") => {
    if (!vesselId) return;
    
    setIsGeneratingManifest(true);
    try {
      // Create a link element to trigger the download
      const downloadLink = document.createElement('a');
      downloadLink.href = `/api/vessels/${vesselId}/cargo-manifest?type=${manifestType}`;
      downloadLink.target = '_blank';
      downloadLink.download = `cargo_manifest_${vessel?.name || 'vessel'}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      toast({
        title: "Cargo Manifest Generated",
        description: "Downloading cargo manifest for " + (vessel?.name || 'vessel'),
        variant: "default",
      });
    } catch (error) {
      console.error('Error generating cargo manifest:', error);
      toast({
        title: "Failed to generate manifest",
        description: "There was an error generating the cargo manifest.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingManifest(false);
    }
  };
  
  // Function to generate nut-specific cargo manifest
  const generateNutManifest = () => {
    generateCargoManifest("nut");
  };
  
  // Fetch vessel data on component mount
  useEffect(() => {
    if (vesselId) {
      fetchVesselData();
    }
  }, [vesselId]);
  
  // Load voyage data and location when vessel is available
  useEffect(() => {
    if (vessel && vessel.id) {
      fetchVoyageProgress();
      fetchCurrentLocation();
    }
  }, [vessel?.id]);
  
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
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <div className="flex items-center bg-blue-800/80 rounded-full px-3 py-1 text-sm">
                    <FileText className="h-4 w-4 mr-2" />
                    IMO: {vessel.imo}
                  </div>
                  <div className="flex items-center bg-blue-800/80 rounded-full px-3 py-1 text-sm">
                    <Compass className="h-4 w-4 mr-2" />
                    MMSI: {vessel.mmsi}
                  </div>
                  <div className="flex items-center bg-blue-800/80 rounded-full px-3 py-1 text-sm">
                    <Flag className="h-4 w-4 mr-2" />
                    {vessel.flag}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-4 md:mt-0">
                <Button 
                  variant="outline" 
                  className="bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Vessel
                </Button>
                <Button 
                  onClick={() => generateCargoManifest()}
                  disabled={isGeneratingManifest}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {isGeneratingManifest ? 'Generating...' : 'Cargo Manifest'}
                </Button>
                {vessel && vessel.cargoType && vessel.cargoType.toLowerCase().includes('nut') && (
                  <Button 
                    variant="outline" 
                    onClick={generateNutManifest}
                    disabled={isGeneratingManifest}
                    className="bg-amber-600 text-white border-amber-600/50 hover:bg-amber-700"
                  >
                    <FileCheck className="h-4 w-4 mr-2" />
                    {isGeneratingManifest ? 'Generating...' : 'Nut Cargo Manifest'}
                  </Button>
                )}
              </div>
            </div>
            
            {/* Live status indicator */}
            {vessel.status && (
              <div className="mt-4 flex items-center">
                <div className="flex items-center mr-4">
                  <span className="relative flex h-3 w-3 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  <span className="text-white text-sm">Live Tracking</span>
                </div>
                <div className="bg-blue-800/50 backdrop-blur-sm rounded-full px-3 py-1 text-sm text-white">
                  Status: {vessel.status || 'At Sea'}
                </div>
              </div>
            )}
          </div>
          
          <Tabs defaultValue="details" className="mt-6">
            <TabsList className="mb-4 bg-slate-100 p-1 rounded-lg">
              <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Info className="h-4 w-4 mr-2" />
                Details
              </TabsTrigger>
              <TabsTrigger value="journey" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Map className="h-4 w-4 mr-2" />
                Journey
              </TabsTrigger>
              <TabsTrigger value="documents" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Calendar className="h-4 w-4 mr-2" />
                Documents
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 overflow-hidden border-0 shadow-md">
                  <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-slate-50 border-b">
                    <CardTitle className="flex items-center">
                      <Ship className="h-5 w-5 mr-2 text-blue-600" />
                      Vessel Information
                    </CardTitle>
                    <CardDescription>
                      Technical details and specifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
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
                    <h3 className="font-medium mb-3">Journey Progress</h3>
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
              {/* Add the VoyageDetails component at the top of the journey tab */}
              <VoyageDetails 
                vessel={vessel as any}
                voyageProgress={voyageProgress}
                isLoadingVoyage={isLoadingVoyage}
                onRefreshVoyage={fetchVoyageProgress}
                currentLocation={currentLocation}
                isLoadingLocation={isLoadingLocation}
                onRefreshLocation={fetchCurrentLocation}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    No documents available for preview
                  </div>
                  <div className="flex justify-center mt-4">
                    <Button variant="outline" asChild>
                      <Link href={`/vessels/${vesselId}/documents`}>
                        <FileText className="h-4 w-4 mr-2" />
                        View All Documents
                      </Link>
                    </Button>
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