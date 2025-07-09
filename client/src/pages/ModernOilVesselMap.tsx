import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ship, Anchor, RefreshCw, MapIcon, Factory, MapPin, Search, Filter, Layers, ArrowRight } from 'lucide-react';
import { useVesselWebSocket } from '@/hooks/useVesselWebSocket';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// Load Google Maps script with new Web Components API
const loadGoogleMapsScript = () => {
  if (document.querySelector('script[src*="maps.googleapis.com"]')) {
    return Promise.resolve();
  }
  
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  console.log('Google Maps API Key available:', apiKey ? 'Yes' : 'No');
  console.log('API Key (first 10 chars):', apiKey ? apiKey.substring(0, 10) + '...' : 'Not found');
  
  if (!apiKey) {
    return Promise.reject(new Error('Google Maps API key not found. Please check VITE_GOOGLE_MAPS_API_KEY environment variable.'));
  }
  
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=console.debug&libraries=maps,marker&v=beta`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Declare Google Maps Web Components for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gmp-map': any;
      'gmp-advanced-marker': any;
    }
  }
}

// Modern Google Maps Web Component
const ModernGoogleMap: React.FC<{ 
  vessels: any[]; 
  ports: any[]; 
  refineries: any[]; 
  selectedFilters: any; 
  onVesselClick: (vessel: any) => void;
}> = ({ vessels, ports, refineries, selectedFilters, onVesselClick }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    loadGoogleMapsScript().then(() => {
      setMapLoaded(true);
    }).catch(console.error);
  }, []);

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

  if (!mapLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <div>Loading Google Maps...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <gmp-map
        ref={mapRef}
        center="25.276987,55.296249"
        zoom="6"
        map-id="DEMO_MAP_ID"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Vessel Markers */}
        {filteredVessels.map((vessel, index) => {
          const lat = parseFloat(vessel.currentLat);
          const lng = parseFloat(vessel.currentLng);
          
          if (isNaN(lat) || isNaN(lng)) return null;

          const isOilVessel = vessel.vesselType?.toLowerCase().includes('tanker') || 
                             vessel.vesselType?.toLowerCase().includes('oil') || 
                             vessel.vesselType?.toLowerCase().includes('crude');

          return (
            <gmp-advanced-marker
              key={`vessel-${vessel.id}-${index}`}
              position={`${lat},${lng}`}
              title={vessel.name}
            >
              <div 
                style={{
                  background: isOilVessel ? '#ef4444' : '#3b82f6',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '50%',
                  fontSize: '12px',
                  border: '2px solid white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px'
                }}
                onClick={() => onVesselClick(vessel)}
              >
                🚢
              </div>
            </gmp-advanced-marker>
          );
        })}

        {/* Port Markers */}
        {ports.map((port, index) => {
          const lat = parseFloat(port.latitude || port.lat);
          const lng = parseFloat(port.longitude || port.lng);
          
          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <gmp-advanced-marker
              key={`port-${port.id}-${index}`}
              position={`${lat},${lng}`}
              title={port.name}
            >
              <div 
                style={{
                  background: '#10b981',
                  color: 'white',
                  padding: '4px',
                  borderRadius: '50%',
                  fontSize: '10px',
                  border: '2px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px'
                }}
              >
                ⚓
              </div>
            </gmp-advanced-marker>
          );
        })}

        {/* Refinery Markers */}
        {refineries.map((refinery, index) => {
          const lat = parseFloat(refinery.latitude);
          const lng = parseFloat(refinery.longitude);
          
          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <gmp-advanced-marker
              key={`refinery-${refinery.id}-${index}`}
              position={`${lat},${lng}`}
              title={refinery.name}
            >
              <div 
                style={{
                  background: '#f59e0b',
                  color: 'white',
                  padding: '4px',
                  borderRadius: '50%',
                  fontSize: '10px',
                  border: '2px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '22px',
                  height: '22px'
                }}
              >
                🏭
              </div>
            </gmp-advanced-marker>
          );
        })}
      </gmp-map>
    </div>
  );
};

export default function ModernOilVesselMap() {
  const [mapStyle, setMapStyle] = useState('street');
  const [searchTerm, setSearchTerm] = useState('');
  const [vesselFilter, setVesselFilter] = useState('all');
  const [showTrafficDensity, setShowTrafficDensity] = useState(false);
  const [showPortZones, setShowPortZones] = useState(false);
  const [showDestinationLines, setShowDestinationLines] = useState(false);
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

  const mappableVessels = vessels.filter(vessel => 
    vessel.currentLat && vessel.currentLng &&
    !isNaN(parseFloat(vessel.currentLat)) && 
    !isNaN(parseFloat(vessel.currentLng))
  );

  const searchForLocation = () => {
    if (!searchTerm.trim()) return;
    
    toast({
      title: "Location Search",
      description: `Searching for: ${searchTerm}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-First Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Ship className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Modern Oil Vessel Map</h1>
                <p className="text-sm text-muted-foreground">
                  {mappableVessels.length} vessels tracked • {connectionStatus}
                </p>
              </div>
            </div>
            
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

          {/* Vessel Filter */}
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
                {(!Array.isArray(oilTypes) || oilTypes.length === 0) && (
                  <>
                    <SelectItem value="tanker">Tanker</SelectItem>
                    <SelectItem value="crude">Crude Oil</SelectItem>
                    <SelectItem value="lng">LNG</SelectItem>
                    <SelectItem value="lpg">LPG</SelectItem>
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

          {/* Map Features */}
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
            </div>
          </div>
        </div>
      </div>

      {/* Modern Google Maps Container */}
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
          <ModernGoogleMap
            vessels={mappableVessels}
            ports={ports}
            refineries={refineries}
            selectedFilters={{ vesselType: vesselFilter, region: 'all' }}
            onVesselClick={(vessel) => {
              console.log('Vessel clicked:', vessel);
              toast({
                title: "Vessel Selected",
                description: `${vessel.name} - ${vessel.vesselType}`,
              });
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-white flex items-center justify-center">
            <div className="text-center p-8">
              <div className="text-red-600 mb-4 text-lg font-semibold">
                Google Maps API Key Not Found
              </div>
              <div className="text-gray-600 mb-4">
                The VITE_GOOGLE_MAPS_API_KEY environment variable is missing.
              </div>
              <div className="text-sm text-gray-500 space-y-2">
                <div>Current API Key: {import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'undefined'}</div>
                <div>Please check your .env file contains:</div>
                <div className="bg-gray-100 p-2 rounded font-mono text-xs">
                  VITE_GOOGLE_MAPS_API_KEY=AIzaSyAVyB_LKIVJwkcUIPcgKeioPWH71ulpays
                </div>
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

        {/* Active Vessels List */}
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
}