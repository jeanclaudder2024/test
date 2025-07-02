import { useState, useEffect } from 'react';
import { Vessel } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { SimpleVoyageDetails } from '@/components/vessels/SimpleVoyageDetails';
import SimpleVesselMap from '@/components/map/SimpleVesselMap';
import ProfessionalArticleGenerator from '@/components/vessels/ProfessionalArticleGenerator';


import axios from 'axios';
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
  MapPin, ExternalLink, Factory, AlertTriangle, RefreshCw, Route
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
  const [voyageInfo, setVoyageInfo] = useState<any>(null);
  const [isLoadingVoyageInfo, setIsLoadingVoyageInfo] = useState(false);
  const [isGeneratingManifest, setIsGeneratingManifest] = useState(false);
  const [refineries, setRefineries] = useState<any[]>([]);
  const [ports, setPorts] = useState<any[]>([]);
  
  // Helper function to get port name by ID or name
  const getPortName = (portIdOrName: number | string | null | undefined): string => {
    if (!portIdOrName) return 'Unknown Port';
    
    // If it's already a port name (string that doesn't look like an ID)
    if (typeof portIdOrName === 'string' && isNaN(Number(portIdOrName))) {
      return portIdOrName;
    }
    
    // If we have ports data, try to find the port by ID
    if (ports.length > 0) {
      const port = ports.find(p => p.id === Number(portIdOrName) || p.name === portIdOrName);
      if (port) {
        return `${port.name}, ${port.country}`;
      }
    }
    
    // If it's a number but we can't find the port, show it as is
    return typeof portIdOrName === 'string' ? portIdOrName : `Port ID: ${portIdOrName}`;
  };
  
  // Helper function to get departure port name with additional details
  const getDeparturePortName = (portIdOrName: number | string | null | undefined): string => {
    if (!portIdOrName) return 'Unknown Port';
    
    // If it's already a port name (string that doesn't look like an ID)
    if (typeof portIdOrName === 'string' && isNaN(Number(portIdOrName))) {
      return portIdOrName;
    }
    
    // If we have ports data, try to find the port by ID
    if (ports.length > 0) {
      const port = ports.find(p => p.id === Number(portIdOrName) || p.name === portIdOrName);
      if (port) {
        return `${port.name}, ${port.country}`;
      }
    }
    
    // If it's a number but we can't find the port, show it as is
    return typeof portIdOrName === 'string' ? portIdOrName : `Port ID: ${portIdOrName}`;
  };
  
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
  
  // Fetch voyage info from voyage simulation system
  const fetchVoyageInfo = async () => {
    if (!vesselId) return;
    
    setIsLoadingVoyageInfo(true);
    try {
      const response = await fetch(`/api/vessels/${vesselId}/voyage-info`);
      if (response.ok) {
        const data = await response.json();
        setVoyageInfo(data);
      } else {
        setVoyageInfo(null);
      }
    } catch (error) {
      console.error('Error fetching voyage info:', error);
      setVoyageInfo(null);
    } finally {
      setIsLoadingVoyageInfo(false);
    }
  };

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
        
        // Fetch voyage info after vessel data is loaded
        fetchVoyageInfo();
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

  // Set up interval to refresh voyage info every 30 seconds
  useEffect(() => {
    if (!vesselId) return;
    
    const interval = setInterval(() => {
      fetchVoyageInfo();
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [vesselId]);

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
              

            </div>
            

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

                  <TabsTrigger value="articles" className="flex items-center">
                    <FileCheck className="h-4 w-4 mr-2" />
                    Professional Articles
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
                    <CardContent className="p-4">
                      {vessel.currentLat && vessel.currentLng ? (
                        <SimpleVesselMap vessel={vessel} />
                      ) : (
                        <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                          <div className="text-center text-muted-foreground">
                            <MapPin className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                            <p className="text-lg font-medium">No Position Data</p>
                            <p className="text-sm">Vessel coordinates not available</p>
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
                        Real-time voyage tracking with simulation data - معلومات التتبع والتقدم في الوقت الفعلي
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Real-time voyage simulation display */}
                      {voyageInfo && (
                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <Ship className="h-5 w-5 mr-2 text-blue-600" />
                              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Live Voyage Simulation</h3>
                            </div>
                            <Badge 
                              variant={voyageInfo.status === 'in_port' ? 'default' : 
                                      voyageInfo.status === 'approaching' ? 'secondary' : 'outline'}
                              className="capitalize"
                            >
                              {voyageInfo.status?.replace('_', ' ') || 'Underway'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Voyage Progress</p>
                              <div className="flex items-center mt-1">
                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${voyageInfo.progressPercentage || 0}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                  {Math.round(voyageInfo.progressPercentage || 0)}%
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Current Day</p>
                              <p className="font-medium">{voyageInfo.currentDay}/{voyageInfo.totalDays} days</p>
                            </div>
                            
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Route Distance</p>
                              <p className="font-medium">
                                {voyageInfo.routeDistance > 0 ? `${voyageInfo.routeDistance.toLocaleString()} km` : 'Calculating...'}
                              </p>
                            </div>
                          </div>
                          
                          {voyageInfo.currentPosition && voyageInfo.currentPosition.lat && voyageInfo.currentPosition.lng && (
                            <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Current Position</p>
                              <p className="text-sm">
                                <span className="font-medium">Lat:</span> {parseFloat(voyageInfo.currentPosition.lat).toFixed(4)}°, 
                                <span className="font-medium ml-2">Lng:</span> {parseFloat(voyageInfo.currentPosition.lng).toFixed(4)}°
                              </p>
                              {voyageInfo.lastUpdate && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Last updated: {new Date(voyageInfo.lastUpdate).toLocaleString()}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {isLoadingVoyageInfo && (
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Loading voyage simulation data...</p>
                        </div>
                      )}
                      
                      {!voyageInfo && !isLoadingVoyageInfo && (
                        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                          <div className="flex items-center">
                            <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                              No active voyage simulation found. The vessel may not be on a tracked voyage.
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <SimpleVoyageDetails 
                        vessel={vessel} 
                        voyageProgress={{ 
                          percentComplete: vessel.voyageProgress || 45,
                          distanceTraveled: 1825,
                          distanceRemaining: 2231,
                          currentSpeed: vessel.currentSpeed || 12.5,
                          averageSpeed: 13.2,
                          estimatedArrival: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                        }}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                


                <TabsContent value="articles">
                  <ProfessionalArticleGenerator 
                    vesselId={vessel.id} 
                    vesselName={vessel.name} 
                  />
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Right sidebar with related information */}
            <div className="space-y-6">
              
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
                            <div className="font-medium">{getDeparturePortName(vessel.departurePort)}</div>
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
                              {typeof vessel.destinationPort === 'string' && vessel.destinationPort.startsWith('REF:') 
                                ? vessel.destinationPort.split(':')[2]
                                : getPortName(vessel.destinationPort)}
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
                      <span className="text-sm text-muted-foreground flex items-center">
                        🛢️ Oil Type / Cargo Type
                      </span>
                      <span className="font-medium">
                        {vessel.oilType || vessel.cargoType || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center">
                        📊 Quantity
                      </span>
                      <span className="font-medium">
                        {vessel.quantity && !isNaN(parseFloat(vessel.quantity))
                          ? `${parseFloat(vessel.quantity).toLocaleString()} barrels`
                          : vessel.cargoCapacity 
                          ? `${vessel.cargoCapacity.toLocaleString()} barrels` 
                          : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center">
                        💰 Value
                      </span>
                      <span className="font-medium">
                        {vessel.dealValue && !isNaN(parseFloat(vessel.dealValue))
                          ? `$${parseFloat(vessel.dealValue).toLocaleString()} USD`
                          : vessel.cargoType && vessel.cargoType.toLowerCase().includes('crude') 
                          ? '$45M - $60M USD'
                          : vessel.cargoType && vessel.cargoType.toLowerCase().includes('gas')
                          ? '$30M - $40M USD'
                          : '$25M - $35M USD'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center">
                        ⚓ Loading Port
                      </span>
                      <span className="font-medium">
                        {vessel.loadingPort || getDeparturePortName(vessel.departurePort) || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center">
                        ➕ Price
                      </span>
                      <span className="font-medium">
                        {vessel.price && !isNaN(parseFloat(vessel.price))
                          ? `$${parseFloat(vessel.price).toFixed(2)} per barrel`
                          : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center">
                        📈 Market Price
                      </span>
                      <span className="font-medium">
                        {vessel.marketPrice && !isNaN(parseFloat(vessel.marketPrice))
                          ? `$${parseFloat(vessel.marketPrice).toFixed(2)} per barrel`
                          : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center">
                        🏢 Source (اسم الشركة)
                      </span>
                      <span className="font-medium">
                        {vessel.sourceCompany || vessel.oilSource || vessel.sellerName || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center">
                        🏭 Refinery
                      </span>
                      <span className="font-medium">
                        {vessel.targetRefinery || 
                         (vessel.destinationPort && vessel.destinationPort.startsWith('REF:') 
                           ? vessel.destinationPort.split(':')[2] 
                           : 'N/A')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right sidebar with related information */}
            <div className="space-y-6">
              {/* Sidebar content would go here */}
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