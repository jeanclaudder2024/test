import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { 
  MapContainer, 
  TileLayer, 
  ZoomControl,
  ScaleControl,
  useMap,
  Polyline,
  LayersControl
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { Vessel, Refinery, Port } from '@shared/schema';
import { useVesselWebSocket } from '@/hooks/useVesselWebSocket';
import { useMaritimeData } from '@/hooks/useMaritimeData';
import { 
  OptimizedVesselLayer, 
  OptimizedRefineryLayer, 
  OptimizedPortLayer 
} from './OptimizedMarkerLayer';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Loader2, 
  Ship, 
  Factory, 
  Anchor as AnchorIcon, 
  Navigation,
  Search,
  Filter,
  Layers,
  Map,
  Eye,
  EyeOff,
  RefreshCw,
  Calendar,
  AlertCircle,
  ArrowRight,
  XCircle,
  Globe,
  MapPin,
  Zap,
  Info
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

// Map tile layer URLs
const MAP_STYLES = {
  'osm-light': {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    name: 'Light',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    className: 'light-map'
  },
  'carto-dark': {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    name: 'Dark',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
    className: 'dark-map'
  },
  'esri-satellite': {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    name: 'Satellite',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
    className: 'satellite-map'
  },
  'stamen-terrain': {
    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
    name: 'Terrain',
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
    className: 'terrain-map'
  },
  'nautical': {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', // Replacement for actual nautical charts
    name: 'Nautical',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    className: 'nautical-map'
  }
};

// Fix Leaflet icon issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41], 
  popupAnchor: [0, -41] 
});

L.Marker.prototype.options.icon = DefaultIcon;

// MapControl component for displaying info cards and controls
const MapControl = ({ position, children }: { position: 'topleft' | 'topright' | 'bottomleft' | 'bottomright', children: React.ReactNode }) => {
  const map = useMap();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create control container
    const container = L.DomUtil.create('div', `leaflet-control leaflet-bar leaflet-control-${position}`);
    
    // Create control
    const mapControl = L.Control.extend({
      options: {
        position
      },
      onAdd: function() {
        return container;
      }
    });
    
    const control = new mapControl();
    control.addTo(map);
    
    // Disable map interactions when interacting with controls
    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.disableScrollPropagation(container);
    
    // Set container for portal
    setPortalContainer(container);
    containerRef.current = container;
    
    return () => {
      control.remove();
      setPortalContainer(null);
    };
  }, [map, position]);

  return portalContainer ? ReactDOM.createPortal(children, portalContainer) : null;
};

interface EnhancedVesselMapProps {
  fullScreen?: boolean;
  initialRegion?: string;
  themeMode?: 'light' | 'dark';
}

const EnhancedVesselMap: React.FC<EnhancedVesselMapProps> = ({ 
  fullScreen = true,
  initialRegion = 'global',
  themeMode = 'dark'
}) => {
  // State for tracking map configuration
  const [mapStyle, setMapStyle] = useState<string>(themeMode === 'dark' ? 'carto-dark' : 'osm-light');
  const [selectedRegion, setSelectedRegion] = useState<string>(initialRegion);
  const [mapCenter, setMapCenter] = useState<[number, number]>([25, 0]);
  const [mapZoom, setMapZoom] = useState(3);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [sidebarContent, setSidebarContent] = useState<'details' | 'filter' | 'settings'>('details');
  
  // Entity selection state
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [selectedRefinery, setSelectedRefinery] = useState<Refinery | null>(null);
  const [selectedPort, setSelectedPort] = useState<Port | null>(null);
  
  // Filtering state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [vesselTypeFilter, setVesselTypeFilter] = useState<string>('all');
  const [showRefineries, setShowRefineries] = useState<boolean>(true);
  const [showPorts, setShowPorts] = useState<boolean>(true);
  const [showVessels, setShowVessels] = useState<boolean>(true);
  const [showVesselRoutes, setShowVesselRoutes] = useState<boolean>(false);
  const [vesselsWithRoutes, setVesselsWithRoutes] = useState<Record<number, boolean>>({});
  
  // Statistics state
  const [stats, setStats] = useState<{
    vessels: number;
    activeVessels: number;
    refineries: number;
    ports: number;
    tankerCount: number;
    crudeOilCount: number;
    totalCargoVolume: number;
  }>({
    vessels: 0,
    activeVessels: 0,
    refineries: 0,
    ports: 0,
    tankerCount: 0,
    crudeOilCount: 0,
    totalCargoVolume: 0
  });
  
  // Use WebSocket for real-time vessel data
  const { 
    vessels, 
    connected: wsConnected, 
    lastUpdated,
    loading: vesselsLoading
  } = useVesselWebSocket({
    region: selectedRegion,
    loadAllVessels: true,
    trackPortProximity: true,
    proximityRadius: 50
  });
  
  // Use maritime data hook for static infrastructure
  const {
    refineries,
    ports,
    loading: infrastructureLoading
  } = useMaritimeData({
    region: selectedRegion
  });
  
  // Filter vessels based on search term and vessel type
  const filteredVessels = useMemo(() => {
    console.log('Vessels received in EnhancedVesselMap:', vessels ? vessels.length : 0, 'vessels');
    if (!vessels || vessels.length === 0) {
      console.warn('No vessels data available to filter');
      return [];
    }
    
    console.log('Sample vessel data:', vessels[0]);
    
    return vessels.filter(vessel => {
      // Ensure we have valid coordinates
      const hasValidCoordinates = 
        vessel.currentLat != null && vessel.currentLng != null && 
        !isNaN(parseFloat(vessel.currentLat.toString())) && 
        !isNaN(parseFloat(vessel.currentLng.toString()));
      
      // Log if coordinates are missing
      if (!hasValidCoordinates) {
        console.warn('Vessel missing valid coordinates:', vessel.name, vessel.id);
        return false;
      }
      
      // Filter by search term
      const matchesSearch = 
        !searchTerm || 
        vessel.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vessel.imo?.toString().includes(searchTerm) ||
        vessel.mmsi?.toString().includes(searchTerm) ||
        vessel.flag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vessel.vesselType?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by vessel type
      const matchesType = 
        vesselTypeFilter === 'all' || 
        (vessel.vesselType && vessel.vesselType.toLowerCase().includes(vesselTypeFilter.toLowerCase()));
      
      return hasValidCoordinates && matchesSearch && matchesType;
    });
  }, [vessels, searchTerm, vesselTypeFilter]);
  
  // Calculate statistics whenever data changes
  useEffect(() => {
    const activeVessels = vessels.filter(v => {
      try {
        const metadata = v.metadata ? JSON.parse(v.metadata) : null;
        return metadata && metadata.speed > 0;
      } catch (e) {
        return false;
      }
    });
    
    const tankerCount = vessels.filter(v => v.vesselType?.toLowerCase().includes('tanker')).length;
    const crudeOilCount = vessels.filter(v => v.vesselType?.toLowerCase().includes('crude')).length;
    let totalCargoVolume = 0;
    
    vessels.forEach(v => {
      if (v.cargoCapacity) {
        totalCargoVolume += parseInt(v.cargoCapacity.toString());
      }
    });
    
    setStats({
      vessels: vessels.length,
      activeVessels: activeVessels.length,
      refineries: refineries.length,
      ports: ports.length,
      tankerCount,
      crudeOilCount,
      totalCargoVolume
    });
  }, [vessels, refineries, ports]);
  
  // Handle entity selection
  const handleVesselClick = (vessel: Vessel) => {
    setSelectedVessel(vessel);
    setSelectedRefinery(null);
    setSelectedPort(null);
    setShowSidebar(true);
    setSidebarContent('details');
  };
  
  const handleRefineryClick = (refinery: Refinery) => {
    setSelectedRefinery(refinery);
    setSelectedVessel(null);
    setSelectedPort(null);
    setShowSidebar(true);
    setSidebarContent('details');
  };
  
  const handlePortClick = (port: Port) => {
    setSelectedPort(port);
    setSelectedVessel(null);
    setSelectedRefinery(null);
    setShowSidebar(true);
    setSidebarContent('details');
  };
  
  // Clear selection
  const clearSelection = () => {
    setSelectedVessel(null);
    setSelectedRefinery(null);
    setSelectedPort(null);
  };
  
  // Format metadata for display
  const formatVesselMetadata = (vessel: Vessel) => {
    let metadata = {
      mmsi: vessel.mmsi,
      imo: vessel.imo,
      heading: 0,
      course: 0,
      speed: 0,
      status: 'Unknown',
      lastPositionTime: new Date().toISOString()
    };
    
    try {
      if (vessel.metadata) {
        const parsedMetadata = JSON.parse(vessel.metadata);
        metadata = { ...metadata, ...parsedMetadata };
      }
    } catch (e) {
      console.error('Failed to parse vessel metadata:', e);
    }
    
    // Format the timestamp
    let formattedTime = 'Unknown';
    try {
      if (metadata.lastPositionTime) {
        formattedTime = new Date(metadata.lastPositionTime).toLocaleString();
      }
    } catch (e) {
      console.error('Error formatting time:', e);
    }
    
    return (
      <div className="space-y-3">
        <div className="bg-primary/10 p-3 rounded-md border border-primary/20">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Ship className="h-5 w-5 text-primary" />
            {vessel.name}
          </h3>
          <p className="text-sm text-muted-foreground">{vessel.vesselType || 'Unknown vessel type'}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="font-medium">IMO:</div>
          <div>{vessel.imo || 'N/A'}</div>
          
          <div className="font-medium">MMSI:</div>
          <div>{vessel.mmsi || 'N/A'}</div>
          
          <div className="font-medium">Flag:</div>
          <div>{vessel.flag || 'N/A'}</div>
          
          <div className="font-medium">Speed:</div>
          <div>{metadata.speed} knots</div>
          
          <div className="font-medium">Heading:</div>
          <div>{metadata.heading}°</div>
          
          <div className="font-medium">Status:</div>
          <div>{metadata.status}</div>
          
          <div className="font-medium">Last Update:</div>
          <div>{formattedTime}</div>
          
          {vessel.cargoType && (
            <>
              <div className="font-medium">Cargo:</div>
              <div>{vessel.cargoType}</div>
            </>
          )}
          
          {vessel.cargoCapacity && (
            <>
              <div className="font-medium">Capacity:</div>
              <div>{parseInt(vessel.cargoCapacity.toString()).toLocaleString()} DWT</div>
            </>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Show Vessel Route</span>
            <Switch 
              checked={!!vesselsWithRoutes[vessel.id]}
              onCheckedChange={(checked) => {
                setVesselsWithRoutes(prev => ({
                  ...prev,
                  [vessel.id]: checked
                }));
              }}
            />
          </div>
          
          <Button 
            size="sm"
            className="w-full mt-2"
            onClick={() => window.open(`/vessels/${vessel.id}`, '_blank')}
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            View Details Page
          </Button>
        </div>
      </div>
    );
  };
  
  // Format refinery details for display
  const formatRefineryDetails = (refinery: Refinery) => {
    return (
      <div className="space-y-3">
        <div className="bg-destructive/10 p-3 rounded-md border border-destructive/20">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Factory className="h-5 w-5 text-destructive" />
            {refinery.name}
          </h3>
          <p className="text-sm text-muted-foreground">{refinery.country} | {refinery.region}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="font-medium">Operator:</div>
          <div>{refinery.operator || 'N/A'}</div>
          
          <div className="font-medium">Capacity:</div>
          <div>{refinery.capacity ? `${refinery.capacity.toLocaleString()} bpd` : 'N/A'}</div>
          
          <div className="font-medium">Status:</div>
          <div>
            <Badge className={refinery.status === 'operational' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
              {refinery.status || 'Unknown'}
            </Badge>
          </div>
          
          <div className="font-medium">Coordinates:</div>
          <div>{`${typeof refinery.lat === 'number' ? refinery.lat.toFixed(4) : parseFloat(refinery.lat).toFixed(4)}, ${typeof refinery.lng === 'number' ? refinery.lng.toFixed(4) : parseFloat(refinery.lng).toFixed(4)}`}</div>
        </div>
        
        {refinery.description && (
          <div>
            <h4 className="text-sm font-medium mb-1">Description:</h4>
            <p className="text-xs text-muted-foreground">
              {refinery.description.length > 200 
                ? `${refinery.description.substring(0, 200)}...` 
                : refinery.description}
            </p>
          </div>
        )}
        
        <Button 
          size="sm"
          className="w-full mt-2"
          onClick={() => window.open(`/refineries/${refinery.id}`, '_blank')}
        >
          <ArrowRight className="h-4 w-4 mr-2" />
          View Details Page
        </Button>
      </div>
    );
  };
  
  // Format port details for display
  const formatPortDetails = (port: Port) => {
    return (
      <div className="space-y-3">
        <div className="bg-blue-500/10 p-3 rounded-md border border-blue-500/20">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <AnchorIcon className="h-5 w-5 text-blue-500" />
            {port.name}
          </h3>
          <p className="text-sm text-muted-foreground">{port.country} | {port.region}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="font-medium">Type:</div>
          <div>{port.type || 'N/A'}</div>
          
          <div className="font-medium">Coordinates:</div>
          <div>{`${typeof port.lat === 'number' ? port.lat.toFixed(4) : parseFloat(port.lat).toFixed(4)}, ${typeof port.lng === 'number' ? port.lng.toFixed(4) : parseFloat(port.lng).toFixed(4)}`}</div>
          
          <div className="font-medium">Status:</div>
          <div>
            <Badge className="bg-blue-100 text-blue-800">
              {port.status || 'Operational'}
            </Badge>
          </div>
          
          <div className="font-medium">Capacity:</div>
          <div>{port.capacity ? `${port.capacity.toLocaleString()} TEU` : 'N/A'}</div>
        </div>
        
        {port.description && (
          <div>
            <h4 className="text-sm font-medium mb-1">Description:</h4>
            <p className="text-xs text-muted-foreground">
              {port.description.length > 200 
                ? `${port.description.substring(0, 200)}...` 
                : port.description}
            </p>
          </div>
        )}
        
        <Button 
          size="sm"
          className="w-full mt-2"
          onClick={() => window.open(`/ports/${port.id}`, '_blank')}
        >
          <ArrowRight className="h-4 w-4 mr-2" />
          View Details Page
        </Button>
      </div>
    );
  };
  
  // Vessel type filter options
  const vesselTypeOptions = [
    { value: 'all', label: 'All Vessel Types' },
    { value: 'crude', label: 'Crude Oil Tankers' },
    { value: 'product', label: 'Product Tankers' },
    { value: 'chemical', label: 'Chemical Tankers' },
    { value: 'lng', label: 'LNG Carriers' },
    { value: 'lpg', label: 'LPG Carriers' },
  ];
  
  // Region filter options
  const regionOptions = [
    { value: 'global', label: 'Global (All Regions)' },
    { value: 'north-america', label: 'North America' },
    { value: 'south-america', label: 'South America' },
    { value: 'europe', label: 'Europe' },
    { value: 'asia-pacific', label: 'Asia-Pacific' },
    { value: 'middle-east', label: 'Middle East' },
    { value: 'africa', label: 'Africa' },
  ];
  
  // Filter content for sidebar
  const renderFilterContent = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Search & Filter</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search vessels, ports, refineries..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1.5 h-7 w-7 p-0"
              onClick={() => setSearchTerm('')}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="vesselType">Vessel Type</Label>
        <Select 
          value={vesselTypeFilter} 
          onValueChange={setVesselTypeFilter}
        >
          <SelectTrigger id="vesselType">
            <SelectValue placeholder="Select vessel type" />
          </SelectTrigger>
          <SelectContent>
            {vesselTypeOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="region">Region</Label>
        <Select 
          value={selectedRegion} 
          onValueChange={setSelectedRegion}
        >
          <SelectTrigger id="region">
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent>
            {regionOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Separator />
      
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Map Layers</h3>
        
        <div className="flex items-center justify-between">
          <Label 
            htmlFor="toggle-vessels"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Ship className="h-4 w-4 text-primary" />
            <span>Show Vessels</span>
          </Label>
          <Switch 
            id="toggle-vessels"
            checked={showVessels}
            onCheckedChange={setShowVessels}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label 
            htmlFor="toggle-refineries"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Factory className="h-4 w-4 text-destructive" />
            <span>Show Refineries</span>
          </Label>
          <Switch 
            id="toggle-refineries"
            checked={showRefineries}
            onCheckedChange={setShowRefineries}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label 
            htmlFor="toggle-ports"
            className="flex items-center gap-2 cursor-pointer"
          >
            <AnchorIcon className="h-4 w-4 text-blue-500" />
            <span>Show Ports</span>
          </Label>
          <Switch 
            id="toggle-ports"
            checked={showPorts}
            onCheckedChange={setShowPorts}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label 
            htmlFor="toggle-routes"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Navigation className="h-4 w-4 text-amber-500" />
            <span>Show All Routes</span>
          </Label>
          <Switch 
            id="toggle-routes"
            checked={showVesselRoutes}
            onCheckedChange={setShowVesselRoutes}
          />
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Map Style</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(MAP_STYLES).map(([id, style]) => (
            <Button
              key={id}
              variant={mapStyle === id ? "default" : "outline"}
              size="sm"
              className={cn(
                "flex items-center justify-start h-auto py-2",
                mapStyle === id && "border-primary"
              )}
              onClick={() => setMapStyle(id)}
            >
              <Map className="h-4 w-4 mr-2" />
              {style.name}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="mt-5">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => {
            setSearchTerm('');
            setVesselTypeFilter('all');
            setShowVessels(true);
            setShowRefineries(true);
            setShowPorts(true);
            setShowVesselRoutes(false);
            setVesselsWithRoutes({});
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset All Filters
        </Button>
      </div>
    </div>
  );
  
  // Settings content for sidebar
  const renderSettingsContent = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-2">Map Settings</h3>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Map Style</h4>
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(MAP_STYLES).map(([id, style]) => (
            <Button
              key={id}
              variant={mapStyle === id ? "default" : "outline"}
              size="sm"
              className={cn(
                "flex items-center justify-start h-auto py-2",
                mapStyle === id && "border-primary"
              )}
              onClick={() => setMapStyle(id)}
            >
              <Map className="h-4 w-4 mr-2" />
              {style.name}
            </Button>
          ))}
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Performance Settings</h4>
        
        <div className="flex items-center justify-between">
          <Label 
            htmlFor="toggle-clustering"
            className="flex items-center gap-2 cursor-pointer text-sm"
          >
            <Layers className="h-4 w-4" />
            <span>Enable Marker Clustering</span>
          </Label>
          <Switch 
            id="toggle-clustering"
            checked={true}
            onCheckedChange={() => {}}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label 
            htmlFor="toggle-animations"
            className="flex items-center gap-2 cursor-pointer text-sm"
          >
            <Zap className="h-4 w-4" />
            <span>Enable Animations</span>
          </Label>
          <Switch 
            id="toggle-animations"
            checked={true}
            onCheckedChange={() => {}}
          />
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium mb-1">Statistics</h4>
        <Card className="bg-card/50">
          <CardContent className="p-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vessels:</span>
              <span className="font-medium">{stats.vessels}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Vessels:</span>
              <span className="font-medium">{stats.activeVessels}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Refineries:</span>
              <span className="font-medium">{stats.refineries}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ports:</span>
              <span className="font-medium">{stats.ports}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Cargo:</span>
              <span className="font-medium">{stats.totalCargoVolume.toLocaleString()} DWT</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between items-center text-xs text-muted-foreground mt-6">
        <div className="flex items-center gap-1">
          <div className={wsConnected ? "h-2 w-2 bg-green-500 rounded-full" : "h-2 w-2 bg-red-500 rounded-full"}></div>
          <span>{wsConnected ? "Connected" : "Disconnected"}</span>
        </div>
        <div>
          {lastUpdated && `Last update: ${new Date(lastUpdated).toLocaleTimeString()}`}
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn(
      "relative rounded-lg overflow-hidden border border-border",
      fullScreen ? "h-[calc(100vh-4rem)]" : "h-[600px]"
    )}>
      {/* Loading overlay */}
      {(vesselsLoading || infrastructureLoading) && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading maritime data...</p>
          </div>
        </div>
      )}
      
      {/* Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        minZoom={2}
        maxZoom={18}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        attributionControl={false}
        maxBounds={[[-85, -180], [85, 180]]}
        preferCanvas={true}
      >
        {/* Selected map style */}
        <TileLayer
          url={MAP_STYLES[mapStyle].url}
          attribution={MAP_STYLES[mapStyle].attribution}
          maxZoom={MAP_STYLES[mapStyle].maxZoom}
          className={MAP_STYLES[mapStyle].className}
        />
        
        {/* Controls */}
        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" />
        
        {/* Vessel markers */}
        {showVessels && (
          <OptimizedVesselLayer
            vessels={filteredVessels}
            onVesselSelect={handleVesselClick}
            vesselsWithRoutes={showVesselRoutes ? filteredVessels.reduce((acc, v) => ({ ...acc, [v.id]: true }), {}) : vesselsWithRoutes}
            setVesselsWithRoutes={setVesselsWithRoutes}
          />
        )}
        
        {/* Refinery markers */}
        {showRefineries && (
          <OptimizedRefineryLayer
            refineries={refineries}
            onRefinerySelect={handleRefineryClick}
          />
        )}
        
        {/* Port markers */}
        {showPorts && (
          <OptimizedPortLayer
            ports={ports}
            onPortSelect={handlePortClick}
          />
        )}
        
        {/* Top left controls */}
        <MapControl position="topleft">
          <div className="flex flex-col gap-2">
            {/* Search button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={sidebarContent === 'filter' && showSidebar ? "default" : "outline"} 
                    size="icon"
                    className="h-10 w-10 bg-card hover:bg-card/90 shadow-md"
                    onClick={() => {
                      setSidebarContent('filter');
                      setShowSidebar(!showSidebar || sidebarContent !== 'filter');
                    }}
                  >
                    <Filter className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Search & Filter</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Settings button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={sidebarContent === 'settings' && showSidebar ? "default" : "outline"} 
                    size="icon"
                    className="h-10 w-10 bg-card hover:bg-card/90 shadow-md"
                    onClick={() => {
                      setSidebarContent('settings');
                      setShowSidebar(!showSidebar || sidebarContent !== 'settings');
                    }}
                  >
                    <Layers className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Map Settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </MapControl>
        
        {/* Top right statistics/status indicators */}
        <MapControl position="topright">
          <Card className="w-auto bg-card/90 backdrop-blur-sm shadow-md">
            <CardContent className="p-3 flex items-center gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <Ship className="h-4 w-4 text-primary" />
                      <span>{stats.vessels}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Active Vessels</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <Factory className="h-4 w-4 text-destructive" />
                      <span>{stats.refineries}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refineries</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <AnchorIcon className="h-4 w-4 text-blue-500" />
                      <span>{stats.ports}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ports</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </CardContent>
          </Card>
        </MapControl>
      </MapContainer>
      
      {/* Side panel for details, filters, etc. */}
      {showSidebar && (
        <div className="absolute top-0 right-0 h-full w-80 bg-card/95 backdrop-blur-sm z-10 border-l border-border overflow-hidden shadow-lg transition-all duration-300">
          <div className="p-4 h-full overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <Tabs value={sidebarContent} onValueChange={(v) => setSidebarContent(v as any)}>
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="details" disabled={!selectedVessel && !selectedRefinery && !selectedPort}>
                    <Info className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="filter">
                    <Filter className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="settings">
                    <Layers className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(false)}
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="mt-2">
              {sidebarContent === 'details' && (
                <>
                  {selectedVessel && formatVesselMetadata(selectedVessel)}
                  {selectedRefinery && formatRefineryDetails(selectedRefinery)}
                  {selectedPort && formatPortDetails(selectedPort)}
                </>
              )}
              
              {sidebarContent === 'filter' && renderFilterContent()}
              
              {sidebarContent === 'settings' && renderSettingsContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedVesselMap;