import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Ship,
  Anchor,
  Building2,
  RefreshCw
} from "lucide-react";
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
  flag?: string;
}

interface Port {
  id: number;
  name: string;
  lat: string;
  lng: string;
  country: string;
}

interface Refinery {
  id: number;
  name: string;
  lat: string;
  lng: string;
  country: string;
}

export default function MaritimeTracking() {
  // State for data
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [refineries, setRefineries] = useState<Refinery[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [showVessels, setShowVessels] = useState(true);
  const [showPorts, setShowPorts] = useState(true);
  const [showRefineries, setShowRefineries] = useState(true);
  
  // Refs
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const vesselsLayerRef = useRef<L.LayerGroup | null>(null);
  const portsLayerRef = useRef<L.LayerGroup | null>(null);
  const refineriesLayerRef = useRef<L.LayerGroup | null>(null);
  
  const { toast } = useToast();
  
  // Initialize map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // Create map
      const map = L.map(mapRef.current).setView([20, 0], 3);
      
      // Add beautiful maritime style base tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      // Add scale control for better navigation
      L.control.scale({ imperial: false, maxWidth: 200 }).addTo(map);
      
      // Create layer groups
      vesselsLayerRef.current = L.layerGroup().addTo(map);
      portsLayerRef.current = L.layerGroup().addTo(map);
      refineriesLayerRef.current = L.layerGroup().addTo(map);
      
      // Store reference
      mapInstanceRef.current = map;
    }
    
    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);
  
  // Function to create custom icon
  const createMarkerIcon = (type: 'vessel' | 'port' | 'refinery') => {
    let color = '';
    let iconHtml = '';
    
    if (type === 'vessel') {
      color = '#3b82f6'; // Blue for vessels
      iconHtml = '<i class="icon-ship"></i>';
    } else if (type === 'port') {
      color = '#f97316'; // Orange for ports
      iconHtml = '<i class="icon-anchor"></i>';
    } else {
      color = '#8b5cf6'; // Purple for refineries
      iconHtml = '<i class="icon-building"></i>';
    }
    
    return L.divIcon({
      className: 'custom-map-marker',
      html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
  };
  
  // Update vessel markers
  useEffect(() => {
    if (!vesselsLayerRef.current || !showVessels) return;
    
    // Clear previous markers
    vesselsLayerRef.current.clearLayers();
    
    // Add vessel markers
    vessels.forEach(vessel => {
      if (vessel.currentLat && vessel.currentLng) {
        const lat = parseFloat(vessel.currentLat);
        const lng = parseFloat(vessel.currentLng);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          const marker = L.marker([lat, lng], {
            icon: createMarkerIcon('vessel')
          }).addTo(vesselsLayerRef.current!);
          
          // Add popup
          marker.bindPopup(`
            <div>
              <h3 style="font-weight: bold; margin-bottom: 5px;">${vessel.name}</h3>
              <p><strong>Type:</strong> ${vessel.vesselType}</p>
              ${vessel.flag ? `<p><strong>Flag:</strong> ${vessel.flag}</p>` : ''}
              <p><strong>ID:</strong> ${vessel.id}</p>
            </div>
          `);
        }
      }
    });
  }, [vessels, showVessels]);
  
  // Update port markers
  useEffect(() => {
    if (!portsLayerRef.current || !showPorts) return;
    
    // Clear previous markers
    portsLayerRef.current.clearLayers();
    
    // Add port markers
    ports.forEach(port => {
      const lat = parseFloat(port.lat);
      const lng = parseFloat(port.lng);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        const marker = L.marker([lat, lng], {
          icon: createMarkerIcon('port')
        }).addTo(portsLayerRef.current!);
        
        // Add popup
        marker.bindPopup(`
          <div>
            <h3 style="font-weight: bold; margin-bottom: 5px;">${port.name}</h3>
            <p><strong>Country:</strong> ${port.country}</p>
            <p><strong>ID:</strong> ${port.id}</p>
          </div>
        `);
      }
    });
  }, [ports, showPorts]);
  
  // Update refinery markers
  useEffect(() => {
    if (!refineriesLayerRef.current || !showRefineries) return;
    
    // Clear previous markers
    refineriesLayerRef.current.clearLayers();
    
    // Add refinery markers
    refineries.forEach(refinery => {
      const lat = parseFloat(refinery.lat);
      const lng = parseFloat(refinery.lng);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        const marker = L.marker([lat, lng], {
          icon: createMarkerIcon('refinery')
        }).addTo(refineriesLayerRef.current!);
        
        // Add popup
        marker.bindPopup(`
          <div>
            <h3 style="font-weight: bold; margin-bottom: 5px;">${refinery.name}</h3>
            <p><strong>Country:</strong> ${refinery.country}</p>
            <p><strong>ID:</strong> ${refinery.id}</p>
          </div>
        `);
      }
    });
  }, [refineries, showRefineries]);
  
  // Fetch vessel data
  const fetchVessels = async () => {
    try {
      setError(null);
      const response = await fetch('/api/vessels');
      if (!response.ok) {
        throw new Error(`Failed to fetch vessels: ${response.status}`);
      }
      const data = await response.json();
      setVessels(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching vessels:", err);
      setError("Could not load vessel data. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to load vessel data.",
        variant: "destructive"
      });
    }
  };
  
  // Fetch port data
  const fetchPorts = async () => {
    try {
      const response = await fetch('/api/ports');
      if (!response.ok) {
        throw new Error(`Failed to fetch ports: ${response.status}`);
      }
      const data = await response.json();
      setPorts(data);
    } catch (err) {
      console.error("Error fetching ports:", err);
      toast({
        title: "Error",
        description: "Failed to load port data.",
        variant: "destructive"
      });
    }
  };
  
  // Fetch refinery data
  const fetchRefineries = async () => {
    try {
      const response = await fetch('/api/refineries');
      if (!response.ok) {
        throw new Error(`Failed to fetch refineries: ${response.status}`);
      }
      const data = await response.json();
      setRefineries(data);
    } catch (err) {
      console.error("Error fetching refineries:", err);
      toast({
        title: "Error",
        description: "Failed to load refinery data.",
        variant: "destructive"
      });
    }
  };
  
  // Load all data
  const loadAllData = async () => {
    setLoading(true);
    
    try {
      await Promise.all([
        fetchVessels(),
        fetchPorts(),
        fetchRefineries()
      ]);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };
  
  // Refresh vessels only (for auto-update)
  const refreshVessels = async () => {
    await fetchVessels();
    toast({
      title: "Updated",
      description: "Vessel positions updated.",
    });
  };
  
  // Initial data load
  useEffect(() => {
    loadAllData();
    
    // Set up auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchVessels();
    }, 60000); // 60 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`border-r border-border ${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden`}>
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Maritime Tracking</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSidebarOpen(false)}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-6 flex-1 overflow-auto">
              {/* Layer controls */}
              <div>
                <h3 className="text-sm font-medium mb-2">Map Layers</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="show-vessels"
                      checked={showVessels}
                      onCheckedChange={(checked) => setShowVessels(!!checked)}
                    />
                    <Label htmlFor="show-vessels" className="flex items-center">
                      <Ship className="h-4 w-4 mr-2" />
                      Vessels <Badge className="ml-2">{vessels.length}</Badge>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="show-ports"
                      checked={showPorts}
                      onCheckedChange={(checked) => setShowPorts(!!checked)}
                    />
                    <Label htmlFor="show-ports" className="flex items-center">
                      <Anchor className="h-4 w-4 mr-2" />
                      Ports <Badge className="ml-2">{ports.length}</Badge>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="show-refineries"
                      checked={showRefineries}
                      onCheckedChange={(checked) => setShowRefineries(!!checked)}
                    />
                    <Label htmlFor="show-refineries" className="flex items-center">
                      <Building2 className="h-4 w-4 mr-2" />
                      Refineries <Badge className="ml-2">{refineries.length}</Badge>
                    </Label>
                  </div>
                </div>
              </div>
              
              {/* Vessel information */}
              <div>
                <h3 className="text-sm font-medium mb-2">Vessel Data</h3>
                <Card className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1">
                      <p>Total vessels: {vessels.length}</p>
                      <p>Unique vessel types: {new Set(vessels.map(v => v.vesselType)).size}</p>
                      <p>Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}</p>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="w-full mt-3 flex items-center justify-center"
                      onClick={refreshVessels}
                      disabled={loading}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {loading ? 'Updating...' : 'Update Now'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              {/* Footer info */}
              <div className="mt-auto pt-4 text-xs text-muted-foreground">
                <p>Auto-refreshing vessel data every 60 seconds</p>
                {lastUpdated && (
                  <p>Last refresh: {lastUpdated.toLocaleTimeString()}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Map container */}
        <div className="relative flex-1">
          {/* Collapsed sidebar toggle */}
          {!sidebarOpen && (
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 left-4 z-10"
              onClick={() => setSidebarOpen(true)}
            >
              <ChevronRight className="h-4 w-4 mr-2" /> 
              Controls
            </Button>
          )}
          
          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-2">Loading map data...</p>
              </div>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="absolute top-4 right-4 z-10">
              <Card className="bg-destructive/10 border-destructive">
                <CardContent className="p-3">
                  <p className="text-sm">{error}</p>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Map div */}
          <div ref={mapRef} className="h-full w-full"></div>
        </div>
      </div>
    </div>
  );
}