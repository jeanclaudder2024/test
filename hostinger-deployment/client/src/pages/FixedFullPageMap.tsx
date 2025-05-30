import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayerGroup, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Ship, 
  Anchor, 
  Factory, 
  MapIcon, 
  RefreshCw, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Globe, 
  Search, 
  X, 
  AlertCircle, 
  Info, 
  ArrowUpRight,
  Maximize, 
  Minimize,
  Navigation,
  Pin,
  Route
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
  departurePort?: string;
  destinationPort?: string;
  eta?: string;
}

// Port interface with essential properties
interface Port extends MapItem {
  country: string;
  region: string;
  type: string;
  status?: string;
  capacity?: number;
}

// Refinery interface with essential properties
interface Refinery extends MapItem {
  country: string;
  region: string;
  operator?: string;
  capacity?: number;
  status?: string;
}

// Vessel type categories for filtering
const vesselTypeCategories = [
  'Crude Oil Tanker',
  'Product Tanker',
  'Chemical Tanker',
  'LNG Carrier',
  'LPG Carrier',
  'Bulk Carrier',
  'Container Ship',
  'Cargo',
  'Fishing',
  'Passenger'
];

// Region coordinates and zoom levels for quick navigation
const regionCoordinates: Record<string, { center: [number, number], zoom: number }> = {
  'global': { center: [20, 0], zoom: 2 },
  'North America': { center: [40, -100], zoom: 4 },
  'Europe': { center: [50, 10], zoom: 4 },
  'Asia': { center: [30, 100], zoom: 3 },
  'Middle East': { center: [25, 50], zoom: 5 },
  'Africa': { center: [0, 20], zoom: 3 },
  'South America': { center: [-20, -60], zoom: 3 },
  'Australia': { center: [-25, 135], zoom: 4 },
};

// Helper component to update the map center (used after loading new data)
function MapCenterUpdater({ center, zoom }: { center: [number, number], zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (zoom) {
      map.setView(center, zoom);
    } else {
      map.setView(center, map.getZoom());
    }
  }, [center, zoom, map]);
  return null;
}

// Custom control to handle fullscreen
function FullscreenControl() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };
  
  return (
    <div className="absolute top-4 right-4 z-[1000]">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="secondary" 
              size="icon" 
              className="h-8 w-8 bg-background/90 backdrop-blur-sm shadow-lg hover:bg-background"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

// Component to handle search
function SearchPanel({ 
  onSearch, 
  items,
  onLocationSelect
}: { 
  onSearch: (result: any) => void,
  items: { vessels: Vessel[], ports: Port[], refineries: Refinery[] },
  onLocationSelect: (item: any, type: 'vessel' | 'port' | 'refinery') => void
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  // Combined search function
  const handleSearch = (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    const lowerTerm = term.toLowerCase();
    
    // Search in vessels
    const vesselResults = items.vessels
      .filter((v) => v.name.toLowerCase().includes(lowerTerm) || 
                  v.imo.toLowerCase().includes(lowerTerm) ||
                  v.mmsi.toLowerCase().includes(lowerTerm))
      .slice(0, 5)
      .map(v => ({ ...v, type: 'vessel' }));
    
    // Search in ports
    const portResults = items.ports
      .filter(p => p.name.toLowerCase().includes(lowerTerm) ||
                 p.country.toLowerCase().includes(lowerTerm))
      .slice(0, 3)
      .map(p => ({ ...p, type: 'port' }));
    
    // Search in refineries
    const refineryResults = items.refineries
      .filter(r => r.name.toLowerCase().includes(lowerTerm) || 
                  r.country.toLowerCase().includes(lowerTerm) ||
                  (r.operator && r.operator.toLowerCase().includes(lowerTerm)))
      .slice(0, 3)
      .map(r => ({ ...r, type: 'refinery' }));
    
    // Combine results
    const combinedResults = [...vesselResults, ...portResults, ...refineryResults].slice(0, 10);
    setSearchResults(combinedResults);
    setShowResults(combinedResults.length > 0);
  };
  
  const handleResultClick = (result: any) => {
    onLocationSelect(result, result.type);
    setShowResults(false);
    setSearchTerm('');
  };
  
  return (
    <div className="absolute top-4 left-4 z-[1000] w-full max-w-sm">
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search vessels, ports, refineries..."
            className="pl-9 pr-10 bg-background/90 backdrop-blur-sm shadow-lg border-0"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              handleSearch(e.target.value);
            }}
            onFocus={() => {
              if (searchResults.length > 0) setShowResults(true);
            }}
          />
          {searchTerm && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-0 h-8 w-8" 
              onClick={() => {
                setSearchTerm('');
                setShowResults(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {showResults && (
          <Card className="absolute top-full left-0 w-full mt-1 p-2 shadow-lg max-h-64 overflow-hidden">
            <ScrollArea className="h-full max-h-60">
              {searchResults.length > 0 ? (
                <div className="space-y-1 py-1">
                  {searchResults.map((result, index) => {
                    // Determine icon based on type
                    let Icon = Ship;
                    let color = "text-primary";
                    
                    if (result.type === 'port') {
                      Icon = Anchor;
                      color = "text-blue-500";
                    } else if (result.type === 'refinery') {
                      Icon = Factory;
                      color = "text-red-500";
                    }
                    
                    return (
                      <div 
                        key={`${result.type}-${result.id}`}
                        className="flex items-center p-2 hover:bg-muted rounded-md cursor-pointer"
                        onClick={() => handleResultClick(result)}
                      >
                        <div className={`mr-2 ${color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm font-medium">{result.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {result.type === 'vessel' ? `${result.vesselType} • ${result.flag}` : `${result.country} • ${result.region}`}
                          </p>
                        </div>
                        <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                searchTerm && (
                  <div className="py-4 text-center text-muted-foreground">
                    <AlertCircle className="h-5 w-5 mx-auto mb-1" />
                    <p className="text-sm">No results found</p>
                  </div>
                )
              )}
            </ScrollArea>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function FixedFullPageMap() {
  // State for map data
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [refineries, setRefineries] = useState<Refinery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dataProgress, setDataProgress] = useState<number>(0);

  // Filter states
  const [showVessels, setShowVessels] = useState<boolean>(true);
  const [showPorts, setShowPorts] = useState<boolean>(true);
  const [showRefineries, setShowRefineries] = useState<boolean>(true);
  const [filtersPanelOpen, setFiltersPanelOpen] = useState<boolean>(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('global');
  const [mapCenter, setMapCenter] = useState<[number, number]>(regionCoordinates.global.center);
  const [mapZoom, setMapZoom] = useState<number | undefined>(regionCoordinates.global.zoom);
  const [selectedVesselTypes, setSelectedVesselTypes] = useState<string[]>([]);
  const [mapMode, setMapMode] = useState<'default' | 'satellite'>('default');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<'vessel' | 'port' | 'refinery' | null>(null);
  
  const [infoCardOpen, setInfoCardOpen] = useState<boolean>(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState<boolean>(true);
  
  const mapRef = useRef<L.Map | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  
  // Load data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setDataProgress(10);
      
      try {
        // Fetch vessels
        setDataProgress(20);
        const vesselsResponse = await fetch('/api/vessels/polling');
        const vesselsData = await vesselsResponse.json();
        setDataProgress(40);
        
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
            cargoCapacity: v.cargoCapacity,
            departurePort: v.departurePort,
            destinationPort: v.destinationPort,
            eta: v.eta
          }));
        
        setVessels(processedVessels);
        setDataProgress(60);
        
        // Fetch ports
        const portsResponse = await fetch('/api/ports');
        const portsData = await portsResponse.json();
        setDataProgress(70);
        
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
            status: p.status || 'Active',
            capacity: p.capacity
          }));
        
        setPorts(processedPorts);
        setDataProgress(85);
        
        // Fetch refineries
        const refineriesResponse = await fetch('/api/refineries');
        const refineriesData = await refineriesResponse.json();
        setDataProgress(95);
        
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
        setDataProgress(100);
        
        toast({
          title: "Map Data Loaded Successfully",
          description: `Loaded ${processedVessels.length.toLocaleString()} vessels, ${processedPorts.length.toLocaleString()} ports, and ${processedRefineries.length.toLocaleString()} refineries.`,
          duration: 3000,
          variant: "default"
        });
        
      } catch (err) {
        console.error('Error fetching map data:', err);
        setError('Failed to load map data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Set up polling for vessel updates
    if (realTimeUpdates) {
      timerRef.current = setInterval(() => {
        if (!loading) {
          updateVessels();
        }
      }, 30000); // Update vessels every 30 seconds
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [realTimeUpdates]);
  
  // Effect to toggle real-time updates
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (realTimeUpdates) {
      // Update every 5 minutes (300000 milliseconds)
      timerRef.current = setInterval(() => {
        if (!loading) {
          updateVessels();
        }
      }, 300000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [realTimeUpdates, loading]);
  
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
          cargoCapacity: v.cargoCapacity,
          departurePort: v.departurePort,
          destinationPort: v.destinationPort,
          eta: v.eta
        }));
      
      setVessels(processedVessels);
      setLastUpdated(new Date());
      
      // If we have a selected vessel, update its data
      if (selectedItem && selectedItemType === 'vessel') {
        const updatedVessel = processedVessels.find(v => v.id === selectedItem.id);
        if (updatedVessel) {
          setSelectedItem(updatedVessel);
        }
      }
      
      // Show a success notification
      toast({
        title: "Map Updated",
        description: `Updated positions for ${processedVessels.length} vessels`,
        variant: "default",
        duration: 2000,
      });
      
    } catch (err) {
      console.error('Error updating vessel data:', err);
      
      // Show error toast
      toast({
        title: "Update Failed",
        description: "Could not refresh vessel positions. Retrying in 5 minutes.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };
  
  // Generate marker icons - more detailed and professional
  const getVesselIcon = (vessel: Vessel) => {
    // Determine color based on vessel type
    let primaryColor = 'rgb(var(--primary))';
    
    // Crude/product oil tankers in green
    if (vessel.vesselType.includes('Tanker') || vessel.vesselType.includes('Oil')) {
      primaryColor = '#10b981'; // emerald-500
    } 
    // Gas carriers in purple
    else if (vessel.vesselType.includes('LNG') || vessel.vesselType.includes('LPG')) {
      primaryColor = '#8b5cf6'; // violet-500
    } 
    // Container ships in blue
    else if (vessel.vesselType.includes('Container')) {
      primaryColor = '#3b82f6'; // blue-500
    }
    // Bulk carriers in orange
    else if (vessel.vesselType.includes('Bulk')) {
      primaryColor = '#f97316'; // orange-500
    }
    // Passenger vessels in pink
    else if (vessel.vesselType.includes('Passenger') || vessel.vesselType.includes('Cruise')) {
      primaryColor = '#ec4899'; // pink-500
    }
    
    // Add a direction indicator if the vessel has a status of "underway"
    const hasDirection = vessel.status?.toLowerCase().includes('underway') || 
                         vessel.status?.toLowerCase().includes('at sea');
    
    return L.divIcon({
      className: 'vessel-marker',
      html: `
        <div class="relative group">
          <div class="absolute inset-0 rounded-full opacity-25 blur-[2px] group-hover:opacity-40 transition-opacity" 
               style="background-color: ${primaryColor}"></div>
          <div class="relative w-4 h-4 rounded-full border-2 border-white shadow-lg flex items-center justify-center" 
               style="background-color: ${primaryColor}">
            ${hasDirection ? `<div class="w-0 h-0 absolute -top-3 left-1/2 -translate-x-1/2 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[4px] border-white"></div>` : ''}
          </div>
        </div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
  };
  
  const getPortIcon = (port: Port) => {
    // Different styles for different port types
    let bgColor = '#3b82f6'; // blue-500 (default)
    let icon = '⚓'; // Default anchor
    
    if (port.type?.toLowerCase().includes('oil')) {
      bgColor = '#10b981'; // emerald-500
      icon = '🛢️';
    } else if (port.type?.toLowerCase().includes('container')) {
      bgColor = '#f97316'; // orange-500
      icon = '📦';
    } else if (port.type?.toLowerCase().includes('passenger')) {
      bgColor = '#8b5cf6'; // violet-500
      icon = '🚢';
    }
    
    return L.divIcon({
      className: 'port-marker',
      html: `
        <div class="relative group">
          <div class="absolute inset-0 rounded-full opacity-30 blur-[2px] group-hover:opacity-50 transition-opacity" 
               style="background-color: ${bgColor}"></div>
          <div class="relative w-6 h-6 bg-white rounded-full border-2 shadow-lg flex items-center justify-center text-xs font-bold" 
               style="border-color: ${bgColor}; color: ${bgColor}">
            ${icon}
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };
  
  const getRefineryIcon = (refinery: Refinery) => {
    return L.divIcon({
      className: 'refinery-marker',
      html: `
        <div class="relative group">
          <div class="absolute inset-0 rounded-full opacity-30 blur-[2px] group-hover:opacity-50 transition-opacity bg-red-500"></div>
          <div class="relative w-7 h-7 bg-white rounded-full border-2 border-red-500 shadow-lg flex items-center justify-center text-red-500 text-xs font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 22h8"></path><path d="M12 11v11"></path><path d="M20 19V7l-4 4V7l-4 4V7L8 11V7L4 11v8"></path></svg>
          </div>
          <div class="absolute -bottom-5 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white text-[8px] px-1 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            ${refinery.name}
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
  };
  
  // Handle region selection
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    
    if (regionCoordinates[region]) {
      setMapCenter(regionCoordinates[region].center);
      setMapZoom(regionCoordinates[region].zoom);
    }
  };
  
  // Handle item selection from search or map click
  const handleItemSelect = (item: any, type: 'vessel' | 'port' | 'refinery') => {
    // Make sure we preserve the correct type when setting the selected item
    console.log(`Selected ${type}:`, item);
    
    // Always ensure we mark the type explicitly to avoid confusion
    const itemWithType = { ...item, itemType: type };
    
    setSelectedItem(itemWithType);
    setSelectedItemType(type);
    setInfoCardOpen(true);
    
    // Center the map on the selected item
    const lat = typeof item.lat === 'string' ? parseFloat(item.lat) : item.lat;
    const lng = typeof item.lng === 'string' ? parseFloat(item.lng) : item.lng;
    
    setMapCenter([lat, lng]);
    // Adjust zoom based on item type
    setMapZoom(type === 'vessel' ? 8 : type === 'refinery' ? 9 : 7);
    
    // Show a toast notification
    toast({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Selected`,
      description: `Now showing details for ${item.name}`,
      variant: "default",
      duration: 2000,
    });
  };
  
  // Clear selection
  const clearSelection = () => {
    setSelectedItem(null);
    setSelectedItemType(null);
    setInfoCardOpen(false);
  };
  
  // Filter vessels by type if filter is active
  const filteredVesselsByType = useMemo(() => {
    if (selectedVesselTypes.length === 0) return vessels;
    
    return vessels.filter(vessel => {
      for (const type of selectedVesselTypes) {
        if (vessel.vesselType.toLowerCase().includes(type.toLowerCase())) {
          return true;
        }
      }
      return false;
    });
  }, [vessels, selectedVesselTypes]);
  
  // Filter data by region
  const filteredVessels = useMemo(() => {
    if (selectedRegion === 'global') return filteredVesselsByType;
    
    // This is a simplification - in a real app we'd have proper region data
    // For now just filter to vessels within roughly the region's bounding box
    const { center, zoom } = regionCoordinates[selectedRegion];
    const [centerLat, centerLng] = center;
    
    // Create a rough bounding box based on zoom level
    const latRange = 180 / Math.pow(2, zoom - 1);
    const lngRange = 360 / Math.pow(2, zoom - 1);
    
    const minLat = centerLat - latRange/2;
    const maxLat = centerLat + latRange/2;
    const minLng = centerLng - lngRange/2;
    const maxLng = centerLng + lngRange/2;
    
    return filteredVesselsByType.filter(v => {
      const lat = typeof v.lat === 'string' ? parseFloat(v.lat) : v.lat;
      const lng = typeof v.lng === 'string' ? parseFloat(v.lng) : v.lng;
      
      return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
    });
  }, [filteredVesselsByType, selectedRegion]);
  
  const filteredPorts = useMemo(() => {
    if (selectedRegion === 'global') return ports;
    return ports.filter(p => p.region === selectedRegion);
  }, [ports, selectedRegion]);
  
  const filteredRefineries = useMemo(() => {
    if (selectedRegion === 'global') return refineries;
    return refineries.filter(r => r.region === selectedRegion);
  }, [refineries, selectedRegion]);
  
  // Count items by region for the statistics panel
  const regionStats = useMemo(() => {
    const stats: Record<string, { vessels: number, ports: number, refineries: number }> = {
      'global': { vessels: vessels.length, ports: ports.length, refineries: refineries.length }
    };
    
    // Initialize all region stats
    Object.keys(regionCoordinates).forEach(region => {
      if (region !== 'global') {
        stats[region] = { vessels: 0, ports: 0, refineries: 0 };
      }
    });
    
    // Count ports by region
    ports.forEach(port => {
      if (port.region && stats[port.region]) {
        stats[port.region].ports++;
      }
    });
    
    // Count refineries by region
    refineries.forEach(refinery => {
      if (refinery.region && stats[refinery.region]) {
        stats[refinery.region].refineries++;
      }
    });
    
    // Approximate vessel counts by region (since we don't have perfect region data)
    Object.entries(regionCoordinates).forEach(([region, coords]) => {
      if (region === 'global') return;
      
      const { center, zoom } = coords;
      const [centerLat, centerLng] = center;
      
      // Create a rough bounding box based on zoom level
      const latRange = 180 / Math.pow(2, zoom - 1);
      const lngRange = 360 / Math.pow(2, zoom - 1);
      
      const minLat = centerLat - latRange/2;
      const maxLat = centerLat + latRange/2;
      const minLng = centerLng - lngRange/2;
      const maxLng = centerLng + lngRange/2;
      
      // Count vessels in this rough bounding box
      vessels.forEach(vessel => {
        const lat = typeof vessel.lat === 'string' ? parseFloat(vessel.lat) : vessel.lat;
        const lng = typeof vessel.lng === 'string' ? parseFloat(vessel.lng) : vessel.lng;
        
        if (lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng) {
          stats[region].vessels++;
        }
      });
    });
    
    return stats;
  }, [vessels, ports, refineries]);
  
  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
      {/* Header with controls */}
      <div className="bg-background/95 backdrop-blur-sm p-4 shadow-md border-b z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center">
            <div className="bg-primary/10 p-2 rounded-md mr-3">
              <MapIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold flex items-center">
                Maritime Intelligence Map
                {lastUpdated && (
                  <Badge variant="outline" className="ml-3 text-xs font-normal">
                    Live
                  </Badge>
                )}
              </h1>
              <p className="text-sm text-muted-foreground">
                {selectedRegion === 'global' ? 'Global View' : selectedRegion} • 
                {lastUpdated && ` Updated: ${lastUpdated.toLocaleTimeString()}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4 flex-wrap md:flex-nowrap">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setFiltersPanelOpen(!filtersPanelOpen)}
                    className="h-9"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {filtersPanelOpen ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show or hide map elements</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-9"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        {selectedRegion === 'global' ? 'Global View' : selectedRegion}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Quickly navigate to different regions</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem onClick={() => handleRegionChange('global')}>
                  Global View
                  <Badge variant="outline" className="ml-auto">
                    {regionStats.global.vessels}
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {Object.keys(regionCoordinates)
                  .filter(r => r !== 'global')
                  .map(region => (
                    <DropdownMenuItem 
                      key={region} 
                      onClick={() => handleRegionChange(region)}
                    >
                      {region}
                      <Badge variant="outline" className="ml-auto">
                        {regionStats[region]?.vessels || 0}
                      </Badge>
                    </DropdownMenuItem>
                  ))
                }
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-9"
                      >
                        <Layers className="h-4 w-4 mr-2" />
                        Map Style
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Change the map style</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent>
                <DropdownMenuItem 
                  onClick={() => setMapMode('default')}
                  className={mapMode === 'default' ? 'bg-accent' : ''}
                >
                  Standard Map
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setMapMode('satellite')}
                  className={mapMode === 'satellite' ? 'bg-accent' : ''}
                >
                  Satellite View
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="live-updates" className="text-xs sm:text-sm">Live Updates</Label>
                    <Switch 
                      id="live-updates" 
                      checked={realTimeUpdates} 
                      onCheckedChange={setRealTimeUpdates}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enable automatic vessel position updates every 5 minutes</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={realTimeUpdates ? "ghost" : "outline"}
                    size="sm"
                    onClick={updateVessels}
                    disabled={loading}
                    className="h-9"
                  >
                    <RefreshCw className={cn(
                      "h-4 w-4 mr-2", 
                      realTimeUpdates && "animate-spin"
                    )} />
                    {realTimeUpdates ? "Updating" : "Refresh"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Manually refresh vessel positions</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {/* Filters panel */}
        {filtersPanelOpen && (
          <div className="mt-4 p-3 bg-card rounded-md shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Ship className="h-5 w-5 text-primary" />
                    <Label htmlFor="show-vessels" className="font-medium">Vessels</Label>
                  </div>
                  <Switch 
                    id="show-vessels" 
                    checked={showVessels} 
                    onCheckedChange={setShowVessels} 
                  />
                </div>
                
                {showVessels && (
                  <div className="pl-7 space-y-2">
                    <p className="text-xs text-muted-foreground mb-1">Vessel Types:</p>
                    <div className="flex flex-wrap gap-2">
                      {['Oil Tanker', 'Gas Carrier', 'Container', 'Bulk'].map(type => (
                        <Badge 
                          key={type}
                          variant={selectedVesselTypes.includes(type) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            if (selectedVesselTypes.includes(type)) {
                              setSelectedVesselTypes(selectedVesselTypes.filter(t => t !== type));
                            } else {
                              setSelectedVesselTypes([...selectedVesselTypes, type]);
                            }
                          }}
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Anchor className="h-5 w-5 text-blue-500" />
                  <Label htmlFor="show-ports" className="font-medium">Ports</Label>
                  <Badge>{ports.length.toLocaleString()}</Badge>
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
                  <Label htmlFor="show-refineries" className="font-medium">Refineries</Label>
                  <Badge>{refineries.length.toLocaleString()}</Badge>
                </div>
                <Switch 
                  id="show-refineries" 
                  checked={showRefineries} 
                  onCheckedChange={setShowRefineries} 
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Map Container */}
      <div className="flex-grow relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 z-50">
            <div className="text-center max-w-md px-6">
              <RefreshCw className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Loading Maritime Intelligence Data</p>
              <p className="text-sm text-muted-foreground mb-4">
                Fetching real-time vessel positions, port information and refinery data...
              </p>
              <Progress value={dataProgress} className="h-2 w-full max-w-xs mx-auto" />
            </div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/90 z-50">
            <Card className="p-6 max-w-md">
              <div className="flex items-center gap-3 mb-4 text-destructive">
                <AlertCircle className="h-6 w-6" />
                <h3 className="text-lg font-medium">Error Loading Map Data</h3>
              </div>
              <p className="text-muted-foreground mb-4">{error}</p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setError(null)}>Dismiss</Button>
                <Button onClick={() => window.location.reload()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Data
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <>
            <MapContainer
              center={mapCenter} 
              zoom={mapZoom || 3}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
              whenReady={(e) => {
                mapRef.current = e.target;
              }}
            >
              {/* Map controls and interaction handlers */}
              <MapCenterUpdater center={mapCenter} zoom={mapZoom} />
              <ZoomControl position="bottomright" />
              <FullscreenControl />
              
              {/* Base map tiles */}
              {mapMode === 'default' ? (
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
              ) : (
                <TileLayer
                  attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              )}
              
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
                      icon={getVesselIcon(vessel)}
                      eventHandlers={{
                        click: () => handleItemSelect(vessel, 'vessel')
                      }}
                    >
                      <Popup className="vessel-popup custom-popup">
                        <div className="p-1">
                          <h3 className="font-bold text-base">{vessel.name}</h3>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-xs">
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
                          <Button 
                            variant="link" 
                            size="sm"
                            className="p-0 h-auto text-xs mt-2"
                            onClick={() => handleItemSelect(vessel, 'vessel')}
                          >
                            View Details
                          </Button>
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
                      icon={getPortIcon(port)}
                      eventHandlers={{
                        click: () => handleItemSelect(port, 'port')
                      }}
                    >
                      <Popup className="port-popup custom-popup">
                        <div className="p-1">
                          <h3 className="font-bold text-base">{port.name}</h3>
                          <div className="grid grid-cols-1 gap-y-1 mt-2 text-xs">
                            <p><strong>Country:</strong> {port.country}</p>
                            <p><strong>Region:</strong> {port.region}</p>
                            <p><strong>Type:</strong> {port.type}</p>
                            <p><strong>Status:</strong> {port.status}</p>
                          </div>
                          <Button 
                            variant="link" 
                            size="sm"
                            className="p-0 h-auto text-xs mt-2"
                            onClick={() => handleItemSelect(port, 'port')}
                          >
                            View Details
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </LayerGroup>
              )}
              
              {/* Refineries Layer - Enhanced to be more professional */}
              {showRefineries && (
                <LayerGroup>
                  {filteredRefineries.map((refinery) => (
                    <Marker
                      key={`refinery-${refinery.id}`}
                      position={[
                        typeof refinery.lat === 'string' ? parseFloat(refinery.lat) : refinery.lat,
                        typeof refinery.lng === 'string' ? parseFloat(refinery.lng) : refinery.lng
                      ]}
                      icon={getRefineryIcon(refinery)}
                      eventHandlers={{
                        click: () => handleItemSelect(refinery, 'refinery')
                      }}
                    >
                      <Popup className="refinery-popup custom-popup">
                        <div className="p-1">
                          <h3 className="font-bold text-base flex items-center gap-1.5">
                            <Factory className="h-3.5 w-3.5 text-red-500" />
                            {refinery.name}
                          </h3>
                          <div className="grid grid-cols-1 gap-y-1 mt-2 text-xs">
                            <p><strong>Country:</strong> {refinery.country}</p>
                            <p><strong>Region:</strong> {refinery.region}</p>
                            {refinery.operator && <p><strong>Operator:</strong> {refinery.operator}</p>}
                            {refinery.capacity && (
                              <p><strong>Capacity:</strong> {refinery.capacity.toLocaleString()} BPD</p>
                            )}
                            <p><strong>Status:</strong> {refinery.status}</p>
                          </div>
                          <Button 
                            variant="link" 
                            size="sm"
                            className="p-0 h-auto text-xs mt-2"
                            onClick={() => handleItemSelect(refinery, 'refinery')}
                          >
                            View Refinery Details
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </LayerGroup>
              )}
            </MapContainer>
            
            {/* Map info panel */}
            <div className="absolute bottom-4 left-4 z-[1000]">
              <Card className="shadow-lg overflow-hidden">
                <Tabs defaultValue="summary">
                  <TabsList className="w-full rounded-none bg-muted/50">
                    <TabsTrigger value="summary" className="text-xs">Summary</TabsTrigger>
                    <TabsTrigger value="stats" className="text-xs">Statistics</TabsTrigger>
                    <TabsTrigger value="legend" className="text-xs">Legend</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="summary" className="p-3 space-y-2 min-w-[250px]">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col items-center p-2 bg-primary/5 rounded-md">
                        <div className="flex items-center gap-2 mb-1">
                          <Ship className="h-4 w-4 text-primary" />
                          <span className="text-xs font-medium">Vessels</span>
                        </div>
                        <span className="text-lg font-bold">{filteredVessels.length.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex flex-col items-center p-2 bg-blue-500/5 rounded-md">
                        <div className="flex items-center gap-2 mb-1">
                          <Anchor className="h-4 w-4 text-blue-500" />
                          <span className="text-xs font-medium">Ports</span>
                        </div>
                        <span className="text-lg font-bold">{filteredPorts.length.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex flex-col items-center p-2 bg-red-500/5 rounded-md">
                        <div className="flex items-center gap-2 mb-1">
                          <Factory className="h-4 w-4 text-red-500" />
                          <span className="text-xs font-medium">Refineries</span>
                        </div>
                        <span className="text-lg font-bold">{filteredRefineries.length.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 mb-1">
                        <Globe className="h-3 w-3" />
                        <span>Region: {selectedRegion}</span>
                      </div>
                      {lastUpdated && (
                        <div className="flex items-center gap-1">
                          <RefreshCw className="h-3 w-3" />
                          <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="stats" className="p-0">
                    <ScrollArea className="h-[150px]">
                      <div className="p-3">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left font-medium pb-2">Region</th>
                              <th className="text-right font-medium pb-2">Vessels</th>
                              <th className="text-right font-medium pb-2">Ports</th>
                              <th className="text-right font-medium pb-2">Refineries</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(regionStats).map(([region, stats]) => (
                              <tr key={region} className="border-b border-border/50 last:border-0">
                                <td className="py-2 font-medium">{region}</td>
                                <td className="py-2 text-right">{stats.vessels.toLocaleString()}</td>
                                <td className="py-2 text-right">{stats.ports.toLocaleString()}</td>
                                <td className="py-2 text-right">{stats.refineries.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="legend" className="p-3 space-y-3">
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium">Vessel Types</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-primary border border-white"></div>
                          <span className="text-xs">Standard</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-emerald-500 border border-white"></div>
                          <span className="text-xs">Oil Tanker</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-violet-500 border border-white"></div>
                          <span className="text-xs">Gas Carrier</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-blue-500 border border-white"></div>
                          <span className="text-xs">Container</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium">Infrastructure</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center">
                            <span className="text-[8px] text-blue-500">⚓</span>
                          </div>
                          <span className="text-xs">Port</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-white border-2 border-red-500 flex items-center justify-center">
                            <span className="text-[8px] text-red-500">🏭</span>
                          </div>
                          <span className="text-xs">Refinery</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </div>
            
            {/* Detail panel when an item is selected */}
            {selectedItem && selectedItemType && infoCardOpen && (
              <div className="absolute top-20 right-4 z-[1000] w-72">
                <Card className="shadow-lg overflow-hidden">
                  <div className="flex items-center justify-between p-3 bg-card border-b">
                    {selectedItemType === 'vessel' && <Ship className="h-4 w-4 text-primary" />}
                    {selectedItemType === 'port' && <Anchor className="h-4 w-4 text-blue-500" />}
                    {selectedItemType === 'refinery' && <Factory className="h-4 w-4 text-red-500" />}
                    
                    <span className="font-medium flex-grow ml-2">
                      {selectedItemType === 'vessel' ? 'Vessel Details' : 
                       selectedItemType === 'port' ? 'Port Information' : 'Refinery Information'}
                    </span>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={clearSelection}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <ScrollArea className="h-[350px]">
                    <div className="p-4">
                      <h3 className="text-lg font-bold mb-2">{selectedItem.name}</h3>
                      
                      {/* Vessel specific details */}
                      {selectedItemType === 'vessel' && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-1">
                            <Badge>{selectedItem.vesselType}</Badge>
                            <Badge variant="outline">{selectedItem.flag}</Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground">IMO Number</p>
                              <p className="font-medium">{selectedItem.imo}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">MMSI</p>
                              <p className="font-medium">{selectedItem.mmsi}</p>
                            </div>
                            {selectedItem.cargoCapacity && (
                              <div>
                                <p className="text-xs text-muted-foreground">Capacity</p>
                                <p className="font-medium">
                                  {(selectedItem.cargoCapacity/1000).toFixed(0)}k DWT
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs text-muted-foreground">Status</p>
                              <p className="font-medium">{selectedItem.status || 'Unknown'}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Pin className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Current Position</span>
                            </div>
                            <div className="bg-muted/50 p-2 rounded-md text-xs">
                              <p>Latitude: {typeof selectedItem.lat === 'string' ? 
                                parseFloat(selectedItem.lat).toFixed(6) : 
                                selectedItem.lat.toFixed(6)}
                              </p>
                              <p>Longitude: {typeof selectedItem.lng === 'string' ? 
                                parseFloat(selectedItem.lng).toFixed(6) : 
                                selectedItem.lng.toFixed(6)}
                              </p>
                            </div>
                          </div>
                          
                          {/* Journey information */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Route className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Journey</span>
                            </div>
                            <div className="bg-muted/50 p-2 rounded-md text-xs">
                              <div className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-1">
                                <span className="text-muted-foreground">From:</span>
                                <span>{selectedItem.departurePort || 'Unknown'}</span>
                                
                                <span className="text-muted-foreground">To:</span>
                                <span>{selectedItem.destinationPort || 'Unknown'}</span>
                                
                                {selectedItem.eta && (
                                  <>
                                    <span className="text-muted-foreground">ETA:</span>
                                    <span>{new Date(selectedItem.eta).toLocaleDateString()}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-2">
                            <Button size="sm" className="w-full">
                              <Navigation className="h-4 w-4 mr-2" />
                              View Full Vessel Details
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* Port specific details */}
                      {selectedItemType === 'port' && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-1">
                            <Badge>{selectedItem.type}</Badge>
                            <Badge variant="outline">{selectedItem.status}</Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-y-2 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground">Location</p>
                              <p className="font-medium">{selectedItem.country}, {selectedItem.region}</p>
                            </div>
                            {selectedItem.capacity && (
                              <div>
                                <p className="text-xs text-muted-foreground">Capacity</p>
                                <p className="font-medium">{selectedItem.capacity.toLocaleString()} TEU/day</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Pin className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Coordinates</span>
                            </div>
                            <div className="bg-muted/50 p-2 rounded-md text-xs">
                              <p>Latitude: {typeof selectedItem.lat === 'string' ? 
                                parseFloat(selectedItem.lat).toFixed(6) : 
                                selectedItem.lat.toFixed(6)}
                              </p>
                              <p>Longitude: {typeof selectedItem.lng === 'string' ? 
                                parseFloat(selectedItem.lng).toFixed(6) : 
                                selectedItem.lng.toFixed(6)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="pt-2">
                            <Button size="sm" className="w-full">
                              <Ship className="h-4 w-4 mr-2" />
                              View Vessels Near Port
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* Refinery specific details - Enhanced with improved visuals */}
                      {selectedItemType === 'refinery' && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-1">
                            <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200">Refinery</Badge>
                            <Badge variant="outline">{selectedItem.status || 'Active'}</Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-y-2 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground">Location</p>
                              <p className="font-medium">{selectedItem.country}, {selectedItem.region}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Operator</p>
                              <p className="font-medium">{selectedItem.operator || 'Unknown'}</p>
                            </div>
                            {selectedItem.capacity && (
                              <div>
                                <p className="text-xs text-muted-foreground">Refining Capacity</p>
                                <p className="font-medium">{selectedItem.capacity.toLocaleString()} BPD</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Pin className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Coordinates</span>
                            </div>
                            <div className="bg-muted/50 p-2 rounded-md text-xs">
                              <p>Latitude: {typeof selectedItem.lat === 'string' ? 
                                parseFloat(selectedItem.lat).toFixed(6) : 
                                selectedItem.lat.toFixed(6)}
                              </p>
                              <p>Longitude: {typeof selectedItem.lng === 'string' ? 
                                parseFloat(selectedItem.lng).toFixed(6) : 
                                selectedItem.lng.toFixed(6)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="pt-2">
                            <Button size="sm" className="w-full">
                              <Factory className="h-4 w-4 mr-2" />
                              View Full Refinery Details
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
        .leaflet-popup-content-wrapper {
          border-radius: 0.5rem;
          backdrop-filter: blur(8px);
          background-color: rgba(var(--card), 0.95);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
        }
        
        .leaflet-popup-tip {
          background-color: rgba(var(--card), 0.95);
        }
        
        .leaflet-container {
          font-family: inherit;
        }
        
        .custom-popup .leaflet-popup-content {
          margin: 8px;
        }
        `
      }} />
    </div>
  );
}