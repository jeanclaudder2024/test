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
import { useSubscription } from '@/hooks/useSubscription';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft, Ship, Calendar, Map, Info, Edit, Plus, Navigation, Anchor,
  Flag, Droplet, Package, AlertCircle, Truck, Gauge, BarChart, History,
  Users, Clock, Compass, ArrowRight, FileText, FileCheck, Clipboard, Download, Globe,
  ZoomIn, ZoomOut, Fuel, Activity, Layers, Filter, Tag, Check, RotateCw,
  MapPin, ExternalLink, Factory, AlertTriangle, RefreshCw, Route, TrendingUp, Phone, Building,
  DollarSign, CreditCard, CheckCircle, Star, Shield, Hash, Lock
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
  const subscriptionData = useSubscription();
  const { hasFeature } = subscriptionData;
  

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
  // Remove test broker override - use real subscription data instead

  // Create broker deal mutation
  const createBrokerDealMutation = useMutation({
    mutationFn: async (dealData: any) => {
      return apiRequest("POST", "/api/broker/deals", dealData);
    },
    onSuccess: () => {
      toast({
        title: "Deal Sent to Broker Management",
        description: "Your deal has been successfully added to the broker management system. You can track it in your broker dashboard.",
        duration: 6000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Sending Deal",
        description: error.message || "Failed to send deal to broker management. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  // Function to send deal to broker management
  const sendDealToBroker = () => {
    if (!vessel) return;

    const dealData = {
      brokerId: undefined, // Will be set by the server
      sellerCompanyId: null, // Optional field
      buyerCompanyId: null, // Optional field
      vesselId: vessel.id,
      dealTitle: `${vessel.name} - ${vessel.cargoType || 'Oil'} Deal`,
      dealDescription: `Maritime deal for vessel ${vessel.name} (${vessel.imo}) carrying ${vessel.cargoType || 'Oil'} from ${vessel.departurePort ? getDeparturePortName(vessel.departurePort) : 'Unknown'} to ${vessel.destinationPort ? getDestinationPortName(vessel.destinationPort) : 'Unknown'}`,
      cargoType: vessel.oilType || vessel.cargoType || 'Crude Oil',
      quantity: vessel.quantity || vessel.cargoCapacity?.toString() || '50000',
      quantityUnit: 'MT',
      pricePerUnit: vessel.price || '75.00',
      totalValue: vessel.dealValue || '50000000',
      currency: 'USD',
      status: 'pending',
      priority: 'medium',
      commissionRate: '0.0150',
      commissionAmount: null,
      originPort: vessel.loadingPort || (vessel.departurePort ? getDeparturePortName(vessel.departurePort) : 'Unknown'),
      destinationPort: vessel.destinationPort ? getDestinationPortName(vessel.destinationPort) : 'Unknown',
      departureDate: vessel.estimatedDeparture ? new Date(vessel.estimatedDeparture) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      arrivalDate: vessel.estimatedArrival ? new Date(vessel.estimatedArrival) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      progressPercentage: 0,
      completionDate: null,
      notes: `Deal request from vessel ${vessel.name} (${vessel.imo}). Route: ${vessel.departurePort ? getDeparturePortName(vessel.departurePort) : 'Unknown'} to ${vessel.destinationPort ? getDestinationPortName(vessel.destinationPort) : 'Unknown'}`
    };

    createBrokerDealMutation.mutate(dealData);
  };
  
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
    
    // If ports are still loading, show loading message
    if (ports.length === 0) {
      return 'Loading port info...';
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
    
    // If ports are still loading, show loading message
    if (ports.length === 0) {
      return 'Loading port info...';
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
    
    // If ports are still loading, show loading message
    if (ports.length === 0) {
      return 'Loading port info...';
    }
    
    // If it's a number but we can't find the port, show it as is
    return typeof portIdOrName === 'string' ? portIdOrName : `Port ID: ${portIdOrName}`;
  };
  
  // Fetch refineries data for map connections
  useEffect(() => {
    const fetchRefineries = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const response = await axios.get('/api/refineries', {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
        });
        if (response.status === 200) {
          setRefineries(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch refineries for map:', error);
        // Try fallback without auth
        try {
          const response = await axios.get('/api/refineries');
          if (response.status === 200) {
            setRefineries(response.data);
          }
        } catch (fallbackError) {
          console.error('Fallback refineries fetch also failed:', fallbackError);
        }
      }
    };
    
    fetchRefineries();
  }, []);
  
  // Fetch ports data for map connections
  useEffect(() => {
    const fetchPorts = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const response = await axios.get('/api/ports', {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
        });
        if (response.status === 200) {
          // Handle both response formats: { ports: [...] } or direct array
          const portsData = response.data.ports || response.data;
          setPorts(Array.isArray(portsData) ? portsData : []);
        }
      } catch (error) {
        console.error('Failed to fetch ports for map:', error);
        // Try fallback without auth
        try {
          const response = await axios.get('/api/ports');
          if (response.status === 200) {
            // Handle both response formats: { ports: [...] } or direct array
            const portsData = response.data.ports || response.data;
            setPorts(Array.isArray(portsData) ? portsData : []);
          }
        } catch (fallbackError) {
          console.error('Fallback ports fetch also failed:', fallbackError);
        }
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto p-4">
        <Link href="/vessels">
          <Button variant="ghost" className="mb-6">
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
          {/* Professional Header */}
          <Card className="mb-8">
            <CardHeader className="pb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="mb-4 md:mb-0">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-2">
                    <h1 className="text-3xl font-semibold">
                      {vessel.name}
                    </h1>
                    <div className="flex space-x-2">
                      <Badge variant="secondary">
                        {getOilCategory(vessel.cargoType)}
                      </Badge>
                      <Badge className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                  </div>
                  <div className="text-muted-foreground space-y-1">
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
                

              </div>
            </CardHeader>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              {/* Enhanced Main content area */}
              <Tabs defaultValue="details" className="mb-8">
                <TabsList className="mb-6">
                  <TabsTrigger value="details" className="flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Vessel Details
                  </TabsTrigger>
                  <TabsTrigger value="voyage" className="flex items-center">
                    <Compass className="h-4 w-4 mr-2" />
                    Destination
                  </TabsTrigger>
                  <TabsTrigger value="articles" className="flex items-center">
                    <FileCheck className="h-4 w-4 mr-2" />
                    Documents
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="details">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Ship className="h-5 w-5 mr-2" />
                        Vessel Specifications
                      </CardTitle>
                      <CardDescription>
                        Technical details and specifications - التفاصيل والمواصفات التقنية
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Info className="h-4 w-4 mr-2 text-blue-600" />
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
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Droplet className="h-4 w-4 mr-2 text-green-600" />
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
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Users className="h-4 w-4 mr-2 text-purple-600" />
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
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Gauge className="h-4 w-4 mr-2 text-orange-600" />
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
                  
                  <Card className="mt-8">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Navigation className="h-5 w-5 mr-2" />
                        Live Tracking
                      </CardTitle>
                      <CardDescription>
                        Real-time position with connected ports and route lines
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {vessel.currentLat && vessel.currentLng ? (
                        <SimpleVesselMap vessel={vessel} ports={ports} />
                      ) : (
                        <div className="h-96 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                          <div className="text-center text-muted-foreground">
                            <MapPin className="h-12 w-12 mx-auto mb-3" />
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
                        Current Destination
                      </CardTitle>
                      <CardDescription>
                        Real-time destination tracking with simulation data
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Real-time voyage simulation display */}
                      {voyageInfo && (
                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <Ship className="h-5 w-5 mr-2 text-blue-600" />
                              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Live Destination Simulation</h3>
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
                              <p className="text-xs text-gray-600 dark:text-gray-400">Destination Progress</p>
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
                          <p className="text-sm text-gray-600 dark:text-gray-400">Loading destination simulation data...</p>
                        </div>
                      )}
                      

                      
                      <SimpleVoyageDetails 
                        vessel={vessel} 
                        destinationProgress={{ 
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
                    Destination Info
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
                                : getDestinationPortName(vessel.destinationPort)}
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
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="h-5 w-5 mr-2" />
                    Cargo & Deal Information
                  </CardTitle>
                  <CardDescription>
                    Complete cargo details and deal specifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Primary Cargo Information */}
                    <div>
                      <h4 className="font-semibold text-lg mb-4 flex items-center">
                        <Package className="h-5 w-5 mr-2 text-blue-600" />
                        Primary Cargo Details
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Droplet className="h-5 w-5 mr-3 text-blue-600" />
                          <div className="flex-1">
                            <div className="text-sm text-muted-foreground">Oil Type / Commodity</div>
                            <div className="font-medium">
                              {vessel.oilType || vessel.cargoType || 'ULSD EN 590 – 10ppm / Gasoline'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <MapPin className="h-5 w-5 mr-3 text-green-600" />
                          <div className="flex-1">
                            <div className="text-sm text-muted-foreground">Origin</div>
                            <div className="font-medium">
                              {vessel.origin || getDeparturePortName(vessel.departurePort) || 'Kharg Island'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Navigation className="h-5 w-5 mr-3 text-orange-600" />
                          <div className="flex-1">
                            <div className="text-sm text-muted-foreground">Destination</div>
                            <div className="font-medium">
                              {vessel.destination || getDestinationPortName(vessel.destinationPort) || 'Rotterdam – Houston – Jurong'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <BarChart className="h-5 w-5 mr-3 text-purple-600" />
                          <div className="flex-1">
                            <div className="text-sm text-muted-foreground">Quantity</div>
                            <div className="font-medium">
                              {vessel.quantity && !isNaN(parseFloat(vessel.quantity))
                                ? `${parseFloat(vessel.quantity).toLocaleString()} barrels`
                                : vessel.cargoCapacity 
                                ? `${vessel.cargoCapacity.toLocaleString()} barrels` 
                                : '1,291,833 barrels / 50,000-500,000 MTs'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Deal & Financial Information */}
                    <div>
                      <h4 className="font-semibold text-lg mb-4 flex items-center">
                        <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                        Deal & Financial Details
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <DollarSign className="h-5 w-5 mr-3 text-green-600" />
                          <div className="flex-1">
                            <div className="text-sm text-muted-foreground">Deal Value</div>
                            <div className="font-medium text-lg">
                              {vessel.dealValue && !isNaN(parseFloat(vessel.dealValue))
                                ? `$${parseFloat(vessel.dealValue).toLocaleString()} USD`
                                : '$93,806,381 USD'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <TrendingUp className="h-5 w-5 mr-3 text-blue-600" />
                          <div className="flex-1">
                            <div className="text-sm text-muted-foreground">Price per Barrel</div>
                            <div className="font-medium text-lg">
                              {vessel.price && !isNaN(parseFloat(vessel.price))
                                ? `$${parseFloat(vessel.price).toFixed(2)}`
                                : '$72.61'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <BarChart className="h-5 w-5 mr-3 text-orange-600" />
                          <div className="flex-1">
                            <div className="text-sm text-muted-foreground">Market Price</div>
                            <div className="font-medium text-lg">
                              {vessel.marketPrice && !isNaN(parseFloat(vessel.marketPrice))
                                ? `$${parseFloat(vessel.marketPrice).toFixed(2)}`
                                : '$72.37'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <CreditCard className="h-5 w-5 mr-3 text-purple-600" />
                          <div className="flex-1">
                            <div className="text-sm text-muted-foreground">Payment Terms</div>
                            <div className="font-medium text-base">
                              {vessel.paymentTerms || 'MT103/TT After Delivery'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contract & Operational Details */}
                    <div>
                      <h4 className="font-semibold text-lg mb-4 flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-orange-600" />
                        Contract & Operations
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <FileText className="h-5 w-5 mr-3 text-orange-600" />
                          <div className="flex-1">
                            <div className="text-sm text-muted-foreground">Contract Type</div>
                            <div className="font-medium">
                              {vessel.contractType || 'Spot Trial + 12 Months Optional Contract'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Truck className="h-5 w-5 mr-3 text-green-600" />
                          <div className="flex-1">
                            <div className="text-sm text-muted-foreground">Delivery Terms</div>
                            <div className="font-medium">
                              {vessel.deliveryTerms || 'FOB – CIF'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Anchor className="h-5 w-5 mr-3 text-blue-600" />
                          <div className="flex-1">
                            <div className="text-sm text-muted-foreground">Loading Port</div>
                            <div className="font-medium">
                              {vessel.loadingPort || getDeparturePortName(vessel.departurePort) || 'Kharg Island'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <CheckCircle className="h-5 w-5 mr-3 text-purple-600" />
                          <div className="flex-1">
                            <div className="text-sm text-muted-foreground">Quality Specification</div>
                            <div className="font-medium">
                              {vessel.qualitySpec || 'ULSD 10ppm / Standard Gasoline Spec'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Company & Source Information */}
                    <div>
                      <h4 className="font-semibold text-lg mb-4 flex items-center">
                        <Building className="h-5 w-5 mr-2 text-purple-600" />
                        Company & Source Details
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Building className="h-5 w-5 mr-3 text-blue-600" />
                          <div className="flex-1">
                            <div className="text-sm text-muted-foreground">Source Company</div>
                            <div className="font-medium">
                              {vessel.sourceCompany || vessel.oilSource || vessel.sellerName || 'BP / Source Refinery'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Factory className="h-5 w-5 mr-3 text-green-600" />
                          <div className="flex-1">
                            <div className="text-sm text-muted-foreground">Target Refinery</div>
                            <div className="font-medium">
                              {vessel.targetRefinery || 
                               (vessel.destinationPort && vessel.destinationPort.startsWith('REF:') 
                                 ? vessel.destinationPort.split(':')[2] 
                                 : 'Esmeraldas Refinery')}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Star className="h-5 w-5 mr-3 text-yellow-600" />
                          <div className="flex-1">
                            <div className="text-sm text-muted-foreground">Customer Experience</div>
                            <div className="font-medium">
                              4.7/5 – Based on 13 corporate buyers
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Deal Status & Verification */}
                    <div>
                      <h4 className="font-semibold text-lg mb-4 flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                        Deal Status & Verification
                      </h4>
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Calendar className="h-5 w-5 mr-3 text-blue-600" />
                          <div className="flex-1">
                            <div className="text-sm text-muted-foreground">Deal Date</div>
                            <div className="font-medium">
                              {vessel.dealDate || 'July 2025 / Active'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Shield className="h-5 w-5 mr-3 text-green-600" />
                          <div className="flex-1">
                            <div className="text-sm text-muted-foreground">Verified Deal</div>
                            <div className="font-medium text-green-600">
                              Platform Verified
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Activity className="h-5 w-5 mr-3 text-blue-600" />
                          <div className="flex-1">
                            <div className="text-sm text-muted-foreground">Deal Status</div>
                            <div className="font-medium text-blue-600">
                              Open for Subscription
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Hash className="h-5 w-5 mr-3 text-purple-600" />
                          <div className="flex-1">
                            <div className="text-sm text-muted-foreground">Deal Code</div>
                            <div className="font-medium font-mono">
                              {vessel.dealCode || 'DEAL-00923'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-6">
                        {hasFeature('broker') ? (
                          <Button 
                            className="w-full py-4 px-6 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-700 animate-pulse"
                            style={{
                              animationDuration: '3s'
                            }}
                            onClick={sendDealToBroker}
                            disabled={createBrokerDealMutation.isPending}
                          >
                            {createBrokerDealMutation.isPending ? (
                              <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-background"></div>
                                Sending Deal...
                              </>
                            ) : (
                              <>
                                <TrendingUp className="mr-2 h-4 w-4" />
                                Express Interest in Deal
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button 
                            className="w-full py-4 px-6 font-semibold shadow-lg relative opacity-60 cursor-not-allowed"
                            disabled
                            onClick={() => {
                              toast({
                                title: "Broker Access Required",
                                description: "You need a Professional or Enterprise subscription to access deal features. Please upgrade your plan.",
                                variant: "destructive",
                                duration: 5000,
                              });
                            }}
                          >
                            <Lock className="mr-2 h-4 w-4" />
                            Broker Access Required
                          </Button>
                        )}
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