import { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  X, 
  Ship, 
  MapPin, 
  Navigation, 
  Anchor, 
  Factory, 
  Sun, 
  Moon, 
  Info, 
  Filter, 
  ArrowUpRight, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Oil vessel types based on the provided Excel list
const OIL_VESSEL_TYPES = [
  'Crude Oil Tanker',
  'Product Tanker',
  'Chemical/Oil Products Tanker',
  'ULCC',
  'VLCC',
  'Aframax',
  'Suezmax',
  'Bitumen Tanker',
  'Oil Products Tanker',
  'Oil/Chemical Tanker',
  'LPG Tanker',
  'LNG Tanker',
  'Bunkering Tanker',
  'Asphalt/Bitumen Tanker'
];

// Cargo types for filtering
const CARGO_TYPES = [
  'Crude Oil',
  'Diesel',
  'Jet Fuel',
  'Naphtha',
  'Fuel Oil',
  'Gasoline',
  'LPG',
  'LNG',
  'Bitumen',
  'Chemicals',
  'Petroleum Products'
];

// Vessel statuses with their corresponding colors
const VESSEL_STATUSES: Record<string, string> = {
  'At Sea': '#28a745',        // Green for moving vessels
  'Underway': '#28a745',      // Green for moving vessels
  'In Port': '#ffc107',       // Yellow for waiting vessels
  'Anchored': '#ffc107',      // Yellow for waiting vessels
  'Moored': '#ffc107',        // Yellow for waiting vessels
  'Delayed': '#dc3545',       // Red for delayed vessels
  'Not Moving': '#dc3545',    // Red for delayed vessels
  'Unknown': '#6c757d'        // Gray for unknown status
};

// Interface for vessel data
interface Vessel {
  id: number;
  name: string;
  vesselType: string;
  imo?: string;
  mmsi?: string;
  flag?: string; 
  currentLat: string | number | null;
  currentLng: string | number | null;
  course?: number;
  speed?: number;
  destination?: string;
  estimatedArrival?: string | Date;
  lastPort?: string;
  cargoType?: string;
  status?: string;
  departureTime?: string | Date;
}

// Interface for port/refinery
interface Facility {
  id: number;
  name: string;
  lat: string | number;
  lng: string | number;
  type: 'refinery' | 'port';
  country: string;
  capacity?: number;
  description?: string;
}

export default function OilVesselMap() {
  // Map state
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const [mapTheme, setMapTheme] = useState<'light' | 'dark'>('dark');
  
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [infoOpen, setInfoOpen] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  
  // Data state
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Filter state
  const [search, setSearch] = useState('');
  const [cargoTypeFilter, setCargoTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showRefineries, setShowRefineries] = useState(true);
  const [showPorts, setShowPorts] = useState(true);

  // Filtered vessels based on search and filters
  const filteredVessels = useMemo(() => {
    return vessels.filter(vessel => {
      // First check if it's an oil vessel
      if (!vessel.vesselType || !OIL_VESSEL_TYPES.some(type => 
        vessel.vesselType.toLowerCase().includes(type.toLowerCase()))) {
        return false;
      }
      
      // Then apply search filter
      const searchLower = search.toLowerCase();
      const nameMatch = vessel.name?.toLowerCase().includes(searchLower);
      const imoMatch = vessel.imo?.toLowerCase().includes(searchLower);
      const mmsiMatch = vessel.mmsi?.toLowerCase().includes(searchLower);
      
      if (search && !nameMatch && !imoMatch && !mmsiMatch) {
        return false;
      }
      
      // Apply cargo type filter
      if (cargoTypeFilter && (!vessel.cargoType || 
          !vessel.cargoType.toLowerCase().includes(cargoTypeFilter.toLowerCase()))) {
        return false;
      }
      
      // Apply status filter
      if (statusFilter && (!vessel.status || 
          !vessel.status.toLowerCase().includes(statusFilter.toLowerCase()))) {
        return false;
      }
      
      return true;
    });
  }, [vessels, search, cargoTypeFilter, statusFilter]);

  // Filtered facilities based on toggles
  const filteredFacilities = useMemo(() => {
    return facilities.filter(facility => {
      if (facility.type === 'refinery' && !showRefineries) return false;
      if (facility.type === 'port' && !showPorts) return false;
      return true;
    });
  }, [facilities, showRefineries, showPorts]);

  // Initialize the map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // Create map instance
      const map = L.map(mapRef.current, {
        center: [20, 0],
        zoom: 3,
        minZoom: 2,
        maxZoom: 18,
        worldCopyJump: true, // Allows the map to wrap around the world
        maxBounds: L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180)), // Constrain map to world bounds
        maxBoundsViscosity: 1.0 // Prevent dragging outside bounds
      });
      
      // Set up base tile layer based on theme
      const baseTileLayer = L.tileLayer(
        mapTheme === 'dark' 
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', 
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19
        }
      ).addTo(map);
      
      // Create layer group for markers
      layerGroupRef.current = L.layerGroup().addTo(map);
      
      // Set up map reference
      mapInstanceRef.current = map;
    }
    
    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapTheme]);

  // Update map theme when it changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    // Remove existing tile layer
    mapInstanceRef.current.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        mapInstanceRef.current?.removeLayer(layer);
      }
    });
    
    // Add new tile layer based on theme
    L.tileLayer(
      mapTheme === 'dark' 
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', 
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }
    ).addTo(mapInstanceRef.current);
  }, [mapTheme]);

  // Create vessel icon
  const createVesselIcon = (vessel: Vessel) => {
    // Determine color based on status
    let color = VESSEL_STATUSES['Unknown'];
    if (vessel.status && VESSEL_STATUSES[vessel.status]) {
      color = VESSEL_STATUSES[vessel.status];
    } else if (vessel.speed && vessel.speed > 2) {
      color = VESSEL_STATUSES['At Sea']; // Moving
    } else if (vessel.speed !== undefined && vessel.speed <= 2) {
      color = VESSEL_STATUSES['Not Moving']; // Not moving
    }
    
    // Direction arrow rotation based on vessel course
    const rotation = vessel.course !== undefined ? vessel.course : 0;
    
    // Determine vessel size for visual scaling (based on capacity or vessel type)
    let size = 26;
    if (vessel.vesselType) {
      if (vessel.vesselType.includes('VLCC') || vessel.vesselType.includes('ULCC')) {
        size = 32; // Larger for Very Large and Ultra Large Crude Carriers
      } else if (vessel.vesselType.includes('Aframax') || vessel.vesselType.includes('Suezmax')) {
        size = 30; // Large for medium-sized tankers
      }
    }
    
    // Create custom icon with improved ship design and animated pulsing effect for moving vessels
    return L.divIcon({
      className: 'vessel-marker',
      html: `
        <div style="
          position: relative;
          width: ${size}px;
          height: ${size}px;
        ">
          ${vessel.speed && vessel.speed > 5 ? `
            <div style="
              position: absolute;
              width: ${size+4}px;
              height: ${size+4}px;
              top: -2px;
              left: -2px;
              border-radius: 50%;
              background-color: ${color};
              opacity: 0.3;
              animation: pulse 2s infinite;
            "></div>
          ` : ''}
          <div style="
            position: absolute;
            width: ${size-2}px;
            height: ${size-2}px;
            border-radius: 3px;
            background-color: ${color};
            opacity: 0.9;
            border: 2px solid white;
            box-shadow: 0 0 6px rgba(0,0,0,0.5);
            transform: rotate(${rotation}deg);
          ">
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: ${size-8}px;
              height: ${size-8}px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <svg 
                width="${size-8}" 
                height="${size-8}" 
                viewBox="0 0 24 24" 
                fill="white"
              >
                <path d="M2 20h20v2H2v-2zm2-7.6v5.6h3v-5.6c0-.56.87-1.6 2.2-1.6.6 0 1.2.8 1.8.8.6 0 1.2-.8 1.8-.8.22 0 .43.09.63.17l-.02-5.57H7v3l-3 3z" stroke="none" />
                <path d="M20.97 14l-6-5.93V2h-3v6L6 13.93V14h14.97z" stroke="none" />
              </svg>
            </div>
          </div>
        </div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.2); opacity: 0.2; }
            100% { transform: scale(1); opacity: 0.3; }
          }
        </style>
      `,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });
  };

  // Create port/refinery icons
  const createFacilityIcon = (facility: Facility) => {
    // Base colors for facilities
    const colors = {
      refinery: {
        primary: '#8b5cf6', // Purple
        secondary: '#7c3aed', // Deeper purple
        background: '#ede9fe' // Light purple background
      },
      port: {
        primary: '#3b82f6', // Blue
        secondary: '#2563eb', // Deeper blue
        background: '#dbeafe' // Light blue background
      }
    };
    
    // Select the color scheme based on facility type
    const colorScheme = facility.type === 'refinery' ? colors.refinery : colors.port;
    
    // Determine the size based on capacity if available (for visual importance)
    const baseSize = facility.type === 'refinery' ? 28 : 26;
    let size = baseSize;
    
    if (facility.capacity) {
      // Scale size based on capacity - larger facilities get slightly bigger icons
      if (facility.capacity > 500000) {
        size = baseSize + 6;
      } else if (facility.capacity > 200000) {
        size = baseSize + 4;
      } else if (facility.capacity > 100000) {
        size = baseSize + 2;
      }
    }
    
    // Create custom icon with more detailed and professional design
    return L.divIcon({
      className: `${facility.type}-marker`,
      html: `
        <div style="position: relative; width: ${size}px; height: ${size}px;">
          <!-- Background glow effect -->
          <div style="
            position: absolute;
            width: ${size+8}px;
            height: ${size+8}px;
            top: -4px;
            left: -4px;
            border-radius: ${facility.type === 'refinery' ? '15%' : '50%'};
            background-color: ${colorScheme.background};
            opacity: 0.6;
            box-shadow: 0 0 10px ${colorScheme.primary};
          "></div>
          
          <!-- Main icon container -->
          <div style="
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            border-radius: ${facility.type === 'refinery' ? '15%' : '50%'};
            background: linear-gradient(135deg, ${colorScheme.primary}, ${colorScheme.secondary});
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
          ">
            ${facility.type === 'refinery' 
              ? `<svg width="${size-10}" height="${size-10}" viewBox="0 0 24 24" fill="white">
                  <path d="M2 22h20v-2H2v2zm2-11h3V7h10v4h3V9l-4-4V3H8v2L4 9v2zm13-1V7h-3v3h3zM9 7v3h3V7H9z" />
                  <path d="M18 12H6v4h3v3h6v-3h3v-4z" />
                </svg>`
              : `<svg width="${size-10}" height="${size-10}" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2a3 3 0 0 0-3 3c0 1.3.84 2.4 2 2.82V15h2V7.82A3 3 0 0 0 15 5a3 3 0 0 0-3-3zM5.5 16.55A8 8 0 0 0 12 20a8 8 0 0 0 6.5-3.45l.5-.8-1-1.65H6l-1 1.65.5.8z" />
                  <path d="M5 16v4h14v-4H5z" />
                </svg>`
            }
          </div>
          
          <!-- Facility name tooltip on hover (appears above the icon) -->
          <div style="
            position: absolute;
            bottom: ${size + 5}px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 3px 6px;
            border-radius: 3px;
            font-size: 11px;
            white-space: nowrap;
            opacity: 0;
            transition: opacity 0.2s;
            pointer-events: none;
            z-index: 20;
          " class="facility-tooltip">
            ${facility.name}
          </div>
        </div>
        
        <style>
          .${facility.type}-marker:hover .facility-tooltip {
            opacity: 1;
          }
        </style>
      `,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
      popupAnchor: [0, -size/2]
    });
  };

  // Update markers when filtered data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;
    
    // Clear existing markers
    layerGroupRef.current.clearLayers();
    markersRef.current = {};
    
    // Add vessel markers
    filteredVessels.forEach(vessel => {
      if (vessel.currentLat && vessel.currentLng) {
        const lat = typeof vessel.currentLat === 'string' ? parseFloat(vessel.currentLat) : vessel.currentLat;
        const lng = typeof vessel.currentLng === 'string' ? parseFloat(vessel.currentLng) : vessel.currentLng;
        
        if (!isNaN(lat) && !isNaN(lng)) {
          // Create marker
          const marker = L.marker([lat, lng], {
            icon: createVesselIcon(vessel),
            title: vessel.name || `Vessel #${vessel.id}`
          }).addTo(layerGroupRef.current!);
          
          // Add popup
          marker.bindPopup(`
            <div style="font-family: sans-serif; min-width: 200px;">
              <h3 style="margin: 0 0 5px; font-size: 16px; font-weight: bold;">${vessel.name || 'Unknown Vessel'}</h3>
              <p style="margin: 0 0 3px; font-size: 12px;">
                <strong>Type:</strong> ${vessel.vesselType || 'Unknown'}
              </p>
              ${vessel.imo ? `<p style="margin: 0 0 3px; font-size: 12px;"><strong>IMO:</strong> ${vessel.imo}</p>` : ''}
              ${vessel.mmsi ? `<p style="margin: 0 0 3px; font-size: 12px;"><strong>MMSI:</strong> ${vessel.mmsi}</p>` : ''}
              ${vessel.flag ? `<p style="margin: 0 0 3px; font-size: 12px;"><strong>Flag:</strong> ${vessel.flag}</p>` : ''}
              ${vessel.speed !== undefined ? `<p style="margin: 0 0 3px; font-size: 12px;"><strong>Speed:</strong> ${vessel.speed} knots</p>` : ''}
              ${vessel.cargoType ? `<p style="margin: 0 0 3px; font-size: 12px;"><strong>Cargo:</strong> ${vessel.cargoType}</p>` : ''}
              <div style="margin-top: 8px;">
                <button 
                  style="background: #3b82f6; color: white; border: none; padding: 5px 10px; border-radius: 4px; font-size: 12px; cursor: pointer;"
                  onclick="document.dispatchEvent(new CustomEvent('vesselClick', {detail: ${vessel.id}}))"
                >
                  View Details
                </button>
              </div>
            </div>
          `);
          
          // Add click handler for vessel info panel
          marker.on('click', () => {
            setSelectedVessel(vessel);
            setInfoOpen(true);
          });
          
          // Store marker reference by vessel ID
          markersRef.current[`vessel-${vessel.id}`] = marker;
        }
      }
    });
    
    // Add facility markers
    filteredFacilities.forEach(facility => {
      if (facility.lat && facility.lng) {
        const lat = typeof facility.lat === 'string' ? parseFloat(facility.lat) : facility.lat;
        const lng = typeof facility.lng === 'string' ? parseFloat(facility.lng) : facility.lng;
        
        if (!isNaN(lat) && !isNaN(lng)) {
          // Create marker
          const marker = L.marker([lat, lng], {
            icon: createFacilityIcon(facility),
            title: facility.name || `${facility.type.charAt(0).toUpperCase() + facility.type.slice(1)} #${facility.id}`
          }).addTo(layerGroupRef.current!);
          
          // Add popup
          marker.bindPopup(`
            <div style="font-family: sans-serif; min-width: 180px;">
              <h3 style="margin: 0 0 5px; font-size: 16px; font-weight: bold;">${facility.name || 'Unknown Facility'}</h3>
              <p style="margin: 0 0 3px; font-size: 12px;">
                <strong>Type:</strong> ${facility.type.charAt(0).toUpperCase() + facility.type.slice(1)}
              </p>
              <p style="margin: 0 0 3px; font-size: 12px;">
                <strong>Country:</strong> ${facility.country || 'Unknown'}
              </p>
              ${facility.capacity ? `<p style="margin: 0 0 3px; font-size: 12px;"><strong>Capacity:</strong> ${facility.capacity.toLocaleString()} bpd</p>` : ''}
            </div>
          `);
          
          // Store marker reference
          markersRef.current[`${facility.type}-${facility.id}`] = marker;
        }
      }
    });
  }, [filteredVessels, filteredFacilities]);

  // Fetch vessel data
  useEffect(() => {
    const fetchVesselData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiRequest('/api/vessels');
        if (Array.isArray(response)) {
          setVessels(response);
        } else if (response && Array.isArray(response.vessels)) {
          setVessels(response.vessels);
        } else {
          throw new Error('Invalid vessel data format');
        }
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Error fetching vessel data:', err);
        setError('Failed to load vessel data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    // Fetch ports and refineries
    const fetchFacilities = async () => {
      try {
        // Fetch ports
        const portsResponse = await apiRequest('/api/ports');
        let portsData: Facility[] = [];
        if (Array.isArray(portsResponse)) {
          portsData = portsResponse.map((port: any) => ({
            ...port,
            type: 'port' as const
          }));
        } else if (portsResponse && Array.isArray(portsResponse.ports)) {
          portsData = portsResponse.ports.map((port: any) => ({
            ...port,
            type: 'port' as const
          }));
        }
        
        // Fetch refineries
        const refineriesResponse = await apiRequest('/api/refineries');
        let refineriesData: Facility[] = [];
        if (Array.isArray(refineriesResponse)) {
          refineriesData = refineriesResponse.map(refinery => ({
            ...refinery,
            type: 'refinery'
          }));
        } else if (refineriesResponse && Array.isArray(refineriesResponse.refineries)) {
          refineriesData = refineriesResponse.refineries.map((refinery: any) => ({
            ...refinery,
            type: 'refinery' as const
          }));
        }
        
        // Combine data
        setFacilities([...portsData, ...refineriesData]);
      } catch (err) {
        console.error('Error fetching facilities data:', err);
      }
    };
    
    // Initial data fetch
    fetchVesselData();
    fetchFacilities();
    
    // Set up auto-refresh every 30 seconds
    const intervalId = setInterval(() => {
      fetchVesselData();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Listen for custom event from popup button
  useEffect(() => {
    const handleVesselClick = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      const vesselId = customEvent.detail;
      const vessel = vessels.find(v => v.id === vesselId);
      if (vessel) {
        setSelectedVessel(vessel);
        setInfoOpen(true);
      }
    };
    
    document.addEventListener('vesselClick', handleVesselClick);
    
    return () => {
      document.removeEventListener('vesselClick', handleVesselClick);
    };
  }, [vessels]);

  // Format date string helper
  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleString();
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-background">
      {/* Map container */}
      <div 
        ref={mapRef} 
        className="absolute inset-0 z-0"
      />
      
      {/* Top search bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-2xl px-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search vessels by name, IMO or MMSI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 bg-card/90 backdrop-blur-sm border-muted"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5"
              onClick={() => setSearch('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Filter sidebar */}
      <div className={`absolute left-0 top-0 h-full z-20 transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="w-64 h-full bg-card/90 backdrop-blur-sm border-r border-border p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Oil Vessel Map</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-6 flex-1 overflow-auto">
            {/* Filters */}
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Filter className="h-4 w-4 mr-1.5" />
                Filters
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Cargo Type</label>
                  <Select
                    value={cargoTypeFilter || 'all'}
                    onValueChange={(value) => setCargoTypeFilter(value === 'all' ? null : value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All cargo types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All cargo types</SelectItem>
                      {CARGO_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Vessel Status</label>
                  <Select
                    value={statusFilter || 'all'}
                    onValueChange={(value) => setStatusFilter(value === 'all' ? null : value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      {Object.keys(VESSEL_STATUSES).map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Map Layers</label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center">
                      <Factory className="h-3.5 w-3.5 mr-1.5 text-purple-400" />
                      Refineries
                    </span>
                    <Toggle
                      aria-label="Toggle refineries"
                      pressed={showRefineries}
                      onPressedChange={setShowRefineries}
                      size="sm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center">
                      <Anchor className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
                      Ports
                    </span>
                    <Toggle
                      aria-label="Toggle ports"
                      pressed={showPorts}
                      onPressedChange={setShowPorts}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Info className="h-4 w-4 mr-1.5" />
                Overview
              </h3>
              <Card className="bg-background/50">
                <CardContent className="p-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Oil Vessels:</span>
                    <span className="font-medium">{filteredVessels.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Moving Vessels:</span>
                    <span className="font-medium">
                      {filteredVessels.filter(v => 
                        v.status === 'At Sea' || 
                        v.status === 'Underway' || 
                        (v.speed !== undefined && v.speed > 2)
                      ).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">In Port:</span>
                    <span className="font-medium">
                      {filteredVessels.filter(v => 
                        v.status === 'In Port' || 
                        v.status === 'Moored' || 
                        v.status === 'Anchored'
                      ).length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Theme toggle */}
            <div>
              <h3 className="text-sm font-medium mb-2">Map Theme</h3>
              <div className="flex space-x-2">
                <Button
                  variant={mapTheme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setMapTheme('light')}
                >
                  <Sun className="h-4 w-4 mr-1.5" />
                  Light
                </Button>
                <Button
                  variant={mapTheme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setMapTheme('dark')}
                >
                  <Moon className="h-4 w-4 mr-1.5" />
                  Dark
                </Button>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="pt-4 text-xs text-muted-foreground border-t border-border mt-4">
            <p>Auto-updating every 30 seconds</p>
            {lastUpdated && (
              <p className="mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Sidebar toggle button (when closed) */}
      {!sidebarOpen && (
        <Button
          variant="secondary"
          size="sm"
          className="absolute left-4 top-4 z-20"
          onClick={() => setSidebarOpen(true)}
        >
          <ChevronRight className="h-4 w-4 mr-1" />
          Filters
        </Button>
      )}
      
      {/* Map controls */}
      <div className="absolute right-4 top-4 z-10 flex flex-col space-y-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setMapTheme(mapTheme === 'dark' ? 'light' : 'dark')}
          title={`Switch to ${mapTheme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {mapTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* Vessel info panel */}
      {infoOpen && selectedVessel && (
        <div className="absolute right-0 top-0 h-full z-20 transition-all duration-300 translate-x-0">
          <div className="w-80 h-full bg-card/90 backdrop-blur-sm border-l border-border p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Vessel Details</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setInfoOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4 flex-1 overflow-auto">
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={selectedVessel.status === 'At Sea' || selectedVessel.status === 'Underway' ? 'bg-green-500 hover:bg-green-600' : 
                              selectedVessel.status === 'In Port' || selectedVessel.status === 'Moored' || selectedVessel.status === 'Anchored' ? 'bg-yellow-500 hover:bg-yellow-600' : 
                              selectedVessel.status === 'Delayed' || selectedVessel.status === 'Not Moving' ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-500 hover:bg-slate-600'}>
                  {selectedVessel.status || 'Unknown Status'}
                </Badge>
                <Badge variant="outline">{selectedVessel.vesselType || 'Unknown Type'}</Badge>
              </div>
              
              <div>
                <h3 className="text-xl font-bold">{selectedVessel.name}</h3>
                {selectedVessel.flag && (
                  <p className="text-sm text-muted-foreground">{selectedVessel.flag}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-y-2">
                {selectedVessel.imo && (
                  <>
                    <span className="text-sm text-muted-foreground">IMO:</span>
                    <span className="text-sm font-medium">{selectedVessel.imo}</span>
                  </>
                )}
                
                {selectedVessel.mmsi && (
                  <>
                    <span className="text-sm text-muted-foreground">MMSI:</span>
                    <span className="text-sm font-medium">{selectedVessel.mmsi}</span>
                  </>
                )}
                
                {selectedVessel.currentLat && selectedVessel.currentLng && (
                  <>
                    <span className="text-sm text-muted-foreground">Position:</span>
                    <span className="text-sm font-medium">
                      {typeof selectedVessel.currentLat === 'string' 
                        ? parseFloat(selectedVessel.currentLat).toFixed(4) 
                        : selectedVessel.currentLat?.toFixed(4)}, 
                      {typeof selectedVessel.currentLng === 'string' 
                        ? parseFloat(selectedVessel.currentLng).toFixed(4) 
                        : selectedVessel.currentLng?.toFixed(4)}
                    </span>
                  </>
                )}
                
                {selectedVessel.speed !== undefined && (
                  <>
                    <span className="text-sm text-muted-foreground">Speed:</span>
                    <span className="text-sm font-medium">{selectedVessel.speed} knots</span>
                  </>
                )}
                
                {selectedVessel.course !== undefined && (
                  <>
                    <span className="text-sm text-muted-foreground">Heading:</span>
                    <span className="text-sm font-medium">{selectedVessel.course}°</span>
                  </>
                )}
                
                {selectedVessel.cargoType && (
                  <>
                    <span className="text-sm text-muted-foreground">Cargo:</span>
                    <span className="text-sm font-medium">{selectedVessel.cargoType}</span>
                  </>
                )}
              </div>
              
              <div className="pt-2 border-t border-border">
                <h4 className="text-sm font-medium mb-2">Voyage Information</h4>
                <div className="space-y-2">
                  {selectedVessel.lastPort && (
                    <div>
                      <p className="text-sm text-muted-foreground">Last Port:</p>
                      <p className="text-sm font-medium">{selectedVessel.lastPort}</p>
                      {selectedVessel.departureTime && (
                        <p className="text-xs text-muted-foreground">
                          Departed: {formatDate(selectedVessel.departureTime)}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {selectedVessel.destination && (
                    <div>
                      <p className="text-sm text-muted-foreground">Destination:</p>
                      <p className="text-sm font-medium">{selectedVessel.destination}</p>
                      {selectedVessel.estimatedArrival && (
                        <p className="text-xs text-muted-foreground">
                          ETA: {formatDate(selectedVessel.estimatedArrival)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="pt-3 mt-4 border-t border-border">
              <Button 
                variant="default"
                className="w-full"
                onClick={() => {
                  if (selectedVessel && selectedVessel.currentLat && selectedVessel.currentLng && mapInstanceRef.current) {
                    const lat = typeof selectedVessel.currentLat === 'string' 
                      ? parseFloat(selectedVessel.currentLat) 
                      : selectedVessel.currentLat;
                    const lng = typeof selectedVessel.currentLng === 'string' 
                      ? parseFloat(selectedVessel.currentLng) 
                      : selectedVessel.currentLng;
                    
                    if (!isNaN(lat) && !isNaN(lng)) {
                      mapInstanceRef.current.setView([lat, lng], 10);
                    }
                  }
                }}
              >
                <Navigation className="h-4 w-4 mr-1.5" />
                Center on Map
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-50">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-sm">Loading vessel data...</p>
          </div>
        </div>
      )}
      
      {/* Error notification */}
      {error && (
        <div className="absolute top-4 right-4 z-50">
          <Card className="bg-destructive/10 border-destructive">
            <CardContent className="p-4 text-sm text-destructive">
              {error}
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Vessel count indicator */}
      <div className="absolute left-4 bottom-4 z-10">
        <Badge variant="secondary" className="text-sm">
          <Ship className="h-3.5 w-3.5 mr-1.5" />
          {filteredVessels.length} oil vessels
        </Badge>
      </div>
    </div>
  );
}