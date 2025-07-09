import React, { useState, useEffect, useRef } from 'react';
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

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function OilVesselMap() {
  const [mapStyle, setMapStyle] = useState('street');
  const [searchTerm, setSearchTerm] = useState('');
  const [vesselFilter, setVesselFilter] = useState('all');
  const [showTrafficDensity, setShowTrafficDensity] = useState(false);
  const [showPortZones, setShowPortZones] = useState(true);
  const [showDestinationLines, setShowDestinationLines] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('connected');
  const [mapCenter, setMapCenter] = useState<[number, number]>([25.0, 55.0]);
  const [mapZoom] = useState(4);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const { toast } = useToast();

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAVyB_LKIVJwkcUIPcgKeioPWH71ulpays&libraries=marker&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      window.initMap = initializeMap;
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: mapCenter[0], lng: mapCenter[1] },
      zoom: mapZoom,
      mapId: 'maritime-tracking-map',
      mapTypeId: getGoogleMapType(),
      styles: mapStyle === 'dark' ? getDarkMapStyles() : undefined,
    });
  };

  const getGoogleMapType = () => {
    switch (mapStyle) {
      case 'satellite': return 'satellite';
      case 'terrain': return 'terrain';
      case 'street':
      default: return 'roadmap';
    }
  };

  const getDarkMapStyles = () => [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }]
    }
  ];

  // Fetch data using React Query
  const { data: vessels = [], isLoading: vesselsLoading, error: vesselsError, refetch: refetchVessels } = useQuery({
    queryKey: ['vessels'],
    queryFn: async () => {
      console.log('Fetching authentic vessels from your Supabase database...');
      const response = await fetch('/api/vessels');
      console.log('Database API response status:', response.status);
      if (!response.ok) throw new Error('Failed to fetch vessels');
      const data = await response.json();
      console.log('Database returned', data.length, 'authentic vessels');
      console.log('Sample authentic vessel:', data[0]);
      return data;
    },
    staleTime: 0,
    refetchInterval: 30000,
  });

  const { data: ports = [], isLoading: portsLoading } = useQuery({
    queryKey: ['ports'],
    queryFn: async () => {
      const response = await fetch('/api/ports');
      if (!response.ok) throw new Error('Failed to fetch ports');
      return response.json();
    },
    staleTime: 0,
  });

  const { data: refineries = [], isLoading: refineriesLoading } = useQuery({
    queryKey: ['refineries'],
    queryFn: async () => {
      const response = await fetch('/api/refineries');
      if (!response.ok) throw new Error('Failed to fetch refineries');
      return response.json();
    },
    staleTime: 0,
  });

  const { data: oilTypes = [], isLoading: oilTypesLoading } = useQuery({
    queryKey: ['admin-oil-types'],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/oil-types', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch oil types');
      const data = await response.json();
      console.log('Fetched oil types:', data);
      return data;
    },
    staleTime: 0,
  });

  const loading = vesselsLoading || portsLoading || refineriesLoading || oilTypesLoading;
  const error = vesselsError;

  const refetch = () => {
    refetchVessels();
    toast({
      title: 'Refreshing Data',
      description: 'Loading latest vessel positions...',
    });
  };

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
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter({ lat: parseFloat(lat), lng: parseFloat(lon) });
          mapInstanceRef.current.setZoom(10);
        }
        
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

  console.log(`${mappableVessels.length} vessels have valid coordinates`);

  // Create markers when map and data are ready
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google?.maps?.marker?.AdvancedMarkerElement) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      if (marker.map) {
        marker.map = null;
      }
    });
    markersRef.current = [];

    // Create vessel markers
    mappableVessels.forEach(vessel => {
      const lat = parseFloat(vessel.currentLat?.toString() || '0');
      const lng = parseFloat(vessel.currentLng?.toString() || '0');
      
      if (isNaN(lat) || isNaN(lng)) return;

      // Create marker element
      const markerElement = document.createElement('div');
      markerElement.style.cssText = `
        width: 20px; 
        height: 20px; 
        background: ${getVesselColor(vessel.vesselType)}; 
        border: 2px solid white; 
        border-radius: 50%; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
        animation: pulse 2s infinite;
      `;

      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        position: { lat, lng },
        map: mapInstanceRef.current,
        content: markerElement,
        title: vessel.name,
      });

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: createVesselInfoContent(vessel),
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
    });

    // Create port markers
    if (showPortZones) {
      ports.forEach(port => {
        const lat = typeof port.lat === 'string' ? parseFloat(port.lat) : port.lat;
        const lng = typeof port.lng === 'string' ? parseFloat(port.lng) : port.lng;
        
        if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;

        const portElement = document.createElement('div');
        portElement.style.cssText = `
          width: 16px; 
          height: 16px; 
          background: #f59e0b; 
          border: 2px solid white; 
          border-radius: 3px; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          cursor: pointer;
        `;

        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          position: { lat, lng },
          map: mapInstanceRef.current,
          content: portElement,
          title: port.name,
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h4 style="margin: 0 0 4px 0; color: #f59e0b; font-weight: bold;">${port.name}</h4>
              <p style="margin: 0; font-size: 12px; color: #666;">${port.country}</p>
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, marker);
        });

        markersRef.current.push(marker);
      });
    }

    // Create refinery markers
    refineries.forEach(refinery => {
      const lat = typeof refinery.lat === 'string' ? parseFloat(refinery.lat) : refinery.lat;
      const lng = typeof refinery.lng === 'string' ? parseFloat(refinery.lng) : refinery.lng;
      
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;

      const refineryElement = document.createElement('div');
      refineryElement.style.cssText = `
        width: 18px; 
        height: 18px; 
        background: #9333ea; 
        border: 2px solid white; 
        border-radius: 3px; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
      `;

      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        position: { lat, lng },
        map: mapInstanceRef.current,
        content: refineryElement,
        title: refinery.name,
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h4 style="margin: 0 0 4px 0; color: #9333ea; font-weight: bold;">${refinery.name}</h4>
            <p style="margin: 0; font-size: 12px; color: #666;">${refinery.location}</p>
            ${refinery.processingCapacity ? `<p style="margin: 4px 0 0 0; font-size: 10px; color: #999;">Capacity: ${refinery.processingCapacity} bpd</p>` : ''}
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
    });

  }, [mappableVessels, ports, refineries, showPortZones]);

  // Update map type when style changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(getGoogleMapType());
      if (mapStyle === 'dark') {
        mapInstanceRef.current.setOptions({ styles: getDarkMapStyles() });
      } else {
        mapInstanceRef.current.setOptions({ styles: [] });
      }
    }
  }, [mapStyle]);

  const getVesselColor = (vesselType: string = '') => {
    const type = vesselType.toLowerCase();
    if (type.includes('crude')) return '#ef4444';
    if (type.includes('product') || type.includes('chemical')) return '#3b82f6';
    if (type.includes('lng')) return '#10b981';
    if (type.includes('lpg')) return '#f59e0b';
    return '#6b7280';
  };

  const createVesselInfoContent = (vessel: any) => {
    return `
      <div style="padding: 0; max-width: 350px; font-family: system-ui;">
        <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 12px; margin: -8px -8px 8px -8px;">
          <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: bold;">${vessel.name}</h3>
          <div style="display: flex; justify-content: space-between; font-size: 12px;">
            <span style="background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 4px;">${vessel.vesselType}</span>
            <span style="background: ${vessel.status?.toLowerCase() === 'underway' ? '#10b981' : '#6b7280'}; padding: 2px 8px; border-radius: 4px;">
              ${vessel.status}
            </span>
          </div>
        </div>
        
        <div style="padding: 0 8px 8px 8px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; font-size: 12px;">
            <div><span style="color: #666;">IMO:</span><br><strong>${vessel.imo}</strong></div>
            <div><span style="color: #666;">Flag:</span><br><strong>${vessel.flag}</strong></div>
            <div><span style="color: #666;">Speed:</span><br><strong>${vessel.speed} knots</strong></div>
            <div><span style="color: #666;">Built:</span><br><strong>${vessel.built}</strong></div>
          </div>
          
          ${vessel.cargoType ? `
            <div style="border-top: 1px solid #eee; padding-top: 8px; margin-bottom: 8px; font-size: 12px;">
              <div><span style="color: #666;">Cargo:</span><br><strong>${vessel.cargoType}</strong></div>
              ${vessel.quantity ? `<div style="margin-top: 4px;"><span style="color: #666;">Quantity:</span><br><strong>${parseFloat(vessel.quantity).toLocaleString()} barrels</strong></div>` : ''}
            </div>
          ` : ''}
          
          <button 
            onclick="window.open('/vessels/${vessel.id}', '_blank')"
            style="width: 100%; background: #3b82f6; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-size: 12px;"
          >
            View Details
          </button>
        </div>
      </div>
    `;
  };

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
          <span className="text-blue-600 font-medium">
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
                <SelectItem value="dark">Dark Mode</SelectItem>
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

      {/* Google Maps Container */}
      <div className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[75vh] xl:h-[80vh] bg-gray-100 rounded-lg overflow-hidden shadow-sm">
        {loading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Loading vessel data...</span>
            </div>
          </div>
        )}
        
        <div 
          id="map" 
          ref={mapRef}
          style={{ 
            height: '100%', 
            width: '100%'
          }}
        />
      </div>
    </div>
  );
}