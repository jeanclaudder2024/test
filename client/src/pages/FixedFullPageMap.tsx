import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayerGroup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ship, Anchor, Factory, MapIcon, RefreshCw, Eye, EyeOff, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Define basic interface for map items
interface MapItem {
  id: number;
  name: string;
  lat: string | number;
  lng: string | number;
}

// Basic vessel interface with only essential properties
interface Vessel extends MapItem {
  vesselType: string;
  imo: string;
  mmsi: string;
  flag: string;
  cargoType?: string;
  status?: string;
  cargoCapacity?: number;
}

// Port interface with essential properties
interface Port extends MapItem {
  country: string;
  region: string;
  type: string;
  status?: string;
}

// Refinery interface with essential properties
interface Refinery extends MapItem {
  country: string;
  region: string;
  operator?: string;
  capacity?: number;
  status?: string;
}

// Helper component to update the map center (used after loading new data)
function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function FixedFullPageMap() {
  // State for map data
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [refineries, setRefineries] = useState<Refinery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Filter states
  const [showVessels, setShowVessels] = useState<boolean>(true);
  const [showPorts, setShowPorts] = useState<boolean>(true);
  const [showRefineries, setShowRefineries] = useState<boolean>(true);
  const [filtersPanelOpen, setFiltersPanelOpen] = useState<boolean>(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('global');
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0]);
  
  const { toast } = useToast();
  
  // Load data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch vessels
        const vesselsResponse = await fetch('/api/vessels/polling');
        const vesselsData = await vesselsResponse.json();
        
        // Process vessels data
        const processedVessels = (vesselsData.vessels || [])
          .filter((v: any) => {
            return v && v.id && v.name && v.currentLat && v.currentLng;
          })
          .map((v: any) => ({
            id: v.id,
            name: v.name,
            lat: v.currentLat,
            lng: v.currentLng,
            vesselType: v.vesselType || 'Unknown',
            imo: v.imo || 'N/A',
            mmsi: v.mmsi || 'N/A',
            flag: v.flag || 'Unknown',
            cargoType: v.cargoType || 'Unknown',
            status: v.status || 'At Sea',
            cargoCapacity: v.cargoCapacity
          }));
        
        setVessels(processedVessels);
        
        // Fetch ports
        const portsResponse = await fetch('/api/ports');
        const portsData = await portsResponse.json();
        
        // Process ports data
        const processedPorts = (portsData || [])
          .filter((p: any) => p && p.id && p.name && p.lat && p.lng)
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            lat: p.lat,
            lng: p.lng,
            country: p.country || 'Unknown',
            region: p.region || 'Unknown',
            type: p.type || 'Commercial',
            status: p.status || 'Active'
          }));
        
        setPorts(processedPorts);
        
        // Fetch refineries
        const refineriesResponse = await fetch('/api/refineries');
        const refineriesData = await refineriesResponse.json();
        
        // Process refineries data
        const processedRefineries = (refineriesData || [])
          .filter((r: any) => r && r.id && r.name && r.lat && r.lng)
          .map((r: any) => ({
            id: r.id,
            name: r.name,
            lat: r.lat,
            lng: r.lng,
            country: r.country || 'Unknown',
            region: r.region || 'Unknown',
            operator: r.operator || 'Unknown',
            capacity: r.capacity,
            status: r.status || 'Active'
          }));
        
        setRefineries(processedRefineries);
        setLastUpdated(new Date());
        setLoading(false);
        
        toast({
          title: "Map Data Loaded",
          description: `Loaded ${processedVessels.length} vessels, ${processedPorts.length} ports, and ${processedRefineries.length} refineries.`,
          duration: 3000
        });
        
      } catch (err) {
        console.error('Error fetching map data:', err);
        setError('Failed to load map data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Set up polling for vessel updates
    const intervalId = setInterval(() => {
      if (!loading) {
        updateVessels();
      }
    }, 60000); // Update vessels every minute
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  // Function to update only vessel positions
  const updateVessels = async () => {
    try {
      const response = await fetch('/api/vessels/polling');
      const data = await response.json();
      
      // Process vessels data
      const processedVessels = (data.vessels || [])
        .filter((v: any) => {
          return v && v.id && v.name && v.currentLat && v.currentLng;
        })
        .map((v: any) => ({
          id: v.id,
          name: v.name,
          lat: v.currentLat,
          lng: v.currentLng,
          vesselType: v.vesselType || 'Unknown',
          imo: v.imo || 'N/A',
          mmsi: v.mmsi || 'N/A',
          flag: v.flag || 'Unknown',
          cargoType: v.cargoType || 'Unknown',
          status: v.status || 'At Sea',
          cargoCapacity: v.cargoCapacity
        }));
      
      setVessels(processedVessels);
      setLastUpdated(new Date());
      
    } catch (err) {
      console.error('Error updating vessel data:', err);
    }
  };
  
  // Generate marker icons
  const getVesselIcon = () => {
    return L.divIcon({
      className: 'vessel-marker',
      html: `
        <div class="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center">
          <div class="w-1 h-1 bg-white rounded-full"></div>
        </div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
  };
  
  const getPortIcon = () => {
    return L.divIcon({
      className: 'port-marker',
      html: `
        <div class="w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs">
          ⚓
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };
  
  const getRefineryIcon = () => {
    return L.divIcon({
      className: 'refinery-marker',
      html: `
        <div class="w-5 h-5 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs">
          🏭
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };
  
  // Filter data by region
  const filteredVessels = selectedRegion === 'global' 
    ? vessels 
    : vessels.filter(v => v.lat && v.lng); // We could filter by region if that data was available
    
  const filteredPorts = selectedRegion === 'global'
    ? ports
    : ports.filter(p => p.region === selectedRegion);
    
  const filteredRefineries = selectedRegion === 'global'
    ? refineries
    : refineries.filter(r => r.region === selectedRegion);
  
  return (
    <div className="h-screen w-full flex flex-col">
      <div className="bg-background p-4 shadow-md border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapIcon className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Maritime Intelligence Map</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFiltersPanelOpen(!filtersPanelOpen)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {filtersPanelOpen ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {selectedRegion === 'global' ? 'Global View' : selectedRegion}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedRegion('global')}>
                  Global View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedRegion('North America')}>
                  North America
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedRegion('Europe')}>
                  Europe
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedRegion('Asia')}>
                  Asia
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedRegion('Middle East')}>
                  Middle East
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedRegion('Africa')}>
                  Africa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={updateVessels}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Vessels
            </Button>
          </div>
        </div>
        
        {/* Filters panel */}
        {filtersPanelOpen && (
          <div className="mt-4 p-3 bg-muted rounded-md grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Ship className="h-5 w-5 text-primary" />
                <Label htmlFor="show-vessels">Show Vessels</Label>
              </div>
              <Switch 
                id="show-vessels" 
                checked={showVessels} 
                onCheckedChange={setShowVessels} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Anchor className="h-5 w-5 text-blue-500" />
                <Label htmlFor="show-ports">Show Ports</Label>
              </div>
              <Switch 
                id="show-ports" 
                checked={showPorts} 
                onCheckedChange={setShowPorts} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Factory className="h-5 w-5 text-red-500" />
                <Label htmlFor="show-refineries">Show Refineries</Label>
              </div>
              <Switch 
                id="show-refineries" 
                checked={showRefineries} 
                onCheckedChange={setShowRefineries} 
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-grow relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-lg font-medium">Loading map data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
            <Card className="p-6">
              <p className="text-red-500">{error}</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </Card>
          </div>
        ) : (
          <MapContainer
            center={mapCenter} 
            zoom={3}
            style={{ height: '100%', width: '100%' }}
          >
            {/* Updater component to change map view when needed */}
            <MapCenterUpdater center={mapCenter} />
            
            {/* Base map layer - using a more detailed tile layer */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            
            {/* Vessels Layer */}
            {showVessels && (
              <LayerGroup>
                {filteredVessels.map((vessel) => (
                  <Marker
                    key={`vessel-${vessel.id}`}
                    position={[
                      typeof vessel.lat === 'string' ? parseFloat(vessel.lat) : vessel.lat,
                      typeof vessel.lng === 'string' ? parseFloat(vessel.lng) : vessel.lng
                    ]}
                    icon={getVesselIcon()}
                  >
                    <Popup className="vessel-popup">
                      <div className="text-sm">
                        <h3 className="font-bold text-base">{vessel.name}</h3>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2">
                          <p><strong>IMO:</strong> {vessel.imo}</p>
                          <p><strong>MMSI:</strong> {vessel.mmsi}</p>
                          <p><strong>Type:</strong> {vessel.vesselType}</p>
                          <p><strong>Flag:</strong> {vessel.flag}</p>
                          {vessel.cargoType && <p><strong>Cargo:</strong> {vessel.cargoType}</p>}
                          {vessel.status && <p><strong>Status:</strong> {vessel.status}</p>}
                          {vessel.cargoCapacity && (
                            <p><strong>Capacity:</strong> {(vessel.cargoCapacity/1000).toFixed(0)}k DWT</p>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </LayerGroup>
            )}
            
            {/* Ports Layer */}
            {showPorts && (
              <LayerGroup>
                {filteredPorts.map((port) => (
                  <Marker
                    key={`port-${port.id}`}
                    position={[
                      typeof port.lat === 'string' ? parseFloat(port.lat) : port.lat,
                      typeof port.lng === 'string' ? parseFloat(port.lng) : port.lng
                    ]}
                    icon={getPortIcon()}
                  >
                    <Popup className="port-popup">
                      <div className="text-sm">
                        <h3 className="font-bold text-base">{port.name}</h3>
                        <div className="grid grid-cols-1 gap-y-1 mt-2">
                          <p><strong>Country:</strong> {port.country}</p>
                          <p><strong>Region:</strong> {port.region}</p>
                          <p><strong>Type:</strong> {port.type}</p>
                          <p><strong>Status:</strong> {port.status}</p>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </LayerGroup>
            )}
            
            {/* Refineries Layer */}
            {showRefineries && (
              <LayerGroup>
                {filteredRefineries.map((refinery) => (
                  <Marker
                    key={`refinery-${refinery.id}`}
                    position={[
                      typeof refinery.lat === 'string' ? parseFloat(refinery.lat) : refinery.lat,
                      typeof refinery.lng === 'string' ? parseFloat(refinery.lng) : refinery.lng
                    ]}
                    icon={getRefineryIcon()}
                  >
                    <Popup className="refinery-popup">
                      <div className="text-sm">
                        <h3 className="font-bold text-base">{refinery.name}</h3>
                        <div className="grid grid-cols-1 gap-y-1 mt-2">
                          <p><strong>Country:</strong> {refinery.country}</p>
                          <p><strong>Region:</strong> {refinery.region}</p>
                          {refinery.operator && <p><strong>Operator:</strong> {refinery.operator}</p>}
                          {refinery.capacity && (
                            <p><strong>Capacity:</strong> {refinery.capacity.toLocaleString()} BPD</p>
                          )}
                          <p><strong>Status:</strong> {refinery.status}</p>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </LayerGroup>
            )}
          </MapContainer>
        )}
      </div>
      
      {/* Map info panel */}
      <div className="absolute bottom-4 left-4 z-10">
        <Card className="p-3 shadow-lg">
          <Tabs defaultValue="summary">
            <TabsList className="mb-2">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="legend">Legend</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2">
                  <Ship className="h-4 w-4 text-primary" />
                  <span>Vessels: {showVessels ? filteredVessels.length : 'Hidden'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Anchor className="h-4 w-4 text-blue-500" />
                  <span>Ports: {showPorts ? filteredPorts.length : 'Hidden'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Factory className="h-4 w-4 text-red-500" />
                  <span>Refineries: {showRefineries ? filteredRefineries.length : 'Hidden'}</span>
                </div>
                {lastUpdated && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="legend">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary rounded-full border-2 border-white"></div>
                  <span>Vessel</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                  <span>Port</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                  <span>Refinery</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}