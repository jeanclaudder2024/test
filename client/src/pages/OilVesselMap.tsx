import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PortalHoverCard } from '@/components/ui/portal-hover-card';
import { Ship, Anchor, RefreshCw, MapIcon, Factory, MapPin, Search, Filter, Layers, ArrowRight, Info } from 'lucide-react';
import { useVesselWebSocket } from '@/hooks/useVesselWebSocket';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Fix leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create exact same vessel icon as vessel detail page
const createVesselIcon = (vesselType: string, vesselName: string) => {
  // Determine vessel type class for styling (same as vessel detail page)
  let vesselTypeClass = 'vessel-type-default';
  const lowerType = vesselType?.toLowerCase() || '';
  
  if (lowerType.includes('crude')) {
    vesselTypeClass = 'vessel-type-crude';
  } else if (lowerType.includes('product')) {
    vesselTypeClass = 'vessel-type-products';
  } else if (lowerType.includes('lng')) {
    vesselTypeClass = 'vessel-type-lng';
  } else if (lowerType.includes('lpg')) {
    vesselTypeClass = 'vessel-type-lpg';
  } else if (lowerType.includes('chemical')) {
    vesselTypeClass = 'vessel-type-chemical';
  }
  
  // Ship-shaped icon that looks like a tanker from above (exact same as vessel detail page)
  const shipShape = `
    <path d="M3,14 L6,7 L18,7 L21,14 L12,18 L3,14 Z" />
  `;
  
  // Create professional vessel icon exactly like vessel detail page
  const iconHtml = `
    <div class="vessel-marker ${vesselTypeClass}">
      <div class="vessel-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          ${shipShape}
        </svg>
      </div>
      <div class="vessel-label">${vesselName}</div>
    </div>
  `;
  
  return L.divIcon({
    className: `custom-vessel-icon`,
    html: iconHtml,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};



const createPortIcon = () => {
  return L.divIcon({
    html: `<div style="
      background: linear-gradient(135deg, #10b981, #059669);
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 8px rgba(16, 185, 129, 0.4), 0 2px 4px rgba(0,0,0,0.2);
      position: relative;
    ">
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 8px;
        font-weight: bold;
      ">⚓</div>
    </div>`,
    className: 'port-marker',
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};

const createRefineryIcon = () => {
  return L.divIcon({
    html: `<div style="
      background: linear-gradient(135deg, #dc2626, #991b1b);
      width: 14px;
      height: 14px;
      border-radius: 20%;
      border: 2px solid white;
      box-shadow: 0 3px 6px rgba(220, 38, 38, 0.5), 0 1px 3px rgba(0,0,0,0.3);
      position: relative;
      transform: rotate(45deg);
    ">
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        color: white;
        font-size: 7px;
        font-weight: bold;
      ">⚡</div>
    </div>`,
    className: 'refinery-marker',
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
};

export default function OilVesselMap() {
  const [mapStyle, setMapStyle] = useState('street');
  const [searchTerm, setSearchTerm] = useState('');
  const [vesselFilter, setVesselFilter] = useState('all');
  const [showTrafficDensity, setShowTrafficDensity] = useState(false);
  const [showPortZones, setShowPortZones] = useState(false);
  const [showDestinationLines, setShowDestinationLines] = useState(false);
  const [selectedVesselLines, setSelectedVesselLines] = useState<Set<number>>(new Set());
  const [portRadius, setPortRadius] = useState(20);
  const [mapCenter, setMapCenter] = useState<[number, number]>([25.0, 55.0]);
  const { toast } = useToast();

  // Check if user is authenticated by trying to get auth token
  const authToken = localStorage.getItem('authToken');
  const isAuthenticated = !!authToken;

  // Use polling endpoint for vessel data with authentication
  const { data: vesselData, isLoading: vesselsLoading, error: vesselError } = useQuery({
    queryKey: ['/api/vessels/polling'],
    enabled: isAuthenticated,
    refetchInterval: 30000,
    retry: 1
  });

  const vessels = React.useMemo(() => {
    if (!vesselData) return [];
    const vesselArray = vesselData.vessels || vesselData || [];
    if (!Array.isArray(vesselArray)) return [];
    
    return vesselArray.filter((v: any) => 
      v && v.id && v.name && v.currentLat && v.currentLng
    );
  }, [vesselData]);

  const loading = vesselsLoading;
  const error = vesselError;
  const connectionStatus = 'connected';

  // Fetch ports data with error handling - use public endpoint
  const { data: portsData, isLoading: portsLoading, error: portsError } = useQuery({
    queryKey: ['/api/ports'],
    enabled: isAuthenticated,
    retry: 1
  });
  const ports = Array.isArray(portsData) ? portsData : (portsData?.ports || []);

  // Fetch refineries data with error handling - use public endpoint (no auth needed)
  const { data: refineriesData, isLoading: refineriesLoading, error: refineriesError } = useQuery({
    queryKey: ['/api/refineries'],
    enabled: true, // Always enabled - using public endpoint
    retry: 1
  });
  const refineries = Array.isArray(refineriesData) ? refineriesData : [];
  
  // Debug refineries data
  React.useEffect(() => {
    if (refineries.length > 0) {
      console.log('Refineries data loaded:', refineries.length, 'refineries');
      console.log('Sample refinery:', refineries[0]);
    } else {
      console.log('No refineries data available');
    }
  }, [refineries]);
  


  // Fetch oil types with error handling - use public endpoint
  const { data: oilTypesData, isLoading: oilTypesLoading, error: oilTypesError } = useQuery({
    queryKey: ['/api/oil-types'],
    enabled: isAuthenticated,
    retry: 1
  });
  const oilTypes = Array.isArray(oilTypesData) ? oilTypesData : [];

  // Location search function
  const searchForLocation = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newCenter: [number, number] = [parseFloat(lat), parseFloat(lon)];
        setMapCenter(newCenter);
        toast({
          title: 'Location Found',
          description: `Found: ${data[0].display_name}`,
        });
      } else {
        toast({
          title: 'Location Not Found',
          description: 'Try searching for a port, city, or landmark',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Search Error',
        description: 'Unable to search for location',
        variant: 'destructive',
      });
    }
  };

  // Filter for oil vessels with dynamic oil types
  const oilVessels = vessels.filter(vessel => {
    const vesselType = vessel.vesselType?.toLowerCase() || '';
    const oilType = vessel.oilType?.toLowerCase() || '';
    const cargoType = vessel.cargoType?.toLowerCase() || '';
    
    // Check if vessel is oil-related
    const isOilVessel = vesselType.includes('tanker') || 
           vesselType.includes('oil') || 
           vesselType.includes('crude') || 
           vesselType.includes('lng') || 
           vesselType.includes('lpg') || 
           vesselType.includes('chemical');
    
    // Apply vessel filter based on oil types from admin panel
    if (vesselFilter !== 'all') {
      // Check if filter matches any oil type from admin panel
      const matchesOilType = Array.isArray(oilTypes) && oilTypes.some((oilTypeObj: any) => {
        const oilTypeName = oilTypeObj.name?.toLowerCase() || '';
        return vesselFilter === oilTypeName && (
          oilType.includes(oilTypeName) ||
          cargoType.includes(oilTypeName) ||
          vesselType.includes(oilTypeName)
        );
      });
      
      // Fallback to old filter logic if no match in oil types
      if (!matchesOilType) {
        if (vesselFilter === 'tanker' && !vesselType.includes('tanker')) return false;
        if (vesselFilter === 'crude' && !vesselType.includes('crude')) return false;
        if (vesselFilter === 'lng' && !vesselType.includes('lng')) return false;
        if (vesselFilter === 'lpg' && !vesselType.includes('lpg')) return false;
      } else if (!matchesOilType) {
        return false;
      }
    }
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = vessel.name?.toLowerCase().includes(searchLower) ||
                           vessel.flag?.toLowerCase().includes(searchLower) ||
                           vessel.imo?.toLowerCase().includes(searchLower) ||
                           vessel.mmsi?.toLowerCase().includes(searchLower) ||
                           oilType.includes(searchLower) ||
                           cargoType.includes(searchLower);
      return isOilVessel && matchesSearch;
    }
    
    return isOilVessel;
  });

  // Filter vessels with valid coordinates
  const mappableVessels = oilVessels.filter(vessel => 
    vessel.currentLat && 
    vessel.currentLng && 
    !isNaN(parseFloat(vessel.currentLat.toString())) && 
    !isNaN(parseFloat(vessel.currentLng.toString()))
  );

  const defaultCenter: [number, number] = [25.0, 55.0]; // Dubai area
  const defaultZoom = 4;

  // Function to get destination name from coordinates
  const getDestinationName = (lat: string, lng: string): string => {
    const destinations = [
      { lat: '25.2048', lng: '55.2708', name: 'Dubai, UAE' },
      { lat: '29.3117', lng: '47.4818', name: 'Kuwait City, Kuwait' },
      { lat: '26.2235', lng: '50.5876', name: 'Manama, Bahrain' },
      { lat: '24.4539', lng: '54.3773', name: 'Abu Dhabi, UAE' },
      { lat: '26.8206', lng: '30.8025', name: 'Suez, Egypt' },
      { lat: '36.8969', lng: '30.7133', name: 'Antalya, Turkey' },
      { lat: '40.9633', lng: '29.0058', name: 'Istanbul, Turkey' },
      { lat: '37.9755', lng: '23.7348', name: 'Piraeus, Greece' }
    ];
    
    const destination = destinations.find(d => 
      Math.abs(parseFloat(d.lat) - parseFloat(lat)) < 0.1 && 
      Math.abs(parseFloat(d.lng) - parseFloat(lng)) < 0.1
    );
    
    return destination ? destination.name : 'Unknown Port';
  };

  // Custom hook to fetch voyage progress data
  const useVoyageProgress = (vesselId: number) => {
    return useQuery({
      queryKey: ['voyage-info', vesselId],
      queryFn: async () => {
        const response = await fetch(`/api/vessels/${vesselId}/voyage-info`);
        if (!response.ok) {
          throw new Error('Failed to fetch voyage info');
        }
        return response.json();
      },
      refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
      enabled: !!vesselId,
    });
  };

  // Real-time Voyage Progress Component
  const VoyageProgressBar: React.FC<{ vesselId: number; vessel: any }> = ({ vesselId, vessel }) => {
    const { data: voyageInfo, isLoading, error } = useVoyageProgress(vesselId);
    
    if (!vessel.destinationLat || !vessel.destinationLng) {
      return null;
    }

    const progressPercentage = voyageInfo?.progressPercentage || 0;
    const currentDay = voyageInfo?.currentDay || 0;
    const totalDays = voyageInfo?.totalDays || 0;
    const direction = voyageInfo?.direction || 'outbound';
    const status = voyageInfo?.status || 'sailing';

    return (
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            {vessel.departurePort || 'Departure Port'}
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            {getDestinationName(vessel.destinationLat, vessel.destinationLng)}
          </span>
        </div>
        
        {/* Animated Progress Container */}
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          {/* Base progress fill with vessel type color */}
          <div 
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out ${
              vessel.vesselType?.toLowerCase().includes('crude') ? 'bg-gradient-to-r from-red-500 to-red-600' :
              vessel.vesselType?.toLowerCase().includes('product') ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
              vessel.vesselType?.toLowerCase().includes('lng') ? 'bg-gradient-to-r from-green-500 to-green-600' :
              vessel.vesselType?.toLowerCase().includes('lpg') ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
              'bg-gradient-to-r from-gray-500 to-gray-600'
            }`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
          
          {/* Animated flowing dots */}
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"
              style={{ 
                width: '30%',
                animation: 'flowingDots 3s linear infinite',
                transform: `translateX(${Math.min(progressPercentage * 2.5, 250)}%)`
              }}
            />
          </div>
          
          {/* Vessel position indicator */}
          {progressPercentage > 5 && (
            <div 
              className="absolute top-0 w-1 h-full bg-white shadow-lg transition-all duration-1000 ease-out"
              style={{ left: `${Math.min(progressPercentage, 95)}%` }}
            >
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-md animate-bounce" />
            </div>
          )}
        </div>
        
        {/* Real-time progress information */}
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">
            {isLoading ? 'Loading...' : error ? 'Static data' : `Day ${currentDay}/${totalDays}`}
          </span>
          <span className="text-gray-500 font-medium">
            {progressPercentage}% Complete
          </span>
          <span className="text-gray-500">
            {direction === 'outbound' ? '→' : '←'} {status}
          </span>
        </div>
        
        {voyageInfo && (
          <div className="text-xs text-blue-600 text-center">
            Real-time simulation active
          </div>
        )}
      </div>
    );
  };

  // Show login message for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Card className="p-8 max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-blue-600 flex items-center justify-center">
              <Ship className="w-8 h-8 mr-2" />
              Vessel Map
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">Please log in to view real-time vessel tracking data.</p>
            <Button onClick={() => window.location.href = '/login'} className="w-full">
              Login to View Vessels
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Ship className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Map</h3>
              <p className="text-gray-600 mb-4">{error?.message || 'Connection error'}</p>
              <Button onClick={() => window.location.reload()} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Mobile-First Responsive Header */}
      <div className="bg-white border-b p-4 lg:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <MapIcon className="h-7 w-7 lg:h-8 lg:w-8 text-primary" />
            <div>
              <h1 className="text-xl lg:text-2xl font-bold">Oil Vessel Map</h1>
              <p className="text-sm text-gray-600">
                <span className="hidden sm:inline">Showing {mappableVessels.length} oil vessels on map</span>
                <span className="sm:hidden">{mappableVessels.length} vessels</span>
              </p>
            </div>
          </div>
          
          {/* Mobile-optimized status badges */}
          <div className="flex flex-wrap items-center gap-2 lg:gap-4">
            <Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'} className="text-xs">
              {connectionStatus === 'connected' ? 'Live Data' : 'Disconnected'}
            </Badge>
            
            <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
              {mappableVessels.length} Vessels
            </Badge>
            
            <Badge variant="outline" className="bg-green-50 text-green-700 text-xs hidden sm:inline-flex">
              {ports.length} Ports
            </Badge>
            
            <Badge variant="outline" className="bg-orange-50 text-orange-700 text-xs hidden sm:inline-flex">
              {refineries.length} Refineries
            </Badge>
            
            <Button
              onClick={() => window.location.reload()}
              disabled={loading}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile-First Map Controls */}
      <div className="p-4 bg-white border-b shadow-sm overflow-y-auto">
        {/* Mobile-First Responsive Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Location Search */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Search Location</label>
            <div className="flex gap-2">
              <Input
                placeholder="Search vessels, ports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchForLocation()}
                className="text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={searchForLocation}
                className="shrink-0"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Vessel Filter with Hover Descriptions */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Vessel Type Filter</label>
            <Select 
              value={vesselFilter === 'all' ? 'all' : vesselFilter} 
              onValueChange={(value) => setVesselFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vessel type">
                  {vesselFilter === 'all' ? 'All Types' : 
                   Array.isArray(oilTypes) && oilTypes.find((type: any) => type.name?.toLowerCase() === vesselFilter)?.name || 
                   vesselFilter.charAt(0).toUpperCase() + vesselFilter.slice(1)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Array.isArray(oilTypes) && oilTypes.map((oilType: any) => (
                  <PortalHoverCard 
                    key={oilType.id}
                    content={
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-blue-700">{oilType.name}</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {oilType.description || `Filter vessels by ${oilType.name} type`}
                        </p>
                        <div className="text-xs text-gray-500 border-t pt-2">
                          Click to filter vessels by this oil type
                        </div>
                      </div>
                    }
                    className="w-80 p-4"
                  >
                    <SelectItem 
                      value={oilType.name?.toLowerCase() || ''}
                      className="cursor-pointer hover:bg-blue-50"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{oilType.name}</span>
                        {oilType.description && (
                          <span className="text-xs text-gray-500 truncate max-w-[200px]">
                            {oilType.description.length > 50 ? 
                              `${oilType.description.substring(0, 50)}...` : 
                              oilType.description
                            }
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  </PortalHoverCard>
                ))}
                {/* Fallback options if oil types aren't loaded */}
                {(!Array.isArray(oilTypes) || oilTypes.length === 0) && (
                  <>
                    <SelectItem value="tanker" title="Vessels designed for transporting liquid petroleum products">Tanker</SelectItem>
                    <SelectItem value="crude" title="Vessels specifically for transporting crude oil">Crude Oil</SelectItem>
                    <SelectItem value="lng" title="Vessels for transporting liquefied natural gas">LNG</SelectItem>
                    <SelectItem value="lpg" title="Vessels for transporting liquefied petroleum gas">LPG</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Map Style */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Map Style</label>
            <Select value={mapStyle} onValueChange={setMapStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="street">Street Map</SelectItem>
                <SelectItem value="satellite">Satellite</SelectItem>
                <SelectItem value="terrain">Terrain</SelectItem>
                <SelectItem value="maritime">Maritime</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Map Features - Mobile Optimized */}
          <div className="space-y-2 sm:col-span-2 lg:col-span-1">
            <label className="text-sm font-semibold">Map Features</label>
            <div className="flex flex-wrap sm:flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPortZones(!showPortZones)}
                className="justify-start flex-1 sm:flex-none"
              >
                <Anchor className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{showPortZones ? 'Hide' : 'Show'} Port Zones</span>
                <span className="sm:hidden">Ports</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowTrafficDensity(!showTrafficDensity)}
                className="justify-start flex-1 sm:flex-none"
              >
                <Layers className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{showTrafficDensity ? 'Hide' : 'Show'} Traffic</span>
                <span className="sm:hidden">Traffic</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDestinationLines(!showDestinationLines)}
                className="justify-start flex-1 sm:flex-none"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{showDestinationLines ? 'Hide' : 'Show'} Destinations</span>
                <span className="sm:hidden">Routes</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-First Map Container - Fixed Height with Touch Support */}
      <div className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[75vh] xl:h-[80vh] bg-gray-100 rounded-lg overflow-hidden shadow-sm">
        {loading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Loading vessel data...</span>
            </div>
          </div>
        )}
        
        <MapContainer
          center={mapCenter}
          zoom={defaultZoom}
          style={{ 
            height: '100%', 
            width: '100%',
            touchAction: 'pan-x pan-y',
            zIndex: 1
          }}
          maxZoom={18}
          minZoom={2}
          key={`${mapCenter[0]}-${mapCenter[1]}`}
          touchZoom={true}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          dragging={true}
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked={mapStyle === 'street'} name="Street Map">
              <TileLayer
                attribution='&copy; <a href="https://carto.com/attributions">CartoDB</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />
            </LayersControl.BaseLayer>
            
            <LayersControl.BaseLayer checked={mapStyle === 'satellite'} name="Satellite">
              <TileLayer
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>
            
            <LayersControl.BaseLayer checked={mapStyle === 'terrain'} name="Terrain">
              <TileLayer
                attribution='&copy; <a href="https://carto.com/attributions">CartoDB</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png"
              />
            </LayersControl.BaseLayer>
            
            <LayersControl.BaseLayer checked={mapStyle === 'maritime'} name="Maritime">
              <TileLayer
                attribution='&copy; <a href="https://carto.com/attributions">CartoDB</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
          </LayersControl>
          
          {/* Refinery Markers - Real Locations from Database */}
          {refineries.map((refinery: any) => {
            // Try different field names for coordinates
            const lat = parseFloat(refinery.latitude?.toString() || refinery.lat?.toString() || '0');
            const lng = parseFloat(refinery.longitude?.toString() || refinery.lng?.toString() || '0');
            
            // Skip refineries with invalid coordinates
            if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
              console.log('Skipping refinery with invalid coordinates:', refinery.name, lat, lng);
              return null;
            }
            
            console.log('Rendering refinery:', refinery.name, 'at', lat, lng);
            
            return (
              <Marker
                key={`refinery-${refinery.id}`}
                position={[lat, lng]}
                icon={createRefineryIcon()}
                zIndexOffset={-500}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="font-semibold text-lg mb-2">{refinery.name}</div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">Refinery</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Country:</span>
                        <span className="font-medium">{refinery.country}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="font-medium">{refinery.capacity || 'N/A'}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Processing:</span>
                        <span className="font-medium">{refinery.processingCapacity || 'N/A'}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Position:</span>
                        <span className="font-mono text-xs">
                          {lat.toFixed(4)}, {lng.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
          
          {/* Port Markers - Middle Layer */}
          {ports.map((port: any) => {
            const lat = parseFloat(port.lat?.toString() || '0');
            const lng = parseFloat(port.lng?.toString() || '0');
            
            if (isNaN(lat) || isNaN(lng)) return null;
            
            return (
              <Marker
                key={`port-${port.id}`}
                position={[lat, lng]}
                icon={createPortIcon()}
                zIndexOffset={0}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="font-semibold text-lg mb-2">{port.name}</div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">Port</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Country:</span>
                        <span className="font-medium">{port.country}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Region:</span>
                        <span className="font-medium">{port.region}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Position:</span>
                        <span className="font-mono text-xs">
                          {lat.toFixed(4)}, {lng.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
          
          {/* Vessel Markers - Top Layer */}
          {mappableVessels.map((vessel) => {
            const lat = parseFloat(vessel.currentLat?.toString() || '0');
            const lng = parseFloat(vessel.currentLng?.toString() || '0');
            
            if (isNaN(lat) || isNaN(lng)) return null;
            
            return (
              <Marker
                key={vessel.id}
                position={[lat, lng]}
                icon={createVesselIcon(vessel.vesselType || '', vessel.name)}
                zIndexOffset={1000}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="font-semibold text-lg mb-2">{vessel.name}</div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <Badge variant="secondary" className="text-xs">
                          {vessel.vesselType || 'Unknown'}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">IMO:</span>
                        <span className="font-mono">{vessel.imo || 'N/A'}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">MMSI:</span>
                        <span className="font-mono">{vessel.mmsi || 'N/A'}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Flag:</span>
                        <span>{vessel.flag || 'Unknown'}</span>
                      </div>
                      
                      {vessel.status && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <Badge variant={vessel.status === 'active' ? 'default' : 'secondary'}>
                            {vessel.status}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Real-time Voyage Progress */}
                    <div className="mt-3 pt-2 border-t">
                      <div className="font-medium text-sm mb-3 text-blue-700">Voyage Progress</div>
                      <VoyageProgressBar vesselId={vessel.id} vessel={vessel} />
                    </div>

                    {/* Voyage Details */}
                    <div className="mt-3 pt-2 border-t">
                      <div className="space-y-1 text-xs">
                        {vessel.eta && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">ETA:</span>
                            <span className="font-medium">{new Date(vessel.eta).toLocaleDateString()}</span>
                          </div>
                        )}
                        
                        {vessel.destinationLat && vessel.destinationLng && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Coordinates:</span>
                            <span className="font-mono text-xs">
                              {parseFloat(vessel.destinationLat).toFixed(4)}, {parseFloat(vessel.destinationLng).toFixed(4)}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current Position:</span>
                          <span className="font-mono text-xs">
                            {lat.toFixed(4)}, {lng.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-2 border-t space-y-2">
                      {/* Show route button for all vessels - will add destination if missing */}
                      <Button 
                        size="sm" 
                        variant={selectedVesselLines.has(vessel.id) ? "default" : "outline"}
                        className="w-full"
                        onClick={() => {
                          const newSelected = new Set(selectedVesselLines);
                          if (selectedVesselLines.has(vessel.id)) {
                            newSelected.delete(vessel.id);
                          } else {
                            newSelected.add(vessel.id);
                          }
                          setSelectedVesselLines(newSelected);
                        }}
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        {selectedVesselLines.has(vessel.id) ? 'Hide Route' : 'Show Route'}
                      </Button>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => window.open(`/vessels/${vessel.id}`, '_blank')}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
          

          {/* Vessel Destination Lines */}
          {(showDestinationLines || selectedVesselLines.size > 0) && vessels.map((vessel: any) => {
            // Show line if global toggle is on OR if this specific vessel is selected
            const shouldShowLine = showDestinationLines || selectedVesselLines.has(vessel.id);
            const vesselLat = parseFloat(vessel.currentLat?.toString() || '0');
            const vesselLng = parseFloat(vessel.currentLng?.toString() || '0');
            const destLat = parseFloat(vessel.destinationLat?.toString() || '0');
            const destLng = parseFloat(vessel.destinationLng?.toString() || '0');
            
            // Only show line if both vessel and destination positions are valid AND should be shown
            if (!shouldShowLine || isNaN(vesselLat) || isNaN(vesselLng) || isNaN(destLat) || isNaN(destLng) || 
                (destLat === 0 && destLng === 0)) {
              return null;
            }
            
            // Different colors for different vessel types
            const getLineColor = (type: string) => {
              switch (type.toLowerCase()) {
                case 'crude oil tanker': return '#ef4444'; // red
                case 'product tanker': return '#3b82f6'; // blue  
                case 'lng tanker': return '#10b981'; // green
                case 'lpg tanker': return '#f59e0b'; // amber
                default: return '#6b7280'; // gray
              }
            };
            
            return (
              <Polyline
                key={`route-${vessel.id}`}
                positions={[[vesselLat, vesselLng], [destLat, destLng]]}
                color={getLineColor(vessel.vesselType)}
                weight={2}
                opacity={0.7}
                dashArray="5, 10"
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="font-semibold text-lg mb-2">Route: {vessel.name}</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">From:</span>
                        <span className="font-medium">{vessel.departurePort || 'Current Position'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">To:</span>
                        <span className="font-medium">{vessel.destinationPort || 'Destination'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{vessel.vesselType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium capitalize">{vessel.status}</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Polyline>
            );
          })}



          {/* Port Zones */}
          {showPortZones && (ports as any[]).map((port: any) => {
            const lat = parseFloat(port.latitude?.toString() || port.lat?.toString() || '0');
            const lng = parseFloat(port.longitude?.toString() || port.lng?.toString() || '0');
            
            if (isNaN(lat) || isNaN(lng)) return null;
            
            return (
              <Circle
                key={`port-zone-${port.id}`}
                center={[lat, lng]}
                radius={portRadius * 1000}
                pathOptions={{
                  color: '#10b981',
                  fillColor: '#10b981',
                  fillOpacity: 0.1,
                  weight: 2,
                  dashArray: '5,5'
                }}
              >
                <Popup>
                  <div className="text-center">
                    <strong>{port.name}</strong><br />
                    Port operational zone: {portRadius} km
                  </div>
                </Popup>
              </Circle>
            );
          })}

          {/* Traffic Density Visualization */}
          {showTrafficDensity && mappableVessels.length > 0 && (() => {
            const clusters = new Map();
            const gridSize = 2; // degrees
            
            mappableVessels.forEach(vessel => {
              const lat = parseFloat(vessel.currentLat?.toString() || '0');
              const lng = parseFloat(vessel.currentLng?.toString() || '0');
              const gridLat = Math.floor(lat / gridSize) * gridSize;
              const gridLng = Math.floor(lng / gridSize) * gridSize;
              const key = `${gridLat}-${gridLng}`;
              
              if (!clusters.has(key)) {
                clusters.set(key, { lat: gridLat + gridSize/2, lng: gridLng + gridSize/2, count: 0 });
              }
              clusters.get(key).count++;
            });
            
            return Array.from(clusters.values())
              .filter(cluster => cluster.count >= 3)
              .map((cluster, index) => (
                <Circle
                  key={`traffic-${index}`}
                  center={[cluster.lat, cluster.lng]}
                  radius={Math.min(cluster.count * 5000, 50000)}
                  pathOptions={{
                    color: cluster.count > 10 ? '#dc2626' : cluster.count > 5 ? '#f59e0b' : '#10b981',
                    fillColor: cluster.count > 10 ? '#dc2626' : cluster.count > 5 ? '#f59e0b' : '#10b981',
                    fillOpacity: 0.2,
                    weight: 2
                  }}
                >
                  <Popup>
                    <div className="text-center">
                      <strong>Traffic Density</strong><br />
                      {cluster.count} vessels in area<br />
                      Density: {cluster.count > 10 ? 'High' : cluster.count > 5 ? 'Medium' : 'Low'}
                    </div>
                  </Popup>
                </Circle>
              ));
          })()}
        </MapContainer>

        {/* Mobile-Optimized Legend */}
        <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-white rounded-lg shadow-lg p-2 sm:p-3 z-[1000] max-w-[140px] sm:max-w-none">
          <div className="text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Legend</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-400 rounded-full border border-white shadow shrink-0"></div>
              <span className="truncate">{mappableVessels.length} Vessels</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 rounded-full border border-white shadow shrink-0"></div>
              <span className="truncate">{(ports as any[]).length} Ports</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-orange-500 rounded-full border border-white shadow shrink-0"></div>
              <span className="truncate">{(refineries as any[]).length} Refineries</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-First Content Sections Below Map */}
      <div className="p-4 space-y-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Ship className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{mappableVessels.length}</div>
                <div className="text-sm text-gray-600">Active Vessels</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Anchor className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{(ports as any[]).length}</div>
                <div className="text-sm text-gray-600">Ports</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Factory className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{(refineries as any[]).length}</div>
                <div className="text-sm text-gray-600">Refineries</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{mappableVessels.filter(v => v.voyageProgress && v.voyageProgress > 0).length}</div>
                <div className="text-sm text-gray-600">Active Voyages</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Active Vessels List - Mobile Optimized */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Active Oil Vessels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {mappableVessels.slice(0, 10).map((vessel) => (
                <div key={vessel.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{vessel.name}</div>
                    <div className="text-sm text-gray-600 truncate">{vessel.vesselType}</div>
                    <div className="text-xs text-gray-500">IMO: {vessel.imo}</div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <Badge variant="outline" className="text-xs">
                      {vessel.flag}
                    </Badge>
                    {vessel.voyageProgress && vessel.voyageProgress > 0 && (
                      <div className="text-xs text-green-600 mt-1">
                        {vessel.voyageProgress}% Complete
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {mappableVessels.length > 10 && (
                <div className="text-center text-sm text-gray-500 py-2">
                  And {mappableVessels.length - 10} more vessels...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vessel Progress Tracking */}
        {mappableVessels.filter(v => v.voyageProgress && v.voyageProgress > 0).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                Active Voyage Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mappableVessels
                  .filter(v => v.voyageProgress && v.voyageProgress > 0)
                  .slice(0, 5)
                  .map((vessel) => (
                    <div key={vessel.id}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium truncate flex-1">{vessel.name}</span>
                        <span className="text-sm text-gray-600 ml-2">{vessel.voyageProgress}%</span>
                      </div>
                      <VoyageProgressBar vesselId={vessel.id} vessel={vessel} />
                    </div>
                  ))
                }
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}