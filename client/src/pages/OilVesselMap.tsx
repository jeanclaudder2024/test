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
  ChevronRight,
  Clock,
  Droplets as Fuel
} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShip, 
  faOilWell, 
  faAnchor, 
  faGasPump, 
  faLocationDot, 
  faIndustry, 
  faWater, 
  faVial, 
  faFire, 
  faArrowUp 
} from '@fortawesome/free-solid-svg-icons';

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

// Map regions with coordinates for focusing
const MAP_REGIONS: Record<string, { center: [number, number], zoom: number, label: string }> = {
  'global': { center: [20, 0], zoom: 2, label: 'Global View' },
  'north-america': { center: [40, -100], zoom: 4, label: 'North America' },
  'south-america': { center: [-15, -60], zoom: 3, label: 'South America' },
  'western-europe': { center: [50, 0], zoom: 4, label: 'Western Europe' },
  'eastern-europe': { center: [50, 25], zoom: 4, label: 'Eastern Europe' },
  'middle-east': { center: [28, 45], zoom: 4, label: 'Middle East' },
  'north-africa': { center: [25, 20], zoom: 4, label: 'North Africa' },
  'southern-africa': { center: [-10, 20], zoom: 3, label: 'Southern Africa' },
  'asia-pacific': { center: [20, 110], zoom: 3, label: 'Asia Pacific' },
  'southeast-asia': { center: [10, 115], zoom: 4, label: 'Southeast Asia' },
  'oceania': { center: [-25, 135], zoom: 4, label: 'Oceania' },
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
  const [mapTheme, setMapTheme] = useState<'light' | 'dark'>('light');
  
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
  const [selectedRegion, setSelectedRegion] = useState<string>('global');

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
      // Create map instance with optimized settings for better performance
      const map = L.map(mapRef.current, {
        center: [20, 0],
        zoom: 3,
        minZoom: 2,
        maxZoom: 18,
        worldCopyJump: true, // Allows the map to wrap around the world
        maxBounds: L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180)), // Constrain map to world bounds
        maxBoundsViscosity: 1.0, // Prevent dragging outside bounds
        preferCanvas: true, // Use canvas renderer for better performance with many markers
        renderer: L.canvas({ padding: 0.5 }), // Canvas renderer with minimal padding for performance
        zoomSnap: 0.5, // Smoother zooming
        zoomDelta: 0.5, // Smoother zooming
        wheelDebounceTime: 40, // Debounce time for smoother mouse wheel zooming
        wheelPxPerZoomLevel: 60, // Less sensitive wheel zooming
        fadeAnimation: true, // Smooth fade on zoom
        markerZoomAnimation: true, // Animate markers when zooming
        inertia: true, // Smooth panning
        inertiaDeceleration: 3000 // Smoother panning deceleration
      });
      
      // Set up high-performance tile layer with optimized loading
      const baseTileLayer = L.tileLayer(
        mapTheme === 'dark' 
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', 
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19,
          updateWhenIdle: true, // Only load tiles when map is idle for better performance
          updateWhenZooming: false, // Don't update during zoom for smoother experience
          keepBuffer: 4, // Keep more tiles in memory for smoother panning
          tileSize: 256,
          detectRetina: true, // Support for retina displays
          crossOrigin: true // For better CORS handling
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
        maxZoom: 19,
        updateWhenIdle: true,
        updateWhenZooming: false,
        keepBuffer: 4
      }
    ).addTo(mapInstanceRef.current);
  }, [mapTheme]);
  
  // Navigate to selected region
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedRegion || !MAP_REGIONS[selectedRegion]) return;
    
    const map = mapInstanceRef.current;
    const regionData = MAP_REGIONS[selectedRegion];
    
    // Animate to the new region with smooth transition
    map.flyTo(regionData.center, regionData.zoom, {
      animate: true,
      duration: 1.5,
      easeLinearity: 0.25
    });
  }, [selectedRegion]);

  // Create vessel icon with Font Awesome (simplified version)
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
    let size = 24;
    if (vessel.vesselType) {
      if (vessel.vesselType.includes('VLCC') || vessel.vesselType.includes('ULCC')) {
        size = 32; // Larger for Very Large and Ultra Large Crude Carriers
      } else if (vessel.vesselType.includes('Aframax') || vessel.vesselType.includes('Suezmax')) {
        size = 28; // Large for medium-sized tankers
      }
    }
    
    // Choose appropriate icon based on vessel type
    let iconName = 'fa-ship';
    if (vessel.vesselType?.toLowerCase().includes('lng') || vessel.vesselType?.toLowerCase().includes('gas')) {
      iconName = 'fa-gas-pump';
    } else if (vessel.vesselType?.toLowerCase().includes('chemical')) {
      iconName = 'fa-vial';
    } else if (vessel.vesselType?.toLowerCase().includes('oil') || vessel.vesselType?.toLowerCase().includes('tanker')) {
      iconName = 'fa-oil-well';
    }
    
    // Create simple icon with Font Awesome
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
              opacity: 0.15;
              animation: pulse 2s infinite;
            "></div>
          ` : ''}
          <div style="
            position: absolute;
            transform: rotate(${rotation}deg);
            color: ${color};
            text-shadow: 0 0 4px rgba(255,255,255,0.7), 0 0 6px rgba(0,0,0,0.5);
            font-size: ${size}px;
            width: ${size}px;
            height: ${size}px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <i class="fa ${iconName}"></i>
          </div>
        </div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.15; }
            50% { transform: scale(1.3); opacity: 0.1; }
            100% { transform: scale(1); opacity: 0.15; }
          }
          @font-face {
            font-family: 'Font Awesome 5 Free';
            font-style: normal;
            font-weight: 900;
            font-display: block;
            src: url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/webfonts/fa-solid-900.woff2") format("woff2");
          }
          .fa {
            font-family: 'Font Awesome 5 Free';
            font-weight: 900;
          }
          .fa-ship:before {
            content: "\\f21a";
          }
          .fa-oil-well:before {
            content: "\\e532";
          }
          .fa-gas-pump:before {
            content: "\\f52f";
          }
          .fa-vial:before {
            content: "\\f492";
          }
        </style>
      `,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });
  };

  // Create port/refinery icons (simplified version)
  const createFacilityIcon = (facility: Facility) => {
    // Base colors for facilities
    const colors = {
      refinery: '#8b5cf6', // Purple
      port: '#3b82f6'      // Blue
    };
    
    // Select the color based on facility type
    const color = facility.type === 'refinery' ? colors.refinery : colors.port;
    
    // Determine the size based on capacity if available
    const baseSize = facility.type === 'refinery' ? 26 : 24;
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
    
    // Choose the appropriate Font Awesome icon
    const iconName = facility.type === 'refinery' ? 'fa-industry' : 'fa-anchor';
    
    // Create simple icon with Font Awesome
    return L.divIcon({
      className: `${facility.type}-marker`,
      html: `
        <div style="position: relative; width: ${size}px; height: ${size}px;">
          <div style="
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${color};
            text-shadow: 0 0 5px rgba(255,255,255,0.8), 0 0 7px rgba(0,0,0,0.4);
            font-size: ${size}px;
          ">
            <i class="fa ${iconName}"></i>
          </div>
          
          <!-- Facility name tooltip on hover -->
          <div style="
            position: absolute;
            bottom: ${size + 3}px;
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
          
          .fa-industry:before {
            content: "\\f275";
          }
          
          .fa-anchor:before {
            content: "\\f13d";
          }
        </style>
      `,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
      popupAnchor: [0, -size/2]
    });
  };

  // Check if coordinates are valid and in water
  const isLikelyInWater = (lat: number, lng: number): boolean => {
    // First, handle the case where coordinates are completely invalid
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      return false;
    }
    
    // Define specific known problematic coordinates to exclude
    const knownBadCoordinates = [
      // Coordinates from logs that show vessels on land
      { lat: -30.50, lng: 45.30, radius: 0.5 }, // Africa interior
      { lat: -15.60, lng: -15.70, radius: 0.5 }, // Africa interior
      { lat: -25.30, lng: 5.10, radius: 0.5 }, // Africa interior
      { lat: -25.30, lng: 135.20, radius: 0.5 }, // Australia interior
      { lat: 57.80, lng: -5.08, radius: 0.5 }, // Scotland interior
      { lat: 15.50, lng: 55.30, radius: 0.5 }, // Saudi Arabia interior
      { lat: -45.50, lng: -75.40, radius: 0.5 }, // South America interior
      { lat: 34.20, lng: 129.50, radius: 0.5 }, // Japan interior
      { lat: -35.80, lng: -65.20, radius: 0.5 }, // Argentina interior
      { lat: -36.80, lng: 150.40, radius: 0.5 }, // Australia southeast
      { lat: 20.50, lng: 38.20, radius: 0.5 }, // Saudi Arabia interior
      { lat: 20.40, lng: 122.50, radius: 0.5 }, // China interior
      { lat: -38.30, lng: 145.20, radius: 0.5 }, // Australia interior
      { lat: -32.50, lng: 115.80, radius: 0.5 }, // Australia west
      { lat: 25.30, lng: -50.40, radius: 0.5 }, // Qatar interior
      { lat: 23.07, lng: 56.53, radius: 0.5 }, // Oman interior
      { lat: 10.50, lng: -65.30, radius: 0.5 }, // Venezuela interior
      { lat: 22.50, lng: 119.80, radius: 0.5 }, // China interior
      { lat: 13.40, lng: 110.20, radius: 0.5 }, // Vietnam interior
      { lat: 35.80, lng: -140.20, radius: 0.5 }, // North Pacific questionable
    ];
    
    // Check against known problematic coordinates
    for (const badCoord of knownBadCoordinates) {
      const distance = Math.sqrt(
        Math.pow(lat - badCoord.lat, 2) + Math.pow(lng - badCoord.lng, 2)
      );
      
      if (distance <= badCoord.radius) {
        console.log(`Vessel at ${lat.toFixed(4)}, ${lng.toFixed(4)} matches known bad coordinate`);
        return false;
      }
    }
    
    // Define major water bodies as whitelist regions
    const waterBodies = [
      // Major oceans and seas
      { name: 'North Atlantic', minLat: 0, maxLat: 65, minLng: -80, maxLng: -5 },
      { name: 'South Atlantic', minLat: -60, maxLat: 0, minLng: -70, maxLng: 20 },
      { name: 'North Pacific', minLat: 0, maxLat: 65, minLng: 120, maxLng: -115 },
      { name: 'South Pacific', minLat: -60, maxLat: 0, minLng: 150, maxLng: -70 },
      { name: 'Indian Ocean', minLat: -50, maxLat: 25, minLng: 20, maxLng: 120 },
      { name: 'Mediterranean Sea', minLat: 30, maxLat: 45, minLng: -5, maxLng: 37 },
      { name: 'Red Sea', minLat: 12, maxLat: 30, minLng: 32, maxLng: 43 },
      { name: 'Persian Gulf', minLat: 23.5, maxLat: 30, minLng: 48, maxLng: 56.5 },
      { name: 'South China Sea', minLat: 0, maxLat: 25, minLng: 99, maxLng: 125 },
      { name: 'Caribbean Sea', minLat: 8, maxLat: 22, minLng: -88, maxLng: -59 },
      { name: 'Gulf of Mexico', minLat: 18, maxLat: 31, minLng: -98, maxLng: -80 },
      { name: 'Baltic Sea', minLat: 53, maxLat: 66, minLng: 10, maxLng: 30 },
      { name: 'North Sea', minLat: 51, maxLat: 62, minLng: -4, maxLng: 12 },
      { name: 'Bering Sea', minLat: 52, maxLat: 65, minLng: 162, maxLng: -157 },
      { name: 'Yellow Sea', minLat: 32, maxLat: 41, minLng: 118, maxLng: 127 },
      { name: 'Sea of Japan', minLat: 33, maxLat: 47, minLng: 127, maxLng: 142 },
      { name: 'East China Sea', minLat: 24, maxLat: 34, minLng: 118, maxLng: 131 },
      // Major shipping lanes
      { name: 'English Channel', minLat: 48.5, maxLat: 51.5, minLng: -5, maxLng: 2 },
      { name: 'Strait of Malacca', minLat: -3, maxLat: 6, minLng: 95, maxLng: 105 },
      { name: 'Panama Canal Route', minLat: 7, maxLat: 10, minLng: -83, maxLng: -77 },
      { name: 'Suez Canal Route', minLat: 27, maxLat: 32, minLng: 31, maxLng: 33 },
    ];
    
    // Check if coordinates are in any known water body (whitelist approach)
    for (const water of waterBodies) {
      if (
        lat >= water.minLat && lat <= water.maxLat &&
        lng >= water.minLng && lng <= water.maxLng
      ) {
        return true;
      }
    }
    
    // If not in any of the defined water bodies, assume it's on land
    // This is a more conservative approach but will avoid showing vessels in unlikely places
    console.log(`Vessel at ${lat.toFixed(4)}, ${lng.toFixed(4)} not in any known water body`);
    return false;
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
        
        if (!isNaN(lat) && !isNaN(lng) && isLikelyInWater(lat, lng)) {
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
          refineriesData = refineriesResponse.refineries.map((refinery: Record<string, any>) => ({
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
    
    // Set up auto-refresh every 15 minutes
    const intervalId = setInterval(() => {
      fetchVesselData();
    }, 15 * 60 * 1000);
    
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
                
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Region</label>
                  <Select
                    value={selectedRegion}
                    onValueChange={(value) => setSelectedRegion(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(MAP_REGIONS).map(([id, region]) => (
                        <SelectItem key={id} value={id}>{region.label}</SelectItem>
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
      
      {/* Vessel info panel - Modern Design */}
      {infoOpen && selectedVessel && (
        <div className="absolute right-0 top-0 h-full z-20 transition-all duration-300 translate-x-0">
          <div className="w-96 h-full bg-background/95 backdrop-blur-md border-l border-border shadow-lg flex flex-col">
            <div className="bg-primary/10 px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold flex items-center">
                  <i className="fa fa-ship mr-3 text-primary"></i>
                  {selectedVessel.name}
                </h2>
                {selectedVessel.flag && (
                  <p className="text-sm text-muted-foreground mt-1 flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                    {selectedVessel.flag}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8"
                onClick={() => setInfoOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Status badges */}
            <div className="px-6 py-4 bg-background/80 border-b border-border/50 flex items-center gap-2 flex-wrap">
              <Badge className={`text-sm px-3 py-1 ${
                selectedVessel.status === 'At Sea' || selectedVessel.status === 'Underway' 
                  ? 'bg-green-500/20 text-green-700 hover:bg-green-500/30 border-green-500/50' 
                : selectedVessel.status === 'In Port' || selectedVessel.status === 'Moored' || selectedVessel.status === 'Anchored' 
                  ? 'bg-amber-500/20 text-amber-700 hover:bg-amber-500/30 border-amber-500/50' 
                : selectedVessel.status === 'Delayed' || selectedVessel.status === 'Not Moving' 
                  ? 'bg-red-500/20 text-red-700 hover:bg-red-500/30 border-red-500/50' 
                : 'bg-slate-500/20 text-slate-700 hover:bg-slate-500/30 border-slate-500/50'}`}>
                <div className={`w-2 h-2 rounded-full mr-1.5 inline-block ${
                  selectedVessel.status === 'At Sea' || selectedVessel.status === 'Underway' 
                    ? 'bg-green-500' 
                  : selectedVessel.status === 'In Port' || selectedVessel.status === 'Moored' || selectedVessel.status === 'Anchored' 
                    ? 'bg-amber-500' 
                  : selectedVessel.status === 'Delayed' || selectedVessel.status === 'Not Moving' 
                    ? 'bg-red-500' 
                  : 'bg-slate-500'}`} />
                {selectedVessel.status || 'Unknown Status'}
              </Badge>
              
              <Badge variant="outline" className="bg-background/70 text-sm px-3 py-1">
                {selectedVessel.vesselType || 'Unknown Type'}
              </Badge>
              
              {selectedVessel.speed !== undefined && selectedVessel.speed > 0 && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-sm px-3 py-1">
                  <Navigation className="h-3 w-3 mr-1" />
                  {selectedVessel.speed} knots
                </Badge>
              )}
            </div>
            
            {/* Content area with vessel data */}
            <div className="flex-1 overflow-auto">
              
              {/* Basic details */}
              <div className="px-6 py-4">
                <h3 className="text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-3 flex items-center">
                  <Info className="h-3.5 w-3.5 mr-1.5" />
                  Vessel Information
                </h3>
                
                <div className="bg-card rounded-lg border border-border/50 divide-y divide-border/50">
                  {selectedVessel.imo && (
                    <div className="flex items-center px-4 py-2.5">
                      <span className="text-sm text-muted-foreground w-1/3">IMO Number:</span>
                      <span className="text-sm font-medium">{selectedVessel.imo}</span>
                    </div>
                  )}
                  
                  {selectedVessel.mmsi && (
                    <div className="flex items-center px-4 py-2.5">
                      <span className="text-sm text-muted-foreground w-1/3">MMSI:</span>
                      <span className="text-sm font-medium">{selectedVessel.mmsi}</span>
                    </div>
                  )}
                  
                  {selectedVessel.currentLat && selectedVessel.currentLng && (
                    <div className="flex items-center px-4 py-2.5">
                      <span className="text-sm text-muted-foreground w-1/3">Position:</span>
                      <span className="text-sm font-medium">
                        {typeof selectedVessel.currentLat === 'string' 
                          ? parseFloat(selectedVessel.currentLat).toFixed(4) 
                          : selectedVessel.currentLat?.toFixed(4)}, 
                        {typeof selectedVessel.currentLng === 'string' 
                          ? parseFloat(selectedVessel.currentLng).toFixed(4) 
                          : selectedVessel.currentLng?.toFixed(4)}
                      </span>
                    </div>
                  )}
                  
                  {selectedVessel.course !== undefined && (
                    <div className="flex items-center px-4 py-2.5">
                      <span className="text-sm text-muted-foreground w-1/3">Heading:</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium flex items-center">
                          {selectedVessel.course}°
                          <span style={{
                            display: 'inline-block',
                            width: '18px',
                            height: '18px',
                            transform: `rotate(${selectedVessel.course}deg)`,
                            marginLeft: '8px'
                          }}>
                            <i className="fa fa-arrow-up text-primary/70 text-xs"></i>
                          </span>
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">
                          {selectedVessel.course >= 337.5 || selectedVessel.course < 22.5 ? 'North' :
                          selectedVessel.course >= 22.5 && selectedVessel.course < 67.5 ? 'Northeast' :
                          selectedVessel.course >= 67.5 && selectedVessel.course < 112.5 ? 'East' :
                          selectedVessel.course >= 112.5 && selectedVessel.course < 157.5 ? 'Southeast' :
                          selectedVessel.course >= 157.5 && selectedVessel.course < 202.5 ? 'South' :
                          selectedVessel.course >= 202.5 && selectedVessel.course < 247.5 ? 'Southwest' :
                          selectedVessel.course >= 247.5 && selectedVessel.course < 292.5 ? 'West' :
                          'Northwest'}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {selectedVessel.cargoType && (
                    <div className="flex items-center px-4 py-2.5">
                      <span className="text-sm text-muted-foreground w-1/3">Cargo:</span>
                      <span className="text-sm font-medium">{selectedVessel.cargoType}</span>
                    </div>
                  )}

                  {/* Vessel Performance Section */}
                  <div className="flex items-center px-4 py-2.5 bg-primary/5">
                    <span className="text-sm text-muted-foreground w-1/3">Status:</span>
                    <span className="text-sm font-medium flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-1.5 ${
                        selectedVessel.status === 'At Sea' || selectedVessel.status === 'Underway' 
                          ? 'bg-green-500' 
                        : selectedVessel.status === 'In Port' || selectedVessel.status === 'Moored' || selectedVessel.status === 'Anchored' 
                          ? 'bg-amber-500' 
                        : selectedVessel.status === 'Delayed' || selectedVessel.status === 'Not Moving' 
                          ? 'bg-red-500' 
                        : 'bg-slate-500'}`} />
                      {selectedVessel.status || 'Unknown'}
                    </span>
                  </div>

                  {/* Ship Specifications */}
                  <div className="px-4 py-3 bg-card/50">
                    <div className="mb-2">
                      <h4 className="text-xs uppercase tracking-wider text-muted-foreground/80 font-medium">Ship Specifications</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Vessel Type</p>
                        <p className="text-sm font-medium">{selectedVessel.vesselType || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Flag</p>
                        <p className="text-sm font-medium">{selectedVessel.flag || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Est. Capacity</p>
                        <p className="text-sm font-medium">
                          {selectedVessel.vesselType?.includes('VLCC') ? '270,000-320,000 DWT' : 
                           selectedVessel.vesselType?.includes('Suezmax') ? '120,000-200,000 DWT' :
                           selectedVessel.vesselType?.includes('Aframax') ? '80,000-120,000 DWT' :
                           selectedVessel.vesselType?.includes('Panamax') ? '60,000-80,000 DWT' :
                           selectedVessel.vesselType?.includes('Handysize') ? '20,000-60,000 DWT' :
                           'Not Available'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Cargo Capacity</p>
                        <p className="text-sm font-medium">
                          {selectedVessel.vesselType?.includes('VLCC') ? '~2 million barrels' : 
                           selectedVessel.vesselType?.includes('Suezmax') ? '~1 million barrels' :
                           selectedVessel.vesselType?.includes('Aframax') ? '~700,000 barrels' :
                           selectedVessel.vesselType?.includes('Panamax') ? '~500,000 barrels' :
                           selectedVessel.vesselType?.includes('Handysize') ? '~250,000 barrels' :
                           'Not Available'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Voyage details */}
              {(selectedVessel.lastPort || selectedVessel.destination) && (
                <div className="px-6 pb-4">
                  <h3 className="text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-3 flex items-center">
                    <Navigation className="h-3.5 w-3.5 mr-1.5" />
                    Voyage Details
                  </h3>
                  
                  <div className="bg-card rounded-lg border border-border/50 overflow-hidden">
                    {/* Animated Route Information */}
                    <div className="p-4 border-b border-border/50">
                      <div className="flex justify-between items-start mb-3">
                        {/* Origin Port */}
                        {selectedVessel.lastPort ? (
                          <div className="text-left flex-1">
                            <div className="flex items-center">
                              <div className="h-3 w-3 rounded-full bg-blue-500 mr-2 animate-pulse"></div>
                              <p className="text-sm font-medium">Origin</p>
                            </div>
                            <p className="text-sm font-medium ml-5 mt-1">{selectedVessel.lastPort}</p>
                            {selectedVessel.departureTime && (
                              <p className="text-xs text-muted-foreground ml-5">
                                {formatDate(selectedVessel.departureTime)}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-left flex-1">
                            <div className="flex items-center">
                              <div className="h-3 w-3 rounded-full bg-blue-500/50 mr-2"></div>
                              <p className="text-sm text-muted-foreground">Origin</p>
                            </div>
                            <p className="text-sm text-muted-foreground ml-5 mt-1">Unknown</p>
                          </div>
                        )}
                        
                        {/* Destination Port */}
                        {selectedVessel.destination ? (
                          <div className="text-right flex-1">
                            <div className="flex items-center justify-end">
                              <p className="text-sm font-medium">Destination</p>
                              <div className="h-3 w-3 rounded-full bg-green-500 ml-2"></div>
                            </div>
                            <p className="text-sm font-medium mr-5 mt-1">{selectedVessel.destination}</p>
                            {selectedVessel.estimatedArrival && (
                              <p className="text-xs text-muted-foreground mr-5">
                                ETA: {formatDate(selectedVessel.estimatedArrival)}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-right flex-1">
                            <div className="flex items-center justify-end">
                              <p className="text-sm text-muted-foreground">Destination</p>
                              <div className="h-3 w-3 rounded-full bg-green-500/50 ml-2"></div>
                            </div>
                            <p className="text-sm text-muted-foreground mr-5 mt-1">Unknown</p>
                          </div>
                        )}
                      </div>
                    
                      {/* Animated Route Line */}
                      <div className="relative h-3 flex items-center justify-between px-3 mt-4 mb-1">
                        {/* Start point */}
                        <div className="z-10 h-3 w-3 rounded-full bg-blue-500"></div>
                        
                        {/* Route line with ship */}
                        <div className="absolute left-0 right-0 h-0.5 bg-border">
                          {/* Animated vessel */}
                          {selectedVessel.departureTime && selectedVessel.estimatedArrival && (
                            <div 
                              className="absolute top-1/2 transform -translate-y-1/2"
                              style={{
                                left: (() => {
                                  // Calculate vessel position
                                  const departureTime = new Date(selectedVessel.departureTime).getTime();
                                  const arrivalTime = new Date(selectedVessel.estimatedArrival).getTime();
                                  const currentTime = new Date().getTime();
                                  
                                  // Calculate progress percentage
                                  let progressPercent = 0;
                                  if (currentTime >= arrivalTime) {
                                    progressPercent = 100;
                                  } else if (currentTime <= departureTime) {
                                    progressPercent = 0;
                                  } else {
                                    const totalDuration = arrivalTime - departureTime;
                                    const elapsed = currentTime - departureTime;
                                    progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
                                  }
                                  
                                  return `${progressPercent}%`;
                                })()
                              }}
                            >
                              <div
                                className="text-xs text-primary"
                                style={{
                                  transform: `rotate(${selectedVessel.course || 0}deg)`,
                                  marginTop: '-10px',
                                  marginLeft: '-8px'
                                }}
                              >
                                <i className="fa fa-ship"></i>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* End point */}
                        <div className="z-10 h-3 w-3 rounded-full bg-green-500"></div>
                      </div>
                      
                      {/* Distance and Duration */}
                      <div className="flex justify-between mt-4 text-xs text-muted-foreground px-1">
                        <span>
                          {(() => {
                            if (!selectedVessel.lastPort || !selectedVessel.destination) return 'Unknown distance';
                            // Estimate distance based on vessel type and speed
                            const speedEstimate = selectedVessel.speed || 12; // knots
                            const days = selectedVessel.departureTime && selectedVessel.estimatedArrival ? 
                                     (new Date(selectedVessel.estimatedArrival).getTime() - new Date(selectedVessel.departureTime).getTime()) / (1000 * 60 * 60 * 24) : 
                                     0;
                                     
                            const distance = Math.round(days * speedEstimate * 24);
                            return `~${distance} nautical miles`;
                          })()}
                        </span>
                        <span>
                          {selectedVessel.departureTime && selectedVessel.estimatedArrival ? 
                            (() => {
                              const days = (new Date(selectedVessel.estimatedArrival).getTime() - new Date(selectedVessel.departureTime).getTime()) / (1000 * 60 * 60 * 24);
                              return `${Math.round(days)} days journey`;
                            })() : 
                            'Duration unknown'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Voyage Progress */}
                    {selectedVessel.departureTime && selectedVessel.estimatedArrival && (
                      <div className="px-4 pb-4">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Departure</span>
                          <span>Arrival</span>
                        </div>
                        
                        {(() => {
                          // Calculate voyage progress
                          const departureTime = new Date(selectedVessel.departureTime).getTime();
                          const arrivalTime = new Date(selectedVessel.estimatedArrival).getTime();
                          const currentTime = new Date().getTime();
                          
                          // Calculate progress percentage
                          let progressPercent = 0;
                          if (currentTime >= arrivalTime) {
                            progressPercent = 100;
                          } else if (currentTime <= departureTime) {
                            progressPercent = 0;
                          } else {
                            const totalDuration = arrivalTime - departureTime;
                            const elapsed = currentTime - departureTime;
                            progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
                          }
                          
                          // Calculate remaining time
                          const remainingMs = arrivalTime - currentTime;
                          const remainingHours = Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60)));
                          const remainingDays = Math.floor(remainingHours / 24);
                          const hoursAfterDays = remainingHours % 24;
                          
                          const remainingTimeText = remainingMs <= 0 
                            ? 'Arrived/Arriving' 
                            : remainingDays > 0 
                              ? `${remainingDays}d ${hoursAfterDays}h remaining` 
                              : `${remainingHours}h remaining`;
                          
                          return (
                            <>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full" 
                                  style={{ width: `${progressPercent}%` }}
                                ></div>
                              </div>
                              <div className="mt-1 text-xs flex justify-center text-muted-foreground">
                                {remainingTimeText}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                    
                    {/* Additional voyage info */}
                    {selectedVessel.speed !== undefined && (
                      <div className="px-4 pb-4 border-t border-border/50 pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Navigation className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
                            <span className="text-sm">Current Speed</span>
                          </div>
                          <span className="text-sm font-medium">{selectedVessel.speed} knots</span>
                        </div>
                        
                        {/* Estimated daily distance */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center">
                            <MapPin className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
                            <span className="text-sm">Est. Daily Distance</span>
                          </div>
                          <span className="text-sm font-medium">~{Math.round(selectedVessel.speed * 24)} nm</span>
                        </div>
                        
                        {/* Estimated transit time */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
                            <span className="text-sm">Transit Efficiency</span>
                          </div>
                          <span className="text-sm font-medium">
                            {selectedVessel.speed < 2 ? 'Stationary' : 
                             selectedVessel.speed < 8 ? 'Slow Steaming' : 
                             selectedVessel.speed < 12 ? 'Economical' : 
                             selectedVessel.speed < 16 ? 'Standard' : 'High Speed'}
                          </span>
                        </div>
                        
                        {/* Fuel consumption estimate */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center">
                            <Fuel className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
                            <span className="text-sm">Est. Fuel Consumption</span>
                          </div>
                          <span className="text-sm font-medium">
                            {(() => {
                              // Estimate fuel consumption based on vessel type and speed
                              let baseFuel = 0;
                              if (selectedVessel.vesselType?.includes('VLCC')) {
                                baseFuel = 80; // tons per day at economic speed
                              } else if (selectedVessel.vesselType?.includes('Suezmax')) {
                                baseFuel = 55;
                              } else if (selectedVessel.vesselType?.includes('Aframax')) {
                                baseFuel = 40;
                              } else if (selectedVessel.vesselType?.includes('Panamax')) {
                                baseFuel = 30;
                              } else {
                                baseFuel = 20;
                              }
                              
                              // Speed factor: consumption increases exponentially with speed
                              const speedFactor = Math.pow(selectedVessel.speed / 12, 3);
                              const estimatedConsumption = selectedVessel.speed < 2 ? 
                                "Minimal" : `~${Math.round(baseFuel * speedFactor)} tons/day`;
                              
                              return estimatedConsumption;
                            })()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
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