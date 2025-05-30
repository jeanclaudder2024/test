import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Ship, Anchor, Building2, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Define the interfaces for our data
interface Vessel {
  id: number;
  name: string;
  vesselType: string;
  currentLat: string | null;
  currentLng: string | null;
  status: string;
  flag?: string;
}

interface Port {
  id: number;
  name: string;
  lat: string;
  lng: string;
  country: string;
  type: string;
}

interface Refinery {
  id: number;
  name: string;
  lat: string;
  lng: string;
  country: string;
  capacity: number;
}

// Define vessel status types
type VesselStatus = 'moving' | 'idle' | 'docked' | 'all';

export default function VesselTrackingMap() {
  // State variables
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [refineries, setRefineries] = useState<Refinery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Filter states
  const [showVessels, setShowVessels] = useState<boolean>(true);
  const [showPorts, setShowPorts] = useState<boolean>(true);
  const [showRefineries, setShowRefineries] = useState<boolean>(true);
  const [selectedVesselTypes, setSelectedVesselTypes] = useState<string[]>([]);
  const [selectedVesselStatus, setSelectedVesselStatus] = useState<VesselStatus>('all');
  
  // Refs for Leaflet objects
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const vesselLayerRef = useRef<L.LayerGroup | null>(null);
  const portLayerRef = useRef<L.LayerGroup | null>(null);
  const refineryLayerRef = useRef<L.LayerGroup | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  // Helper function to get unique vessel types
  const getUniqueVesselTypes = () => {
    return Array.from(new Set(vessels.map(vessel => vessel.vesselType)))
      .filter(type => type); // Remove any undefined/null values
  };

  // Count vessels by status
  const getVesselCountsByStatus = () => {
    const counts = {
      moving: vessels.filter(v => v.status === 'moving').length,
      idle: vessels.filter(v => v.status === 'idle').length,
      docked: vessels.filter(v => v.status === 'docked').length,
      total: vessels.length
    };
    return counts;
  };

  // Function to initialize the map
  const initializeMap = () => {
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [20, 0], // Center on the world
        zoom: 2,
        minZoom: 2,
        maxZoom: 18
      });
      
      // Add the maritime-style tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
      
      // Create layer groups for each type of marker
      vesselLayerRef.current = L.layerGroup().addTo(map);
      portLayerRef.current = L.layerGroup().addTo(map);
      refineryLayerRef.current = L.layerGroup().addTo(map);
      
      // Store the map instance
      mapInstanceRef.current = map;
    }
  };

  // Function to create custom icons for the map
  const createCustomIcon = (type: 'vessel' | 'port' | 'refinery', status?: string) => {
    // Set colors based on type and status
    let iconUrl = '';
    let iconSize: [number, number] = [24, 24];
    
    // Choose icon based on type and status
    if (type === 'vessel') {
      // Determine color based on vessel status
      const color = status === 'moving' ? '#3b82f6' : // blue for moving
                   status === 'idle' ? '#eab308' :    // yellow for idle
                   status === 'docked' ? '#10b981' :  // green for docked
                   '#6b7280';                         // gray for unknown
      
      // Create a teardrop SVG marker (similar to Google Maps style)
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
          <path fill="${color}" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="white" stroke-width="1"/>
          <circle cx="12" cy="9" r="3" fill="white"/>
        </svg>
      `;
      
      // Convert SVG to data URL
      iconUrl = 'data:image/svg+xml;base64,' + btoa(svgString);
      iconSize = [32, 32];
    } else if (type === 'port') {
      // Port icon (anchor)
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <rect x="4" y="4" width="16" height="16" rx="4" fill="#f97316" stroke="white" stroke-width="1"/>
          <path d="M12 7v2M12 15v2M7 12h2M15 12h2" stroke="white" stroke-width="2" stroke-linecap="round"/>
          <circle cx="12" cy="12" r="2" fill="white"/>
        </svg>
      `;
      iconUrl = 'data:image/svg+xml;base64,' + btoa(svgString);
    } else if (type === 'refinery') {
      // Refinery icon (factory/building)
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <rect x="3" y="5" width="18" height="14" rx="2" fill="#8b5cf6" stroke="white" stroke-width="1"/>
          <path d="M7 9v6M12 9v6M17 9v6" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          <rect x="7" y="5" width="10" height="3" fill="#8b5cf6" stroke="white" stroke-width="1"/>
        </svg>
      `;
      iconUrl = 'data:image/svg+xml;base64,' + btoa(svgString);
    }
    
    return L.icon({
      iconUrl,
      iconSize,
      iconAnchor: [iconSize[0] / 2, iconSize[1]],
      popupAnchor: [0, -iconSize[1]]
    });
  };

  // Function to update vessel markers on the map
  const updateVesselMarkers = () => {
    if (!vesselLayerRef.current || !showVessels) return;
    
    // Clear previous markers
    vesselLayerRef.current.clearLayers();
    
    // Filter vessels based on selected types and status
    const filteredVessels = vessels.filter(vessel => {
      // Filter by type if types are selected
      const typeMatch = selectedVesselTypes.length === 0 || 
                        selectedVesselTypes.includes(vessel.vesselType);
      
      // Filter by status
      const statusMatch = selectedVesselStatus === 'all' || 
                         vessel.status === selectedVesselStatus;
      
      return typeMatch && statusMatch;
    });
    
    // Add filtered vessels to the map
    filteredVessels.forEach(vessel => {
      if (vessel.currentLat && vessel.currentLng) {
        const lat = parseFloat(vessel.currentLat);
        const lng = parseFloat(vessel.currentLng);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          // Create marker with custom icon
          const icon = createCustomIcon('vessel', vessel.status);
          const marker = L.marker([lat, lng], { icon }).addTo(vesselLayerRef.current!);
          
          // Add popup with vessel info
          marker.bindPopup(`
            <div class="vessel-popup">
              <h3 class="text-lg font-semibold">${vessel.name}</h3>
              <div class="mt-2 space-y-1">
                <p><strong>Type:</strong> ${vessel.vesselType}</p>
                <p><strong>Status:</strong> ${vessel.status}</p>
                ${vessel.flag ? `<p><strong>Flag:</strong> ${vessel.flag}</p>` : ''}
                <p><strong>ID:</strong> ${vessel.id}</p>
              </div>
            </div>
          `);
        }
      }
    });
  };

  // Function to update port markers on the map
  const updatePortMarkers = () => {
    if (!portLayerRef.current) return;
    
    // Clear previous markers
    portLayerRef.current.clearLayers();
    
    // Skip if ports are hidden
    if (!showPorts) return;
    
    // Add ports to the map
    ports.forEach(port => {
      const lat = parseFloat(port.lat);
      const lng = parseFloat(port.lng);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        // Create marker with custom icon
        const icon = createCustomIcon('port');
        const marker = L.marker([lat, lng], { icon }).addTo(portLayerRef.current!);
        
        // Add popup with port info
        marker.bindPopup(`
          <div class="port-popup">
            <h3 class="text-lg font-semibold">${port.name}</h3>
            <div class="mt-2 space-y-1">
              <p><strong>Country:</strong> ${port.country}</p>
              <p><strong>Type:</strong> ${port.type}</p>
              <p><strong>ID:</strong> ${port.id}</p>
            </div>
          </div>
        `);
      }
    });
  };

  // Function to update refinery markers on the map
  const updateRefineryMarkers = () => {
    if (!refineryLayerRef.current) return;
    
    // Clear previous markers
    refineryLayerRef.current.clearLayers();
    
    // Skip if refineries are hidden
    if (!showRefineries) return;
    
    // Add refineries to the map
    refineries.forEach(refinery => {
      const lat = parseFloat(refinery.lat);
      const lng = parseFloat(refinery.lng);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        // Create marker with custom icon
        const icon = createCustomIcon('refinery');
        const marker = L.marker([lat, lng], { icon }).addTo(refineryLayerRef.current!);
        
        // Add popup with refinery info
        marker.bindPopup(`
          <div class="refinery-popup">
            <h3 class="text-lg font-semibold">${refinery.name}</h3>
            <div class="mt-2 space-y-1">
              <p><strong>Country:</strong> ${refinery.country}</p>
              <p><strong>Capacity:</strong> ${refinery.capacity.toLocaleString()} barrels/day</p>
              <p><strong>ID:</strong> ${refinery.id}</p>
            </div>
          </div>
        `);
      }
    });
  };

  // Function to fetch vessel data
  const fetchVesselData = async () => {
    try {
      const response = await fetch('/api/vessels');
      
      if (!response.ok) {
        throw new Error(`Error fetching vessel data: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform the data to match our vessel interface
      // and add status if not present (based on some logic)
      const processedVessels = data.map((vessel: any) => ({
        ...vessel,
        status: vessel.status || determineVesselStatus(vessel)
      }));
      
      setVessels(processedVessels);
      setLastUpdated(new Date());
      setErrorMessage(null);
    } catch (error) {
      console.error('Failed to fetch vessel data:', error);
      setErrorMessage('Failed to fetch vessel data. Will retry automatically.');
      toast({
        title: "Data Fetch Error",
        description: "Failed to fetch vessel data. Will retry automatically.",
        variant: "destructive"
      });
    }
  };

  // Helper function to determine vessel status if not provided
  const determineVesselStatus = (vessel: any): VesselStatus => {
    // This is a placeholder logic. In a real application, you would have
    // more sophisticated logic based on speed, proximity to ports, etc.
    if (vessel.currentSpeed > 2) return 'moving';
    if (vessel.nearPort) return 'docked';
    return 'idle';
  };

  // Function to fetch port data
  const fetchPortData = async () => {
    try {
      const response = await fetch('/api/ports');
      
      if (!response.ok) {
        throw new Error(`Error fetching port data: ${response.status}`);
      }
      
      const data = await response.json();
      setPorts(data);
    } catch (error) {
      console.error('Failed to fetch port data:', error);
      toast({
        title: "Data Fetch Error",
        description: "Failed to fetch port data.",
        variant: "destructive"
      });
    }
  };

  // Function to fetch refinery data
  const fetchRefineryData = async () => {
    try {
      const response = await fetch('/api/refineries');
      
      if (!response.ok) {
        throw new Error(`Error fetching refinery data: ${response.status}`);
      }
      
      const data = await response.json();
      setRefineries(data);
    } catch (error) {
      console.error('Failed to fetch refinery data:', error);
      toast({
        title: "Data Fetch Error",
        description: "Failed to fetch refinery data.",
        variant: "destructive"
      });
    }
  };

  // Function to toggle vessel type selection
  const toggleVesselType = (type: string) => {
    setSelectedVesselTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  // Function to update all data
  const updateAllData = async () => {
    setLoading(true);
    
    // Fetch all data
    await Promise.all([
      fetchVesselData(),
      fetchPortData(),
      fetchRefineryData()
    ]);
    
    setLoading(false);
  };

  // Set up the map and fetch initial data
  useEffect(() => {
    initializeMap();
    updateAllData();
    
    // Set up auto-refresh timer (every 60 seconds)
    refreshTimerRef.current = setInterval(() => {
      fetchVesselData();
      // Only update vessel data, not ports/refineries which change less frequently
    }, 60000); // 60 seconds
    
    // Clean up on unmount
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
      
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when data or visibility changes
  useEffect(() => {
    updateVesselMarkers();
    updatePortMarkers();
    updateRefineryMarkers();
  }, [
    vessels, ports, refineries,
    showVessels, showPorts, showRefineries,
    selectedVesselTypes, selectedVesselStatus
  ]);

  // Get counts and unique vessel types
  const vesselCounts = getVesselCountsByStatus();
  const vesselTypes = getUniqueVesselTypes();

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div 
          className={`bg-card border-r transition-all duration-300 ${
            sidebarOpen 
              ? 'w-80 flex-shrink-0' 
              : 'w-0 -ml-5 overflow-hidden'
          }`}
        >
          <div className="h-full flex flex-col p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Maritime Tracking</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarOpen(false)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : (
              <>
                {/* Layer visibility toggles */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Map Layers</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Checkbox 
                        id="show-vessels" 
                        checked={showVessels} 
                        onCheckedChange={(checked) => setShowVessels(!!checked)}
                      />
                      <Label htmlFor="show-vessels" className="ml-2 flex items-center">
                        <Ship className="h-4 w-4 mr-1" /> Vessels ({vessels.length})
                      </Label>
                    </div>
                    
                    <div className="flex items-center">
                      <Checkbox 
                        id="show-ports" 
                        checked={showPorts} 
                        onCheckedChange={(checked) => setShowPorts(!!checked)}
                      />
                      <Label htmlFor="show-ports" className="ml-2 flex items-center">
                        <Anchor className="h-4 w-4 mr-1" /> Ports ({ports.length})
                      </Label>
                    </div>
                    
                    <div className="flex items-center">
                      <Checkbox 
                        id="show-refineries" 
                        checked={showRefineries} 
                        onCheckedChange={(checked) => setShowRefineries(!!checked)}
                      />
                      <Label htmlFor="show-refineries" className="ml-2 flex items-center">
                        <Building2 className="h-4 w-4 mr-1" /> Refineries ({refineries.length})
                      </Label>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                {/* Vessel status filters */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Vessel Status</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Toggle 
                      pressed={selectedVesselStatus === 'all'} 
                      onPressedChange={() => setSelectedVesselStatus('all')}
                      className="justify-start"
                    >
                      <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                      All ({vesselCounts.total})
                    </Toggle>
                    
                    <Toggle 
                      pressed={selectedVesselStatus === 'moving'} 
                      onPressedChange={() => setSelectedVesselStatus('moving')}
                      className="justify-start"
                    >
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      Moving ({vesselCounts.moving})
                    </Toggle>
                    
                    <Toggle 
                      pressed={selectedVesselStatus === 'idle'} 
                      onPressedChange={() => setSelectedVesselStatus('idle')}
                      className="justify-start"
                    >
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                      Idle ({vesselCounts.idle})
                    </Toggle>
                    
                    <Toggle 
                      pressed={selectedVesselStatus === 'docked'} 
                      onPressedChange={() => setSelectedVesselStatus('docked')}
                      className="justify-start"
                    >
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      Docked ({vesselCounts.docked})
                    </Toggle>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                {/* Vessel type filters */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Vessel Types</h3>
                  {vesselTypes.length > 0 ? (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                      {vesselTypes.map(type => (
                        <div key={type} className="flex items-center">
                          <Checkbox 
                            id={`type-${type}`}
                            checked={selectedVesselTypes.includes(type)}
                            onCheckedChange={() => toggleVesselType(type)}
                          />
                          <Label htmlFor={`type-${type}`} className="ml-2">
                            {type}
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No vessel types available</p>
                  )}
                </div>
                
                <div className="mt-auto pt-4">
                  <Card className="bg-muted/40">
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground">
                        Last updated: {lastUpdated?.toLocaleTimeString() || 'Never'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Auto-refreshing every minute
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Main content (map) */}
        <div className="flex-1 relative">
          {!sidebarOpen && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute left-4 top-4 z-10 bg-background/80 backdrop-blur-sm"
              onClick={() => setSidebarOpen(true)}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
          
          {/* Show loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                <p>Loading map data...</p>
              </div>
            </div>
          )}
          
          {/* Show error message if present */}
          {errorMessage && (
            <div className="absolute top-4 right-4 z-20">
              <Card className="bg-destructive/10 border-destructive">
                <CardContent className="p-3 text-sm">
                  {errorMessage}
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Map container */}
          <div ref={mapRef} className="w-full h-full"></div>
          
          {/* Mobile filter button (for small screens) */}
          <Button
            variant="secondary"
            size="sm"
            className="absolute bottom-4 right-4 z-10 md:hidden flex items-center shadow-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </Button>
        </div>
      </div>
    </div>
  );
}