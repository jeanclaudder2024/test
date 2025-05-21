import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup, LayerGroup, ZoomControl, AttributionControl } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Anchor, ArrowDown, ArrowUp, Droplets, Factory, 
  Filter, Locate, MapPin, Maximize, Minimize, Navigation, 
  Search, Ship, Waves, Wind, MapIcon, RefreshCw, 
  Layers, Info, Settings, ChevronLeft, ChevronRight, ChevronUp,
  Ruler, Compass, Download, Share, AlertCircle, Eye,
  Ban, Printer, Truck, Route, Wrench, Focus, BarChart4,
  History, Calendar, Clock, PieChart, PanelTopOpen, Map,
  Cloud, X, ArrowRight
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
import { ScrollArea } from "@/components/ui/scroll-area";
import 'leaflet/dist/leaflet.css';

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
  
  // Advanced map control options
  const [mapStyle, setMapStyle] = useState<string>("standard");
  const [showControlPanel, setShowControlPanel] = useState<boolean>(true);
  const [controlPanelTab, setControlPanelTab] = useState<string>("insights");
  const [toolbarExpanded, setToolbarExpanded] = useState<boolean>(true);
  const [showMeasurementTools, setShowMeasurementTools] = useState<boolean>(false);
  const [showWeatherLayer, setShowWeatherLayer] = useState<boolean>(false);
  const [showTrafficDensity, setShowTrafficDensity] = useState<boolean>(false);
  const [showRiskAreas, setShowRiskAreas] = useState<boolean>(false);
  const [vesselTrackingMode, setVesselTrackingMode] = useState<string>("standard");
  const [filterPanelOpen, setFilterPanelOpen] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(true);
  
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
        {/* Advanced Global Map Controls - Fixed position toolbar */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 z-20">
          <TooltipProvider>
            <div className="flex flex-col gap-1.5 bg-background/90 backdrop-blur-sm p-1.5 rounded-lg shadow-lg">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setShowControlPanel(!showControlPanel)}>
                    <PanelTopOpen className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  {showControlPanel ? 'Hide' : 'Show'} Control Panel
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setShowWeatherLayer(!showWeatherLayer)}>
                    <Cloud className={showWeatherLayer ? "h-5 w-5 text-blue-500" : "h-5 w-5"} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  {showWeatherLayer ? 'Hide' : 'Show'} Weather
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setShowMeasurementTools(!showMeasurementTools)}>
                    <Ruler className={showMeasurementTools ? "h-5 w-5 text-green-500" : "h-5 w-5"} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  {showMeasurementTools ? 'Hide' : 'Show'} Measurement Tools
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setShowRiskAreas(!showRiskAreas)}>
                    <AlertCircle className={showRiskAreas ? "h-5 w-5 text-red-500" : "h-5 w-5"} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  {showRiskAreas ? 'Hide' : 'Show'} Risk Areas
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setShowTrafficDensity(!showTrafficDensity)}>
                    <BarChart4 className={showTrafficDensity ? "h-5 w-5 text-purple-500" : "h-5 w-5"} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  {showTrafficDensity ? 'Hide' : 'Show'} Traffic Density
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setFilterPanelOpen(!filterPanelOpen)}>
                    <Filter className={filterPanelOpen ? "h-5 w-5 text-amber-500" : "h-5 w-5"} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  Advanced Filters
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
        
        {/* Map Style Selection Dropdown - Bottom right */}
        <div className="absolute bottom-10 right-2 z-20">
          <Select value={mapStyle} onValueChange={setMapStyle}>
            <SelectTrigger className="w-[160px] bg-background/90 backdrop-blur-sm">
              <SelectValue placeholder="Map Style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="satellite">Satellite</SelectItem>
              <SelectItem value="dark">Dark Mode</SelectItem>
              <SelectItem value="nautical">Nautical</SelectItem>
              <SelectItem value="terrain">Terrain</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Top Panel - Maritime Intelligence Insights */}
        {showControlPanel && (
          <div className="absolute top-0 left-0 right-0 h-auto bg-background/90 backdrop-blur-sm py-2 px-4 z-20 border-b shadow-md">
            <div className="flex justify-between items-center">
              <Tabs value={controlPanelTab} onValueChange={setControlPanelTab} className="w-full">
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="insights" className="text-xs flex items-center gap-1">
                    <Info className="h-4 w-4" /> Insights
                  </TabsTrigger>
                  <TabsTrigger value="tracking" className="text-xs flex items-center gap-1">
                    <Ship className="h-4 w-4" /> Tracking
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="text-xs flex items-center gap-1">
                    <PieChart className="h-4 w-4" /> Analytics
                  </TabsTrigger>
                  <TabsTrigger value="routes" className="text-xs flex items-center gap-1">
                    <Route className="h-4 w-4" /> Routes
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="text-xs flex items-center gap-1">
                    <Settings className="h-4 w-4" /> Settings
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="insights" className="pt-2">
                  <div className="grid grid-cols-4 gap-4">
                    <Card className="col-span-1">
                      <CardHeader className="py-2 px-3">
                        <CardTitle className="text-sm">Vessel Overview</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 px-3">
                        <div className="text-2xl font-bold">{vessels.length}</div>
                        <div className="text-xs text-muted-foreground">Active Vessels</div>
                        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                          <span>Tankers: {vessels.filter(v => v.vesselType?.toLowerCase().includes('tanker')).length}</span>
                          <span>Cargo: {vessels.filter(v => v.vesselType?.toLowerCase().includes('cargo')).length}</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="col-span-1">
                      <CardHeader className="py-2 px-3">
                        <CardTitle className="text-sm">Port Activity</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 px-3">
                        <div className="text-2xl font-bold">{ports.length}</div>
                        <div className="text-xs text-muted-foreground">Monitored Ports</div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {selectedRegion !== "all" ? `${selectedRegion}: ${ports.filter(p => p.region === selectedRegion).length} ports` : "Viewing all regions"}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="col-span-1">
                      <CardHeader className="py-2 px-3">
                        <CardTitle className="text-sm">Refinery Status</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 px-3">
                        <div className="text-2xl font-bold">{refineries.length}</div>
                        <div className="text-xs text-muted-foreground">Active Refineries</div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Total Capacity: {refineries.reduce((sum, r) => sum + (r.capacity || 0), 0).toLocaleString()} bbl/day
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="col-span-1">
                      <CardHeader className="py-2 px-3">
                        <CardTitle className="text-sm">Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 px-3 flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="text-xs h-7">
                          <History className="h-3 w-3 mr-1" /> History
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs h-7">
                          <Printer className="h-3 w-3 mr-1" /> Report
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs h-7">
                          <Share className="h-3 w-3 mr-1" /> Share
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="tracking">
                  <div className="pt-2">
                    <Card>
                      <CardHeader className="py-2 px-4">
                        <CardTitle className="text-sm">Vessel Tracking Configuration</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-xs mb-1 block" htmlFor="tracking-mode">Tracking Mode</Label>
                          <Select value={vesselTrackingMode} onValueChange={setVesselTrackingMode}>
                            <SelectTrigger id="tracking-mode">
                              <SelectValue placeholder="Select mode" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="detailed">Detailed</SelectItem>
                              <SelectItem value="predictive">Predictive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label className="text-xs mb-1 block">Update Frequency</Label>
                          <Slider 
                            defaultValue={[30]} 
                            max={60} 
                            min={5} 
                            step={5}
                            className="mt-2" 
                          />
                          <div className="flex justify-between text-xs mt-1">
                            <span>5s</span>
                            <span>60s</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col justify-center">
                          <div className="flex items-center space-x-2 mb-2">
                            <Switch id="vessel-alerts" />
                            <Label htmlFor="vessel-alerts" className="text-xs">Alert Notifications</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="vessel-history" defaultChecked />
                            <Label htmlFor="vessel-history" className="text-xs">Track Vessel History</Label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="analytics">
                  <div className="pt-2 grid grid-cols-3 gap-4">
                    <Card className="col-span-2">
                      <CardHeader className="py-2 px-3">
                        <CardTitle className="text-sm">Maritime Traffic Analysis</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 px-3">
                        <div className="h-[100px] flex items-center justify-center border border-dashed rounded-md">
                          <p className="text-xs text-muted-foreground">Interactive Traffic Analysis Chart</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="col-span-1">
                      <CardHeader className="py-2 px-3">
                        <CardTitle className="text-sm">Global Hotspots</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 px-3 text-xs">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span>Strait of Hormuz</span>
                            <Badge variant="outline" className="text-red-500">High Traffic</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Suez Canal</span>
                            <Badge variant="outline" className="text-amber-500">Moderate</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Singapore Strait</span>
                            <Badge variant="outline" className="text-red-500">High Traffic</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="routes">
                  <div className="pt-2">
                    <Card>
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-2">
                          <Input placeholder="Origin port" className="text-sm" />
                          <ArrowRight className="h-4 w-4 flex-shrink-0" />
                          <Input placeholder="Destination port" className="text-sm" />
                          <Button size="sm">Calculate Route</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="settings">
                  <div className="pt-2">
                    <Card>
                      <CardContent className="p-3 grid grid-cols-3 gap-x-8 gap-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="show-vessels" className="text-xs">Show Vessels</Label>
                          <Switch id="show-vessels" checked={showVessels} onCheckedChange={setShowVessels} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="show-ports" className="text-xs">Show Ports</Label>
                          <Switch id="show-ports" checked={showPorts} onCheckedChange={setShowPorts} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="show-refineries" className="text-xs">Show Refineries</Label>
                          <Switch id="show-refineries" checked={showRefineries} onCheckedChange={setShowRefineries} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="cluster-vessels" className="text-xs">Cluster Vessels</Label>
                          <Switch id="cluster-vessels" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="show-labels" className="text-xs">Show Labels</Label>
                          <Switch id="show-labels" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="show-legend" className="text-xs">Map Legend</Label>
                          <Switch id="show-legend" checked={showLegend} onCheckedChange={setShowLegend} />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
              
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 flex-shrink-0"
                onClick={() => setShowControlPanel(false)}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Advanced Filters Panel */}
        {filterPanelOpen && (
          <div className="absolute right-14 top-2 w-[300px] bg-background/90 backdrop-blur-sm rounded-lg shadow-lg z-20 p-3">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium flex items-center gap-1">
                <Filter className="h-4 w-4" /> Advanced Filters
              </h4>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setFilterPanelOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Vessel Type</Label>
                <Select value={vesselTypeFilter} onValueChange={setVesselTypeFilter}>
                  <SelectTrigger className="h-8 mt-1 text-xs">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Oil Tanker">Oil Tankers</SelectItem>
                    <SelectItem value="Chemical Tanker">Chemical Tankers</SelectItem>
                    <SelectItem value="LNG Carrier">LNG Carriers</SelectItem>
                    <SelectItem value="Cargo">Cargo Vessels</SelectItem>
                    <SelectItem value="Container">Container Ships</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs">Port Type</Label>
                <Select value={portTypeFilter} onValueChange={setPortTypeFilter}>
                  <SelectTrigger className="h-8 mt-1 text-xs">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="oil">Oil Terminals</SelectItem>
                    <SelectItem value="lng">LNG Terminals</SelectItem>
                    <SelectItem value="container">Container Ports</SelectItem>
                    <SelectItem value="cruise">Cruise Terminals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs">Vessel Activity</Label>
                <Select defaultValue="all">
                  <SelectTrigger className="h-8 mt-1 text-xs">
                    <SelectValue placeholder="Select activity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activities</SelectItem>
                    <SelectItem value="underway">Underway</SelectItem>
                    <SelectItem value="anchored">Anchored</SelectItem>
                    <SelectItem value="moored">Moored</SelectItem>
                    <SelectItem value="loading">Loading/Unloading</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs">Vessel Flag</Label>
                <Select defaultValue="all">
                  <SelectTrigger className="h-8 mt-1 text-xs">
                    <SelectValue placeholder="Select flag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Flags</SelectItem>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="PA">Panama</SelectItem>
                    <SelectItem value="LR">Liberia</SelectItem>
                    <SelectItem value="MH">Marshall Islands</SelectItem>
                    <SelectItem value="SG">Singapore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs mb-1 block">Speed Range (knots)</Label>
                <Slider 
                  defaultValue={[0, 30]} 
                  max={30} 
                  min={0} 
                  step={1}
                  className="mt-2" 
                />
                <div className="flex justify-between text-xs mt-1">
                  <span>0 kn</span>
                  <span>30 kn</span>
                </div>
              </div>
              
              <div className="pt-2 flex justify-end space-x-2">
                <Button variant="outline" size="sm" className="text-xs h-7">Reset</Button>
                <Button size="sm" className="text-xs h-7">Apply Filters</Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Map Legend - Bottom left */}
        {showLegend && (
          <div className="absolute bottom-10 left-2 bg-background/90 backdrop-blur-sm p-2 rounded-lg shadow-md z-20">
            <div className="text-xs font-medium mb-1.5">Map Legend</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-orange-500 mr-1.5"></div>
                <span>Oil Tanker</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-1.5"></div>
                <span>Port</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-1.5"></div>
                <span>Cargo Ship</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-1.5"></div>
                <span>Refinery</span>
              </div>
            </div>
          </div>
        )}
        
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
              {/* Map will auto-center */}
              
              {/* Base map layers - Dynamic based on selected style */}
              {mapStyle === 'standard' && (
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              )}
              
              {mapStyle === 'dark' && (
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
              )}
              
              {mapStyle === 'satellite' && (
                <TileLayer
                  attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              )}
              
              {mapStyle === 'nautical' && (
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              )}
              
              {mapStyle === 'terrain' && (
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
              )}
              
              {/* Ocean tile layer - Show on nautical style or standard */}
              {(mapStyle === 'nautical' || mapStyle === 'standard') && (
                <TileLayer
                  attribution='&copy; <a href="https://openseamap.org">OpenSeaMap</a> contributors'
                  url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
                  zIndex={10}
                />
              )}
              
              {/* Vessels Layer */}
              {showVessels && (
                <LayerGroup>
                  {filteredVessels.map((vessel) => {
                    if (!vessel.currentLat || !vessel.currentLng) return null;
                    return (
                      <Marker
                        key={vessel.id}
                        position={[parseFloat(vessel.currentLat), parseFloat(vessel.currentLng)] as LatLngExpression}
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
                      position={[parseFloat(refinery.lat), parseFloat(refinery.lng)] as LatLngExpression}
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
                      position={[parseFloat(port.lat), parseFloat(port.lng)] as LatLngExpression}
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