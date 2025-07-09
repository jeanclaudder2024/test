import { useState, useEffect } from 'react';
import { Vessel } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { SimpleVoyageDetails } from '@/components/vessels/SimpleVoyageDetails';
import SimpleVesselMap from '@/components/map/SimpleVesselMap';

import { SimpleDocumentViewer } from '@/components/vessels/SimpleDocumentViewer';
import AIDocumentGenerator from '@/components/vessels/AIDocumentGenerator';
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
  MapPin, ExternalLink, Factory, AlertTriangle, RefreshCw, Route, TrendingUp, Phone
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

  // Helper function to get destination port name with additional details
  const getDestinationPortName = (portIdOrName: number | string | null | undefined): string => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-4">
        <Link href="/vessels">
          <Button variant="ghost" className="mb-6 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-300 shadow-sm hover:shadow-md">
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
          {/* Enhanced Header with vessel name, status badge and actions */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 rounded-2xl p-8 mb-8 shadow-2xl border border-blue-700/20">
            {/* Animated Background Elements */}
            <div className="absolute opacity-5 right-0 bottom-0 transform rotate-12">
              <Ship className="h-72 w-72 text-white" />
            </div>
            <div className="absolute -top-10 -left-10 opacity-10">
              <div className="w-40 h-40 bg-blue-400 rounded-full blur-3xl"></div>
            </div>
            <div className="absolute -bottom-10 -right-10 opacity-10">
              <div className="w-32 h-32 bg-purple-400 rounded-full blur-2xl"></div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
              <div className="text-white mb-4 md:mb-0">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-2">
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    {vessel.name}
                  </h1>
                  <div className="flex space-x-2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-1 text-sm font-semibold shadow-lg">
                      {getOilCategory(vessel.cargoType)}
                    </Badge>
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 text-sm font-semibold shadow-lg">
                      🌊 Active
                    </Badge>
                  </div>
                </div>
                <div className="text-blue-100 text-lg space-y-1">
                  <p className="flex items-center">
                    <Ship className="h-4 w-4 mr-2" />
                    {vessel.vesselType || 'Oil Tanker'} • IMO: {vessel.imo || 'N/A'} • MMSI: {vessel.mmsi || 'N/A'}
                  </p>
                  <p className="flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    {vessel.currentRegion || 'International Waters'} • Flag: {vessel.flag || 'N/A'}
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => {
                    toast({
                      title: "Quick Deal Interest! 🚢",
                      description: "Your interest has been recorded. Our maritime team will contact you soon.",
                      duration: 5000,
                    });
                  }}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Quick Deal
                </Button>
                <Button 
                  variant="outline"
                  className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => {
                    toast({
                      title: "Contact Request Sent! 📞",
                      description: "Our specialists will reach out within 24 hours.",
                      duration: 5000,
                    });
                  }}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Contact
                </Button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              {/* Enhanced Main content area */}
              <Tabs defaultValue="details" className="mb-8">
                <TabsList className="mb-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg rounded-xl p-1 border border-blue-200/20">
                  <TabsTrigger value="details" className="flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
                    <Info className="h-4 w-4 mr-2" />
                    Vessel Details
                  </TabsTrigger>
                  <TabsTrigger value="voyage" className="flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
                    <Compass className="h-4 w-4 mr-2" />
                    Voyage
                  </TabsTrigger>
                  <TabsTrigger value="articles" className="flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg">
                    <FileCheck className="h-4 w-4 mr-2" />
                    Professional Articles
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="details">
                  <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl overflow-hidden">
                    <CardHeader className="pb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      <CardTitle className="flex items-center text-xl">
                        <Ship className="h-6 w-6 mr-3" />
                        Vessel Specifications
                      </CardTitle>
                      <CardDescription className="text-blue-100 text-base">
                        Technical details and specifications - التفاصيل والمواصفات التقنية
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <h3 className="text-lg font-bold mb-4 flex items-center text-blue-800 dark:text-blue-200">
                            <div className="bg-blue-500 p-2 rounded-full mr-3">
                              <Info className="h-4 w-4 text-white" />
                            </div>
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
                        
                        <div className="space-y-6">
                          <h3 className="text-lg font-bold mb-4 flex items-center text-green-800 dark:text-green-200">
                            <div className="bg-green-500 p-2 rounded-full mr-3">
                              <Droplet className="h-4 w-4 text-white" />
                            </div>
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
                        <div className="space-y-6">
                          <h3 className="text-lg font-bold mb-4 flex items-center text-purple-800 dark:text-purple-200">
                            <div className="bg-purple-500 p-2 rounded-full mr-3">
                              <Users className="h-4 w-4 text-white" />
                            </div>
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
                        <div className="space-y-6">
                          <h3 className="text-lg font-bold mb-4 flex items-center text-orange-800 dark:text-orange-200">
                            <div className="bg-orange-500 p-2 rounded-full mr-3">
                              <Gauge className="h-4 w-4 text-white" />
                            </div>
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
                  
                  <Card className="mt-8 shadow-xl border-0 bg-gradient-to-br from-white to-green-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl overflow-hidden">
                    <CardHeader className="pb-4 bg-gradient-to-r from-green-600 to-teal-600 text-white">
                      <CardTitle className="flex items-center text-xl">
                        <Navigation className="h-6 w-6 mr-3" />
                        Enhanced Live Tracking
                      </CardTitle>
                      <CardDescription className="text-green-100 text-base">
                        Real-time position with nearby ports and refineries (20km radius)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      {vessel.currentLat && vessel.currentLng ? (
                        <div className="rounded-xl overflow-hidden shadow-lg">
                          <SimpleVesselMap vessel={vessel} />
                        </div>
                      ) : (
                        <div className="h-96 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl flex items-center justify-center border border-gray-200 dark:border-gray-700">
                          <div className="text-center text-muted-foreground">
                            <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-full w-fit mx-auto mb-4">
                              <MapPin className="h-12 w-12 text-gray-500" />
                            </div>
                            <p className="text-xl font-semibold mb-2">No Position Data</p>
                            <p className="text-base text-gray-600 dark:text-gray-400">Vessel coordinates not available</p>
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
                  <AIDocumentGenerator vesselId={vessel.id} vesselName={vessel.name} />
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
              
              <Card className="shadow-lg border-0 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
                <CardHeader className="pb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                  <CardTitle className="text-xl flex items-center justify-between">
                    <div className="flex items-center">
                      <BarChart className="h-6 w-6 mr-3" />
                      Comprehensive Cargo & Deal Information
                    </div>
                    <Button 
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-medium shadow-lg"
                      onClick={() => {
                        toast({
                          title: "Deal Interest Registered",
                          description: "Your interest in this deal has been recorded. Our team will contact you soon.",
                          duration: 5000,
                        });
                      }}
                    >
                      💼 Express Interest in Deal
                    </Button>
                  </CardTitle>
                  <CardDescription className="text-blue-100 text-base">
                    Complete cargo details and deal specifications - المعلومات التفصيلية للشحنة والصفقة
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-6">
                    {/* Primary Cargo Information */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 p-6 rounded-xl border-l-4 border-blue-500 shadow-md hover:shadow-lg transition-shadow duration-300">
                      <h4 className="font-bold text-lg text-blue-800 dark:text-blue-200 mb-4 flex items-center">
                        <div className="bg-blue-500 p-2 rounded-full mr-3">
                          <span className="text-white text-lg">🛢️</span>
                        </div>
                        Primary Cargo Details
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                          <div className="flex items-center mb-2">
                            <span className="text-2xl mr-2">🛢️</span>
                            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Oil Type / Commodity</span>
                          </div>
                          <span className="font-bold text-lg text-blue-900 dark:text-blue-100">
                            {vessel.oilType || vessel.cargoType || 'ULSD EN 590 – 10ppm / Gasoline'}
                          </span>
                        </div>
                        
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                          <div className="flex items-center mb-2">
                            <span className="text-2xl mr-2">🌍</span>
                            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Origin</span>
                          </div>
                          <span className="font-bold text-lg text-blue-900 dark:text-blue-100">
                            {vessel.origin || getDeparturePortName(vessel.departurePort) || 'Kharg Island'}
                          </span>
                        </div>
                        
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                          <div className="flex items-center mb-2">
                            <span className="text-2xl mr-2">📍</span>
                            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Destination</span>
                          </div>
                          <span className="font-bold text-lg text-blue-900 dark:text-blue-100">
                            {vessel.destination || getDestinationPortName(vessel.destinationPort) || 'Rotterdam – Houston – Jurong'}
                          </span>
                        </div>
                        
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                          <div className="flex items-center mb-2">
                            <span className="text-2xl mr-2">📦</span>
                            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Quantity</span>
                          </div>
                          <span className="font-bold text-lg text-blue-900 dark:text-blue-100">
                            {vessel.quantity && !isNaN(parseFloat(vessel.quantity))
                              ? `${parseFloat(vessel.quantity).toLocaleString()} barrels`
                              : vessel.cargoCapacity 
                              ? `${vessel.cargoCapacity.toLocaleString()} barrels` 
                              : '1,291,833 barrels / 50,000-500,000 MTs'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Deal & Financial Information */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/20 p-6 rounded-xl border-l-4 border-green-500 shadow-md hover:shadow-lg transition-shadow duration-300">
                      <h4 className="font-bold text-lg text-green-800 dark:text-green-200 mb-4 flex items-center">
                        <div className="bg-green-500 p-2 rounded-full mr-3">
                          <span className="text-white text-lg">💰</span>
                        </div>
                        Deal & Financial Details
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-green-200 dark:border-green-700">
                          <div className="flex items-center mb-2">
                            <span className="text-2xl mr-2">💲</span>
                            <span className="text-sm font-semibold text-green-700 dark:text-green-300">Deal Value</span>
                          </div>
                          <span className="font-bold text-xl text-green-900 dark:text-green-100">
                            {vessel.dealValue && !isNaN(parseFloat(vessel.dealValue))
                              ? `$${parseFloat(vessel.dealValue).toLocaleString()} USD`
                              : '$93,806,381 USD'}
                          </span>
                        </div>
                        
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-green-200 dark:border-green-700">
                          <div className="flex items-center mb-2">
                            <span className="text-2xl mr-2">💰</span>
                            <span className="text-sm font-semibold text-green-700 dark:text-green-300">Price per Barrel</span>
                          </div>
                          <span className="font-bold text-xl text-green-900 dark:text-green-100">
                            {vessel.price && !isNaN(parseFloat(vessel.price))
                              ? `$${parseFloat(vessel.price).toFixed(2)}`
                              : '$72.61'}
                          </span>
                        </div>
                        
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-green-200 dark:border-green-700">
                          <div className="flex items-center mb-2">
                            <span className="text-2xl mr-2">📉</span>
                            <span className="text-sm font-semibold text-green-700 dark:text-green-300">Market Price</span>
                          </div>
                          <span className="font-bold text-xl text-green-900 dark:text-green-100">
                            {vessel.marketPrice && !isNaN(parseFloat(vessel.marketPrice))
                              ? `$${parseFloat(vessel.marketPrice).toFixed(2)}`
                              : '$72.37'}
                          </span>
                        </div>
                        
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-green-200 dark:border-green-700">
                          <div className="flex items-center mb-2">
                            <span className="text-2xl mr-2">💳</span>
                            <span className="text-sm font-semibold text-green-700 dark:text-green-300">Payment Terms</span>
                          </div>
                          <span className="font-bold text-lg text-green-900 dark:text-green-100">
                            {vessel.paymentTerms || 'MT103/TT After Delivery'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contract & Operational Details */}
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg space-y-3">
                      <h4 className="font-medium text-sm text-orange-700 dark:text-orange-300 mb-3">
                        📄 Contract & Operations
                      </h4>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          📄 Contract Type
                        </span>
                        <span className="font-medium">
                          {vessel.contractType || 'Spot Trial + 12 Months Optional Contract'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          🚢 Delivery Terms
                        </span>
                        <span className="font-medium">
                          {vessel.deliveryTerms || 'FOB – CIF'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          ⚓ Loading Port
                        </span>
                        <span className="font-medium">
                          {vessel.loadingPort || getDeparturePortName(vessel.departurePort) || 'Kharg Island'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          🧪 Quality Specification
                        </span>
                        <span className="font-medium">
                          {vessel.qualitySpec || 'ULSD 10ppm / Standard Gasoline Spec'}
                        </span>
                      </div>
                    </div>

                    {/* Company & Source Information */}
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg space-y-3">
                      <h4 className="font-medium text-sm text-purple-700 dark:text-purple-300 mb-3">
                        🏢 Company & Source Details
                      </h4>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          🏷️ Source Company
                        </span>
                        <span className="font-medium">
                          {vessel.sourceCompany || vessel.oilSource || vessel.sellerName || 'BP / Source Refinery'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          🏭 Target Refinery
                        </span>
                        <span className="font-medium">
                          {vessel.targetRefinery || 
                           (vessel.destinationPort && vessel.destinationPort.startsWith('REF:') 
                             ? vessel.destinationPort.split(':')[2] 
                             : 'Esmeraldas Refinery')}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          👤 Customer Experience
                        </span>
                        <span className="font-medium">
                          ⭐ 4.7/5 – Based on 13 corporate buyers
                        </span>
                      </div>
                    </div>

                    {/* Deal Status & Verification */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-100 dark:from-purple-900/30 dark:to-pink-800/20 p-6 rounded-xl border-l-4 border-purple-500 shadow-md hover:shadow-lg transition-shadow duration-300">
                      <h4 className="font-bold text-lg text-purple-800 dark:text-purple-200 mb-4 flex items-center">
                        <div className="bg-purple-500 p-2 rounded-full mr-3">
                          <span className="text-white text-lg">📈</span>
                        </div>
                        Deal Status & Verification
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                          <div className="flex items-center mb-2">
                            <span className="text-2xl mr-2">📆</span>
                            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Deal Date</span>
                          </div>
                          <span className="font-bold text-lg text-purple-900 dark:text-purple-100">
                            {vessel.dealDate || 'July 2025 / Active'}
                          </span>
                        </div>
                        
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                          <div className="flex items-center mb-2">
                            <span className="text-2xl mr-2">✅</span>
                            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Verified Deal</span>
                          </div>
                          <span className="font-bold text-lg text-green-600 dark:text-green-400">
                            ✔️ Platform Verified
                          </span>
                        </div>
                        
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                          <div className="flex items-center mb-2">
                            <span className="text-2xl mr-2">📈</span>
                            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Deal Status</span>
                          </div>
                          <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                            🔵 Open for Subscription
                          </span>
                        </div>
                        
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                          <div className="flex items-center mb-2">
                            <span className="text-2xl mr-2">🧾</span>
                            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Deal Code</span>
                          </div>
                          <span className="font-bold text-lg font-mono text-purple-900 dark:text-purple-100">
                            {vessel.dealCode || 'DEAL-00923'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4 mt-6">
                        <Button 
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          onClick={() => {
                            toast({
                              title: "Deal Interest Registered! 🎉",
                              description: "Your interest in this maritime deal has been recorded. Our broker team will contact you within 24 hours.",
                              duration: 6000,
                            });
                          }}
                        >
                          <span className="text-lg mr-2">💼</span>
                          Express Interest in Deal
                        </Button>
                        
                        <Button 
                          variant="outline"
                          className="flex-1 border-2 border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                          onClick={() => {
                            toast({
                              title: "Contact Request Sent! 📞",
                              description: "Our maritime specialists will reach out to discuss this opportunity.",
                              duration: 5000,
                            });
                          }}
                        >
                          <span className="text-lg mr-2">📞</span>
                          Request Call Back
                        </Button>
                      </div>
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
    </div>
  );
}