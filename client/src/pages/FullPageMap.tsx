import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup, LayerGroup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
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
import '../styles/map.css';

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

const FullPageMap: React.FC = () => {
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
      map.setView([lat, lng], 8);
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
              {selectedItem && selectedItem.currentLat && selectedItem.currentLng && (
                <CenterMapOnItem 
                  lat={parseFloat(selectedItem.currentLat)} 
                  lng={parseFloat(selectedItem.currentLng)} 
                />
              )}
              
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
                            <p>Type: {vessel.vesselType}</p>
                            <p>IMO: {vessel.imo}</p>
                            <p>Flag: {vessel.flag}</p>
                            {vessel.speed && <p>Speed: {vessel.speed} knots</p>}
                            <Button 
                              size="sm" 
                              className="mt-2 w-full"
                              onClick={() => handleItemClick(vessel, 'vessel')}
                            >
                              View Details
                            </Button>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </LayerGroup>
              )}
              
              {/* Refineries Layer */}
              {showRefineries && (
                <MarkerClusterGroup>
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
                          <p>Country: {refinery.country}</p>
                          <p>Capacity: {refinery.capacity.toLocaleString()} bbl/day</p>
                          <Button 
                            size="sm" 
                            className="mt-2 w-full"
                            onClick={() => handleItemClick(refinery, 'refinery')}
                          >
                            View Details
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MarkerClusterGroup>
              )}
              
              {/* Ports Layer */}
              {showPorts && (
                <MarkerClusterGroup>
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
                          <p>Country: {port.country}</p>
                          <p>Type: {port.portType}</p>
                          <Button 
                            size="sm" 
                            className="mt-2 w-full"
                            onClick={() => handleItemClick(port, 'port')}
                          >
                            View Details
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MarkerClusterGroup>
              )}
              
              {/* Map controls - custom positioned */}
              <div className="leaflet-top leaflet-right">
                <div className="leaflet-control leaflet-bar bg-background rounded-md shadow-md p-2 mr-2 mt-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMapZoom(prev => Math.min(prev + 1, 18))}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMapZoom(prev => Math.max(prev - 1, 1))}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </MapContainer>
            
            {/* Side control panel */}
            <div className="absolute left-2 top-2 bottom-2 w-[300px] bg-background/90 backdrop-blur-sm rounded-lg shadow-lg z-10 p-4 overflow-y-auto">
              <Tabs defaultValue="layers">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="layers" className="flex-1">Layers</TabsTrigger>
                  <TabsTrigger value="filters" className="flex-1">Filters</TabsTrigger>
                  {selectedItem && (
                    <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                  )}
                </TabsList>
                
                <TabsContent value="layers" className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-muted-foreground">MAP LAYERS</h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Ship className="h-4 w-4 text-primary" />
                        <Label htmlFor="show-vessels">Vessels</Label>
                      </div>
                      <Switch 
                        id="show-vessels" 
                        checked={showVessels} 
                        onCheckedChange={setShowVessels} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Factory className="h-4 w-4 text-red-500" />
                        <Label htmlFor="show-refineries">Refineries</Label>
                      </div>
                      <Switch 
                        id="show-refineries" 
                        checked={showRefineries} 
                        onCheckedChange={setShowRefineries} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Anchor className="h-4 w-4 text-blue-500" />
                        <Label htmlFor="show-ports">Ports</Label>
                      </div>
                      <Switch 
                        id="show-ports" 
                        checked={showPorts} 
                        onCheckedChange={setShowPorts} 
                      />
                    </div>
                  </div>
                  
                  <div className="bg-muted p-3 rounded-lg mt-4">
                    <h3 className="font-medium mb-2">Map Statistics</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Vessels:</p>
                        <p className="font-medium">{filteredVessels.length}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Refineries:</p>
                        <p className="font-medium">{filteredRefineries.length}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Ports:</p>
                        <p className="font-medium">{filteredPorts.length}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Region:</p>
                        <p className="font-medium">{selectedRegion === "all" ? "Global" : selectedRegion}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg mt-4">
                    <h3 className="font-medium mb-2">Legend</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                        <span>Oil Tankers</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <span>Cargo Vessels</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        <span>Refineries</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                        <span>Ports</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="filters" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground">FILTER OPTIONS</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="vessel-type">Vessel Type</Label>
                      <Select value={vesselTypeFilter} onValueChange={setVesselTypeFilter}>
                        <SelectTrigger id="vessel-type">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="Oil Tanker">Oil Tankers</SelectItem>
                          <SelectItem value="Cargo">Cargo Ships</SelectItem>
                          <SelectItem value="Container Ship">Container Ships</SelectItem>
                          <SelectItem value="LNG Tanker">LNG Tankers</SelectItem>
                          <SelectItem value="Chemical Tanker">Chemical Tankers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="port-type">Port Type</Label>
                      <Select value={portTypeFilter} onValueChange={setPortTypeFilter}>
                        <SelectTrigger id="port-type">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="Oil Terminal">Oil Terminals</SelectItem>
                          <SelectItem value="Container Terminal">Container Terminals</SelectItem>
                          <SelectItem value="LNG Terminal">LNG Terminals</SelectItem>
                          <SelectItem value="Bulk Terminal">Bulk Terminals</SelectItem>
                          <SelectItem value="Multipurpose">Multipurpose</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Map Zoom Level</Label>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => setMapZoom(prev => Math.max(prev - 1, 1))}
                        >
                          <Minimize className="h-4 w-4" />
                        </Button>
                        <Slider
                          value={[mapZoom]}
                          min={1}
                          max={18}
                          step={1}
                          onValueChange={(value) => setMapZoom(value[0])}
                          className="flex-1"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => setMapZoom(prev => Math.min(prev + 1, 18))}
                        >
                          <Maximize className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground text-right">Current zoom: {mapZoom}</p>
                    </div>
                  </div>
                </TabsContent>
                
                {selectedItem && (
                  <TabsContent value="details" className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">
                        {selectedItemType === 'vessel' ? 'Vessel Details' : 
                         selectedItemType === 'refinery' ? 'Refinery Details' : 'Port Details'}
                      </h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleCloseDetails}
                      >
                        Close
                      </Button>
                    </div>
                    
                    {selectedItemType === 'vessel' && (
                      <div className="space-y-4">
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <h2 className="text-lg font-bold">{selectedItem.name}</h2>
                          <Badge className="mt-1">{selectedItem.vesselType}</Badge>
                        </div>
                        
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                            <AccordionTrigger>Basic Information</AccordionTrigger>
                            <AccordionContent>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <p className="text-muted-foreground">IMO:</p>
                                  <p className="font-medium">{selectedItem.imo}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">MMSI:</p>
                                  <p className="font-medium">{selectedItem.mmsi}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Flag:</p>
                                  <p className="font-medium">{selectedItem.flag}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Status:</p>
                                  <p className="font-medium">{selectedItem.status || 'At Sea'}</p>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="item-2">
                            <AccordionTrigger>Navigation Data</AccordionTrigger>
                            <AccordionContent>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Speed:</p>
                                  <p className="font-medium">{selectedItem.speed || 'N/A'} knots</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Course:</p>
                                  <p className="font-medium">{selectedItem.course || 'N/A'}°</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Latitude:</p>
                                  <p className="font-medium">{selectedItem.currentLat}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Longitude:</p>
                                  <p className="font-medium">{selectedItem.currentLng}</p>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="item-3">
                            <AccordionTrigger>Cargo Information</AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Cargo Type:</p>
                                  <p className="font-medium">{selectedItem.cargoType || 'Unknown'}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Capacity:</p>
                                  <p className="font-medium">
                                    {selectedItem.cargoCapacity 
                                      ? selectedItem.cargoCapacity.toLocaleString() + ' MT' 
                                      : 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Destination:</p>
                                  <p className="font-medium">{selectedItem.destination || 'N/A'}</p>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                        
                        <div className="flex space-x-2 mt-4">
                          <Button 
                            className="flex-1"
                            onClick={() => window.open(`/vessels/${selectedItem.id}`, '_blank')}
                          >
                            Open Full Profile
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => window.open(`/vessels/${selectedItem.id}/documents`, '_blank')}
                          >
                            View Documents
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {selectedItemType === 'refinery' && (
                      <div className="space-y-4">
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <h2 className="text-lg font-bold">{selectedItem.name}</h2>
                          <Badge className="mt-1">{selectedItem.country}</Badge>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-muted-foreground">Region:</p>
                              <p className="font-medium">{selectedItem.region}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Capacity:</p>
                              <p className="font-medium">{selectedItem.capacity.toLocaleString()} bbl/day</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Status:</p>
                              <p className="font-medium">{selectedItem.status || 'Active'}</p>
                            </div>
                          </div>
                          
                          {selectedItem.description && (
                            <div className="mt-4">
                              <h3 className="font-medium mb-1">Description</h3>
                              <p className="text-sm">{selectedItem.description}</p>
                            </div>
                          )}
                          
                          <div className="mt-4">
                            <h3 className="font-medium mb-1">Location</h3>
                            <p className="text-sm">Lat: {selectedItem.lat}</p>
                            <p className="text-sm">Lng: {selectedItem.lng}</p>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full mt-4"
                          onClick={() => window.open(`/refineries/${selectedItem.id}`, '_blank')}
                        >
                          View Full Details
                        </Button>
                      </div>
                    )}
                    
                    {selectedItemType === 'port' && (
                      <div className="space-y-4">
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <h2 className="text-lg font-bold">{selectedItem.name}</h2>
                          <Badge className="mt-1">{selectedItem.portType}</Badge>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-muted-foreground">Country:</p>
                              <p className="font-medium">{selectedItem.country}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Region:</p>
                              <p className="font-medium">{selectedItem.region}</p>
                            </div>
                          </div>
                          
                          {selectedItem.description && (
                            <div className="mt-4">
                              <h3 className="font-medium mb-1">Description</h3>
                              <p className="text-sm">{selectedItem.description}</p>
                            </div>
                          )}
                          
                          <div className="mt-4">
                            <h3 className="font-medium mb-1">Location</h3>
                            <p className="text-sm">Lat: {selectedItem.lat}</p>
                            <p className="text-sm">Lng: {selectedItem.lng}</p>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full mt-4"
                          onClick={() => window.open(`/ports/${selectedItem.id}`, '_blank')}
                        >
                          View Full Details
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FullPageMap;