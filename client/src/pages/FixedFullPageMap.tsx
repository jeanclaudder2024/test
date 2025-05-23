import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup, LayerGroup } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Anchor, ArrowDown, ArrowUp, Droplets, Factory, 
  Filter, Locate, MapPin, Maximize, Minimize, Navigation, 
  Search, Ship, Waves, Wind, MapIcon, RefreshCw 
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Define types for the data we'll be displaying
interface Vessel {
  id: number;
  name: string;
  currentLat: string | null;
  currentLng: string | null;
  vesselType: string;
  imo: string;
  mmsi: string;
  flag: string;
  course?: number;
  speed?: number;
  destination?: string;
  cargoType?: string;
  cargoCapacity?: number;
  status?: string;
}

interface Refinery {
  id: number;
  name: string;
  country: string;
  region: string;
  capacity: number;
  lat: string;
  lng: string;
  description?: string;
  status?: string;
}

interface Port {
  id: number;
  name: string;
  country: string;
  region: string;
  lat: string;
  lng: string;
  portType: string;
  description?: string;
}

export default function FixedFullPageMap() {
  // State for data
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [refineries, setRefineries] = useState<Refinery[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filtering and view options
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [showVessels, setShowVessels] = useState<boolean>(true);
  const [showRefineries, setShowRefineries] = useState<boolean>(true);
  const [showPorts, setShowPorts] = useState<boolean>(true);
  const [vesselTypeFilter, setVesselTypeFilter] = useState<string>("all");
  const [portTypeFilter, setPortTypeFilter] = useState<string>("all");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [mapZoom, setMapZoom] = useState<number>(3);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedItemType, setSelectedItemType] = useState<string | null>(null);
  
  // Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // Load data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch vessels
        const vesselsRes = await fetch('/api/vessels/polling');
        const vesselsData = await vesselsRes.json();
        setVessels(vesselsData.vessels || []);
        
        // Fetch refineries
        const refineriesRes = await fetch('/api/refineries');
        const refineriesData = await refineriesRes.json();
        setRefineries(refineriesData || []);
        
        // Fetch ports
        const portsRes = await fetch('/api/ports');
        const portsData = await portsRes.json();
        setPorts(portsData || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching map data:', err);
        setError('Failed to load map data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Set up polling for vessel updates (every 30 seconds)
    const intervalId = setInterval(async () => {
      try {
        const vesselsRes = await fetch('/api/vessels/polling');
        const vesselsData = await vesselsRes.json();
        setVessels(vesselsData.vessels || []);
      } catch (err) {
        console.error('Error polling vessel data:', err);
      }
    }, 30000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (mapContainerRef.current?.requestFullscreen) {
        mapContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };
  
  // Filter data based on selected filters
  const filteredVessels = vessels.filter(vessel => {
    const regionMatch = selectedRegion === "all" || vessel.destination?.includes(selectedRegion);
    const typeMatch = vesselTypeFilter === "all" || vessel.vesselType === vesselTypeFilter;
    const searchMatch = searchQuery === "" || 
      vessel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vessel.imo.includes(searchQuery) ||
      vessel.mmsi.includes(searchQuery);
    return regionMatch && typeMatch && searchMatch && vessel.currentLat && vessel.currentLng;
  });
  
  const filteredRefineries = refineries.filter(refinery => {
    const regionMatch = selectedRegion === "all" || refinery.region === selectedRegion;
    const searchMatch = searchQuery === "" || 
      refinery.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refinery.country.toLowerCase().includes(searchQuery.toLowerCase());
    return regionMatch && searchMatch;
  });
  
  const filteredPorts = ports.filter(port => {
    const regionMatch = selectedRegion === "all" || port.region === selectedRegion;
    const typeMatch = portTypeFilter === "all" || port.portType === portTypeFilter;
    const searchMatch = searchQuery === "" || 
      port.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      port.country.toLowerCase().includes(searchQuery.toLowerCase());
    return regionMatch && typeMatch && searchMatch;
  });
  
  // Generate custom vessel icon based on vessel type and heading
  const getVesselIcon = (vessel: Vessel) => {
    const course = vessel.course || 0;
    const size = 30; // Base size for vessel icons
    
    // Different colors for different vessel types
    let color = '#3b82f6'; // Default blue
    if (vessel.vesselType.toLowerCase().includes('tanker')) {
      color = '#f97316'; // Orange for tankers
    } else if (vessel.vesselType.toLowerCase().includes('cargo')) {
      color = '#10b981'; // Green for cargo
    } else if (vessel.vesselType.toLowerCase().includes('passenger')) {
      color = '#8b5cf6'; // Purple for passenger
    }
    
    // Create a custom ship-shaped icon that rotates based on course
    const svgTemplate = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="${size}" height="${size}" 
        style="transform: rotate(${course}deg);">
        <path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.5L20 10.62V6c0-1.1-.9-2-2-2h-3V1H9v3H6c-1.1 0-2 .9-2 2v4.62l-1.29.42c-.26.08-.48.26-.6.5s-.15.52-.06.78L3.95 19zM6 6h12v3.97L12 8 6 9.97V6z"/>
      </svg>
    `;
    
    const svgIcon = encodeURIComponent(svgTemplate);
    const dataUrl = `data:image/svg+xml;charset=utf-8,${svgIcon}`;
    
    return L.icon({
      iconUrl: dataUrl,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
      popupAnchor: [0, -size/2]
    });
  };
  
  // Generate custom port icon
  const getPortIcon = (port: Port) => {
    let color = '#3b82f6'; // Default blue
    let icon = 'anchor';
    
    // Different colors and icons for port types
    if (port.portType.toLowerCase().includes('oil')) {
      color = '#f97316'; // Orange for oil terminal
      icon = 'droplets';
    } else if (port.portType.toLowerCase().includes('lng')) {
      color = '#10b981'; // Green for LNG
      icon = 'wind';
    } else if (port.portType.toLowerCase().includes('container')) {
      color = '#8b5cf6'; // Purple for container
      icon = 'package';
    }
    
    // Create a custom port icon using Lucide icons as templates
    const svgTemplate = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">
        <circle cx="12" cy="12" r="10" fill="white" stroke="${color}" stroke-width="1.5"/>
        <path d="M12 20.5V9.5M6 14.5L12 9.5L18 14.5M7 9.5H17" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    
    const svgIcon = encodeURIComponent(svgTemplate);
    const dataUrl = `data:image/svg+xml;charset=utf-8,${svgIcon}`;
    
    return L.icon({
      iconUrl: dataUrl,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
      className: 'pulse-icon' // Add pulse animation class
    });
  };
  
  // Generate custom refinery icon
  const getRefineryIcon = (refinery: Refinery) => {
    const svgTemplate = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">
        <circle cx="12" cy="12" r="10" fill="white" stroke="#ef4444" stroke-width="1.5"/>
        <path d="M7 20V12C7 11.4477 7.44772 11 8 11H10C10.5523 11 11 11.4477 11 12V20M15 20V13M5 20H19M14 8H16M12 8H10M9 4H15" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    
    const svgIcon = encodeURIComponent(svgTemplate);
    const dataUrl = `data:image/svg+xml;charset=utf-8,${svgIcon}`;
    
    return L.icon({
      iconUrl: dataUrl,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    });
  };
  
  // Handle click on map items
  const handleItemClick = (item: any, type: string) => {
    setSelectedItem(item);
    setSelectedItemType(type);
  };
  
  // Reset selected item
  const handleCloseDetails = () => {
    setSelectedItem(null);
    setSelectedItemType(null);
  };
  
  // Center map on coordinates
  const CenterMapOnItem = ({ lat, lng }: { lat: number, lng: number }) => {
    const map = useMap();
    useEffect(() => {
      const position: LatLngExpression = [lat, lng];
      map.setView(position, 8);
    }, [lat, lng, map]);
    return null;
  };
  
  return (
    <div className="h-screen w-full flex flex-col" ref={mapContainerRef}>
      <div className="bg-background p-2 shadow-md z-10 border-b flex flex-wrap justify-between items-center">
        <div className="flex items-center space-x-2">
          <MapIcon className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Maritime Intelligence Map</h1>
          <Badge variant="outline" className="ml-2">Live Data</Badge>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Region Filter */}
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="Asia-Pacific">Asia-Pacific</SelectItem>
              <SelectItem value="Europe">Europe</SelectItem>
              <SelectItem value="North America">North America</SelectItem>
              <SelectItem value="Latin America">Latin America</SelectItem>
              <SelectItem value="Middle East">Middle East</SelectItem>
              <SelectItem value="Africa">Africa</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search vessels, ports, refineries..."
              className="pl-8 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Full screen toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={toggleFullscreen}>
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <div className="flex-grow relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-lg font-medium">Loading map data...</p>
              <Progress className="w-64 mt-4" value={75} />
            </div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
            <Card className="w-[400px]">
              <CardHeader>
                <h3 className="text-lg font-medium text-red-500">Error Loading Map</h3>
              </CardHeader>
              <CardContent>
                <p>{error}</p>
                <Button className="mt-4" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {/* Map Container */}
            <MapContainer
              center={[20, 0]}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              {/* Base map layers */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Ocean tile layer */}
              <TileLayer
                attribution='&copy; <a href="https://openseamap.org">OpenSeaMap</a> contributors'
                url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
                zIndex={10}
              />
              
              {/* Vessels Layer */}
              {showVessels && (
                <LayerGroup>
                  <MarkerClusterGroup
                    chunkedLoading
                    spiderfyOnMaxZoom={true}
                    showCoverageOnHover={false}
                    zoomToBoundsOnClick={true}
                    maxClusterRadius={40}
                  >
                    {filteredVessels.map((vessel) => {
                      if (!vessel.currentLat || !vessel.currentLng) return null;
                      return (
                        <Marker
                          key={vessel.id}
                          position={[parseFloat(vessel.currentLat), parseFloat(vessel.currentLng)]}
                          icon={getVesselIcon(vessel)}
                          eventHandlers={{
                            click: () => handleItemClick(vessel, 'vessel')
                          }}
                        >
                          <Popup>
                            <div className="text-sm">
                              <h3 className="font-bold text-base">{vessel.name}</h3>
                              <div className="mt-1">
                                <div><span className="font-medium">IMO:</span> {vessel.imo}</div>
                                <div><span className="font-medium">MMSI:</span> {vessel.mmsi}</div>
                                <div><span className="font-medium">Type:</span> {vessel.vesselType}</div>
                                <div><span className="font-medium">Flag:</span> {vessel.flag}</div>
                                {vessel.status && (
                                  <div><span className="font-medium">Status:</span> {vessel.status}</div>
                                )}
                                {vessel.speed !== undefined && (
                                  <div><span className="font-medium">Speed:</span> {vessel.speed} knots</div>
                                )}
                                {vessel.destination && (
                                  <div><span className="font-medium">Destination:</span> {vessel.destination}</div>
                                )}
                                {vessel.cargoType && (
                                  <div><span className="font-medium">Cargo:</span> {vessel.cargoType}</div>
                                )}
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MarkerClusterGroup>
                </LayerGroup>
              )}
              
              {/* Refineries Layer */}
              {showRefineries && (
                <LayerGroup>
                  {filteredRefineries.map((refinery) => (
                    <Marker
                      key={refinery.id}
                      position={[parseFloat(refinery.lat), parseFloat(refinery.lng)]}
                      icon={getRefineryIcon(refinery)}
                      eventHandlers={{
                        click: () => handleItemClick(refinery, 'refinery')
                      }}
                    >
                      <Popup>
                        <div className="text-sm">
                          <h3 className="font-bold text-base">{refinery.name}</h3>
                          <div className="mt-1">
                            <div><span className="font-medium">Country:</span> {refinery.country}</div>
                            <div><span className="font-medium">Region:</span> {refinery.region}</div>
                            <div><span className="font-medium">Capacity:</span> {refinery.capacity.toLocaleString()} bpd</div>
                            {refinery.status && <div><span className="font-medium">Status:</span> {refinery.status}</div>}
                            {refinery.description && <div className="mt-1">{refinery.description}</div>}
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
                      key={port.id}
                      position={[parseFloat(port.lat), parseFloat(port.lng)]}
                      icon={getPortIcon(port)}
                      eventHandlers={{
                        click: () => handleItemClick(port, 'port')
                      }}
                    >
                      <Popup>
                        <div className="text-sm">
                          <h3 className="font-bold text-base">{port.name}</h3>
                          <div className="mt-1">
                            <div><span className="font-medium">Country:</span> {port.country}</div>
                            <div><span className="font-medium">Region:</span> {port.region}</div>
                            <div><span className="font-medium">Type:</span> {port.portType}</div>
                            {port.description && <div className="mt-1">{port.description}</div>}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </LayerGroup>
              )}
            </MapContainer>
            
            {/* Map Controls Panel */}
            <div className="absolute top-4 left-4 z-20">
              <Card className="w-[250px] shadow-lg">
                <CardHeader className="py-2">
                  <h3 className="text-sm font-semibold">Map Layers</h3>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-vessels" className="text-sm flex items-center gap-2">
                        <Ship className="h-4 w-4" /> Vessels
                      </Label>
                      <Switch 
                        id="show-vessels" 
                        checked={showVessels}
                        onCheckedChange={setShowVessels}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-refineries" className="text-sm flex items-center gap-2">
                        <Factory className="h-4 w-4" /> Refineries
                      </Label>
                      <Switch 
                        id="show-refineries" 
                        checked={showRefineries}
                        onCheckedChange={setShowRefineries}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-ports" className="text-sm flex items-center gap-2">
                        <Anchor className="h-4 w-4" /> Ports
                      </Label>
                      <Switch 
                        id="show-ports" 
                        checked={showPorts}
                        onCheckedChange={setShowPorts}
                      />
                    </div>
                    
                    {showVessels && (
                      <div className="pt-2">
                        <Label htmlFor="vessel-filter" className="text-xs text-muted-foreground">
                          Vessel Type Filter
                        </Label>
                        <Select value={vesselTypeFilter} onValueChange={setVesselTypeFilter}>
                          <SelectTrigger id="vessel-filter" className="h-8 mt-1 text-xs">
                            <SelectValue placeholder="Filter vessel types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="Tanker">Tankers</SelectItem>
                            <SelectItem value="Cargo">Cargo Ships</SelectItem>
                            <SelectItem value="Passenger">Passenger Ships</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    {showPorts && (
                      <div className="pt-2">
                        <Label htmlFor="port-filter" className="text-xs text-muted-foreground">
                          Port Type Filter
                        </Label>
                        <Select value={portTypeFilter} onValueChange={setPortTypeFilter}>
                          <SelectTrigger id="port-filter" className="h-8 mt-1 text-xs">
                            <SelectValue placeholder="Filter port types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="oil_terminal">Oil Terminal</SelectItem>
                            <SelectItem value="container_terminal">Container Terminal</SelectItem>
                            <SelectItem value="lng_terminal">LNG Terminal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Stats panel */}
            <div className="absolute bottom-4 left-4 z-20">
              <Card className="shadow-lg">
                <CardContent className="p-3">
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Vessels:</span>
                      <Badge variant="secondary">{filteredVessels.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Refineries:</span>
                      <Badge variant="secondary">{filteredRefineries.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Ports:</span>
                      <Badge variant="secondary">{filteredPorts.length}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Detail panel for selected item */}
            {selectedItem && selectedItemType && (
              <div className="absolute top-4 right-4 z-20">
                <Card className="w-[300px] shadow-lg">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-semibold">
                        {selectedItemType === 'vessel' && 'Vessel Details'}
                        {selectedItemType === 'refinery' && 'Refinery Details'}
                        {selectedItemType === 'port' && 'Port Details'}
                      </h3>
                      <Button variant="ghost" size="sm" onClick={handleCloseDetails}>×</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2">
                    {selectedItemType === 'vessel' && (
                      <div className="space-y-2 text-sm">
                        <h4 className="font-medium text-lg">{selectedItem.name}</h4>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="text-muted-foreground">IMO:</div>
                          <div>{selectedItem.imo}</div>
                          <div className="text-muted-foreground">MMSI:</div>
                          <div>{selectedItem.mmsi}</div>
                          <div className="text-muted-foreground">Flag:</div>
                          <div>{selectedItem.flag}</div>
                          <div className="text-muted-foreground">Type:</div>
                          <div>{selectedItem.vesselType}</div>
                          {selectedItem.status && (
                            <>
                              <div className="text-muted-foreground">Status:</div>
                              <div>{selectedItem.status}</div>
                            </>
                          )}
                          {selectedItem.speed !== undefined && (
                            <>
                              <div className="text-muted-foreground">Speed:</div>
                              <div>{selectedItem.speed} knots</div>
                            </>
                          )}
                          {selectedItem.course !== undefined && (
                            <>
                              <div className="text-muted-foreground">Course:</div>
                              <div>{selectedItem.course}°</div>
                            </>
                          )}
                          {selectedItem.destination && (
                            <>
                              <div className="text-muted-foreground">Destination:</div>
                              <div>{selectedItem.destination}</div>
                            </>
                          )}
                          {selectedItem.cargoType && (
                            <>
                              <div className="text-muted-foreground">Cargo:</div>
                              <div>{selectedItem.cargoType}</div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {selectedItemType === 'refinery' && (
                      <div className="space-y-2 text-sm">
                        <h4 className="font-medium text-lg">{selectedItem.name}</h4>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="text-muted-foreground">Country:</div>
                          <div>{selectedItem.country}</div>
                          <div className="text-muted-foreground">Region:</div>
                          <div>{selectedItem.region}</div>
                          <div className="text-muted-foreground">Capacity:</div>
                          <div>{selectedItem.capacity.toLocaleString()} bpd</div>
                          {selectedItem.status && (
                            <>
                              <div className="text-muted-foreground">Status:</div>
                              <div>{selectedItem.status}</div>
                            </>
                          )}
                        </div>
                        {selectedItem.description && (
                          <div className="mt-2 text-muted-foreground">{selectedItem.description}</div>
                        )}
                      </div>
                    )}
                    
                    {selectedItemType === 'port' && (
                      <div className="space-y-2 text-sm">
                        <h4 className="font-medium text-lg">{selectedItem.name}</h4>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="text-muted-foreground">Country:</div>
                          <div>{selectedItem.country}</div>
                          <div className="text-muted-foreground">Region:</div>
                          <div>{selectedItem.region}</div>
                          <div className="text-muted-foreground">Type:</div>
                          <div>{selectedItem.portType}</div>
                        </div>
                        {selectedItem.description && (
                          <div className="mt-2 text-muted-foreground">{selectedItem.description}</div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}