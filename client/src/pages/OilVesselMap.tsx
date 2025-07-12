import React, { useState, useEffect } from 'react';
import GoogleMap from '@/components/map/GoogleMap';
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

// Google Maps integration for professional mapping

export default function OilVesselMapGoogle() {
  const [mapStyle, setMapStyle] = useState('street');
  const [searchTerm, setSearchTerm] = useState('');
  const [vesselFilter, setVesselFilter] = useState('all');
  const [showPortZones, setShowPortZones] = useState(false);
  const [showTrafficDensity, setShowTrafficDensity] = useState(false);
  const [showDestinationLines, setShowDestinationLines] = useState(false);
  const [selectedVesselLines, setSelectedVesselLines] = useState<Set<number>>(new Set());
  const [portRadius, setPortRadius] = useState(20);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 25.0, lng: 55.0 });
  const { toast } = useToast();

  // Check if user is authenticated by trying to get auth token
  const authToken = localStorage.getItem('authToken');
  const isAuthenticated = !!authToken;

  // Use polling endpoint for vessel data with authentication
  const { data: vesselData, isLoading: vesselsLoading, error: vesselError, refetch } = useQuery({
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

  // Fetch ports data with error handling
  const { data: portsData, isLoading: portsLoading, error: portsError } = useQuery({
    queryKey: ['/api/ports'],
    enabled: true,
    retry: 1
  });
  const ports = Array.isArray(portsData) ? portsData : (portsData?.ports || []);

  // Fetch refineries data with error handling
  const { data: refineriesData, isLoading: refineriesLoading, error: refineriesError } = useQuery({
    queryKey: ['/api/refineries'],
    enabled: true,
    retry: 1
  });
  const refineries = Array.isArray(refineriesData) ? refineriesData : [];

  // Fetch oil types with error handling
  const { data: oilTypesData, isLoading: oilTypesLoading, error: oilTypesError } = useQuery({
    queryKey: ['/api/oil-types'],
    enabled: true,
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
        const newCenter = { lat: parseFloat(lat), lng: parseFloat(lon) };
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

  // Filter vessels based on search and type
  const mappableVessels = React.useMemo(() => {
    return vessels.filter((vessel: any) => {
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = vessel.name?.toLowerCase().includes(searchLower) ||
                            vessel.imo?.toLowerCase().includes(searchLower) ||
                            vessel.mmsi?.toLowerCase().includes(searchLower) ||
                            vessel.flag?.toLowerCase().includes(searchLower) ||
                            vessel.vesselType?.toLowerCase().includes(searchLower) ||
                            vessel.cargoType?.toLowerCase().includes(searchLower) ||
                            vessel.oilType?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }
      
      // Apply vessel type filter
      if (vesselFilter !== 'all') {
        const matchesType = vessel.oilType?.toLowerCase() === vesselFilter ||
                          vessel.cargoType?.toLowerCase() === vesselFilter ||
                          vessel.vesselType?.toLowerCase().includes(vesselFilter);
        
        if (!matchesType) return false;
      }
      
      return true;
    });
  }, [vessels, searchTerm, vesselFilter]);

  // Show authentication prompt for non-authenticated users
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Login Required
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Please log in to view the vessel tracking map and access real-time maritime data.
            </p>
            <Button 
              onClick={() => window.location.href = '/login'}
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-white">
        {/* Header */}
        <div className="bg-white border-b shadow-sm">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Ship className="h-6 w-6 text-blue-600" />
                  Oil Vessel Tracking
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Real-time vessel positions powered by Google Maps
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'}>
                  {connectionStatus === 'connected' ? 'Live' : 'Disconnected'}
                </Badge>
                
                <Button
                  onClick={() => refetch?.()}
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
        </div>

        {/* Controls */}
        <div className="p-4 bg-white border-b shadow-sm">
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

            {/* Map Features */}
            <div className="space-y-2 sm:col-span-2 lg:col-span-2">
              <label className="text-sm font-semibold">Map Features</label>
              <div className="flex flex-wrap gap-2">
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
                  <span className="hidden sm:inline">{showDestinationLines ? 'Hide' : 'Show'} Routes</span>
                  <span className="sm:hidden">Routes</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Google Maps Container */}
        <div className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[75vh] xl:h-[80vh] bg-gray-100">
          {loading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Loading vessel data...</span>
              </div>
            </div>
          )}
          
          <GoogleMap
            center={mapCenter}
            zoom={6}
            vessels={mappableVessels}
            ports={ports}
            refineries={refineries}
            style={{ 
              height: '100%', 
              width: '100%'
            }}
            className="rounded-lg"
            showVessels={true}
            showPorts={showPortZones}
            showRefineries={true}
          />

          {/* Legend */}
          <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-white rounded-lg shadow-lg p-2 sm:p-3 z-[1000] max-w-[140px] sm:max-w-none">
            <div className="text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Legend</div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded-full border border-white shadow shrink-0"></div>
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

        {/* Content Sections Below Map */}
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
                  <div className="text-2xl font-bold">{mappableVessels.filter(v => v.status === 'active').length}</div>
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
                Active Oil Vessels ({mappableVessels.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {mappableVessels.slice(0, 10).map((vessel) => (
                  <div key={vessel.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{vessel.name}</div>
                      <div className="text-sm text-gray-600 truncate">{vessel.vesselType}</div>
                      <div className="text-xs text-gray-500">IMO: {vessel.imo}</div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <Badge variant="outline" className="text-xs">
                        {vessel.flag}
                      </Badge>
                      <div className="text-xs text-blue-600 mt-1">
                        {vessel.status || 'At Sea'}
                      </div>
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
    </TooltipProvider>
  );
}