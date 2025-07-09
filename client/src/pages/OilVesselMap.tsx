import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ship, Anchor, RefreshCw, MapIcon, Factory, MapPin, Search, Filter, Layers, ArrowRight } from 'lucide-react';
import { useVesselWebSocket } from '@/hooks/useVesselWebSocket';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// Load Google Maps script
const loadGoogleMapsScript = () => {
  if (document.querySelector('script[src*="maps.googleapis.com"]')) {
    return Promise.resolve();
  }
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&callback=console.debug&libraries=maps,marker&v=beta`;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Modern Google Maps Web Component
interface GoogleMapProps {
  vessels: any[];
  ports: any[];
  refineries: any[];
  selectedFilters: any;
  onVesselClick: (vessel: any) => void;
}

const GoogleMapComponent: React.FC<GoogleMapProps> = ({ 
  vessels, 
  ports, 
  refineries, 
  selectedFilters, 
  onVesselClick 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const initializeMap = useCallback(() => {
    if (!mapRef.current) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      center: { lat: 25.276987, lng: 55.296249 }, // Dubai center
      zoom: 6,
      mapTypeId: google.maps.MapTypeId.SATELLITE,
      styles: [
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#1e3a8a' }]
        },
        {
          featureType: 'landscape',
          elementType: 'geometry',
          stylers: [{ color: '#1f2937' }]
        }
      ]
    });
  }, []);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  }, []);

  const addVesselMarkers = useCallback(() => {
    if (!mapInstance.current) return;

    const filteredVessels = vessels.filter(vessel => {
      if (selectedFilters.vesselType && selectedFilters.vesselType !== 'all') {
        const vesselMatches = 
          vessel.oilType?.toLowerCase().includes(selectedFilters.vesselType.toLowerCase()) ||
          vessel.cargoType?.toLowerCase().includes(selectedFilters.vesselType.toLowerCase()) ||
          vessel.vesselType?.toLowerCase().includes(selectedFilters.vesselType.toLowerCase());
        if (!vesselMatches) return false;
      }
      if (selectedFilters.region && selectedFilters.region !== 'all') {
        if (vessel.currentRegion !== selectedFilters.region) return false;
      }
      return vessel.currentLat && vessel.currentLng;
    });

    filteredVessels.forEach(vessel => {
      const lat = parseFloat(vessel.currentLat);
      const lng = parseFloat(vessel.currentLng);
      
      if (isNaN(lat) || isNaN(lng)) return;

      const isOilVessel = vessel.vesselType?.toLowerCase().includes('tanker') || 
                         vessel.vesselType?.toLowerCase().includes('oil') || 
                         vessel.vesselType?.toLowerCase().includes('crude');

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: mapInstance.current,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="${isOilVessel ? '#ef4444' : '#3b82f6'}" stroke="white" stroke-width="2"/>
              <text x="12" y="16" text-anchor="middle" fill="white" font-size="12">🚢</text>
            </svg>
          `)}`,
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(12, 12)
        },
        title: vessel.name
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937;">${vessel.name}</h3>
            <p style="margin: 4px 0; color: #6b7280;"><strong>Type:</strong> ${vessel.vesselType || 'Oil Tanker'}</p>
            <p style="margin: 4px 0; color: #6b7280;"><strong>Cargo:</strong> ${vessel.cargoType || 'N/A'}</p>
            <p style="margin: 4px 0; color: #6b7280;"><strong>Region:</strong> ${vessel.currentRegion || 'International Waters'}</p>
            <p style="margin: 4px 0; color: #6b7280;"><strong>Speed:</strong> ${vessel.speed || 'N/A'} knots</p>
            <button onclick="window.viewVesselDetails('${vessel.id}')" style="
              background: #3b82f6; 
              color: white; 
              border: none; 
              padding: 6px 12px; 
              border-radius: 4px; 
              cursor: pointer;
              margin-top: 8px;
            ">View Details</button>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstance.current, marker);
      });

      markersRef.current.push(marker);
    });
  }, [vessels, selectedFilters]);

  const addPortMarkers = useCallback(() => {
    if (!mapInstance.current) return;

    ports.forEach(port => {
      const lat = parseFloat(port.latitude);
      const lng = parseFloat(port.longitude);
      
      if (isNaN(lat) || isNaN(lng)) return;

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: mapInstance.current,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="9" fill="#10b981" stroke="white" stroke-width="2"/>
              <text x="11" y="15" text-anchor="middle" fill="white" font-size="10">⚓</text>
            </svg>
          `)}`,
          scaledSize: new google.maps.Size(22, 22),
          anchor: new google.maps.Point(11, 11)
        },
        title: port.name
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937;">${port.name}</h3>
            <p style="margin: 4px 0; color: #6b7280;"><strong>Country:</strong> ${port.country || 'N/A'}</p>
            <p style="margin: 4px 0; color: #6b7280;"><strong>Type:</strong> Oil Terminal</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstance.current, marker);
      });

      markersRef.current.push(marker);
    });
  }, [ports]);

  const addRefineryMarkers = useCallback(() => {
    if (!mapInstance.current) return;

    refineries.forEach(refinery => {
      const lat = parseFloat(refinery.latitude);
      const lng = parseFloat(refinery.longitude);
      
      if (isNaN(lat) || isNaN(lng)) return;

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: mapInstance.current,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="9" fill="#f59e0b" stroke="white" stroke-width="2"/>
              <text x="11" y="15" text-anchor="middle" fill="white" font-size="10">🏭</text>
            </svg>
          `)}`,
          scaledSize: new google.maps.Size(22, 22),
          anchor: new google.maps.Point(11, 11)
        },
        title: refinery.name
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937;">${refinery.name}</h3>
            <p style="margin: 4px 0; color: #6b7280;"><strong>Country:</strong> ${refinery.country || 'N/A'}</p>
            <p style="margin: 4px 0; color: #6b7280;"><strong>Type:</strong> Oil Refinery</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstance.current, marker);
      });

      markersRef.current.push(marker);
    });
  }, [refineries]);

  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  useEffect(() => {
    clearMarkers();
    addVesselMarkers();
    addPortMarkers();
    addRefineryMarkers();
  }, [vessels, ports, refineries, selectedFilters, clearMarkers, addVesselMarkers, addPortMarkers, addRefineryMarkers]);

  // Global function for vessel details
  useEffect(() => {
    (window as any).viewVesselDetails = (vesselId: string) => {
      const vessel = vessels.find(v => v.id.toString() === vesselId);
      if (vessel) {
        onVesselClick(vessel);
      }
    };
  }, [vessels, onVesselClick]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
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

  const { vessels, loading, error, connectionStatus, refetch } = useVesselWebSocket({
    region: 'global',
    loadAllVessels: true,
    refreshInterval: 30000
  });

  // Fetch ports data
  const { data: ports = [] } = useQuery({
    queryKey: ['/api/ports'],
    enabled: true
  });

  // Fetch refineries data
  const { data: refineries = [] } = useQuery({
    queryKey: ['/api/refineries'],
    enabled: true
  });

  // Fetch oil types
  const { data: oilTypes = [] } = useQuery({
    queryKey: ['/api/oil-types'],
    enabled: true
  });

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

  if (error) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Ship className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Map</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={refetch} className="flex items-center gap-2">
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
              onClick={refetch}
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
                  <SelectItem 
                    key={oilType.id}
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
        
        {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
          <Wrapper apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <GoogleMapComponent
              vessels={mappableVessels}
              ports={ports}
              refineries={refineries}
              selectedFilters={{ vesselType: vesselFilter, region: 'all' }}
              onVesselClick={(vessel) => {
                console.log('Vessel clicked:', vessel);
              }}
            />
          </Wrapper>
        ) : (
          <div className="absolute inset-0 bg-white flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-600 mb-2">
                Google Maps API key not found
              </div>
              <div className="text-sm text-gray-600">
                Please check your environment configuration
              </div>
            </div>
          </div>
        )}
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
      </div>
    </div>
  );
};
