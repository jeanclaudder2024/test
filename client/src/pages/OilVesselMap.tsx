import { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  X, 
  Ship, 
  MapPin, 
  Navigation, 
  Anchor, 
  Factory, 
  Info, 
  Filter, 
  ChevronLeft,
  ChevronRight,
  Clock,
  Droplets as Fuel
} from 'lucide-react';

// Vessel interface
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
  speed?: string | number;
  destination?: string;
  estimatedArrival?: string | Date;
  lastPort?: string;
  cargoType?: string;
  status?: string;
  departureTime?: string | Date;
  isConnected?: boolean;
  connectionType?: string;
  cargoVolume?: string;
  connectionStartDate?: string | Date;
  connectionEndDate?: string | Date;
  connectionStatus?: string;
  refineryId?: number;
}

// Facility interface
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

// Map regions
const MAP_REGIONS: Record<string, { center: [number, number], zoom: number, label: string }> = {
  'global': { center: [20, 0], zoom: 2, label: 'Global View' },
  'north-america': { center: [40, -100], zoom: 4, label: 'North America' },
  'middle-east': { center: [28, 45], zoom: 4, label: 'Middle East' },
  'asia-pacific': { center: [20, 110], zoom: 3, label: 'Asia Pacific' },
  'europe': { center: [50, 10], zoom: 4, label: 'Europe' },
  'africa': { center: [0, 20], zoom: 3, label: 'Africa' }
};

export default function OilVesselMap() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('global');
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [showRefineries, setShowRefineries] = useState(true);
  const [showPorts, setShowPorts] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  // Create professional vessel icon 
  const createVesselIcon = (vessel: Vessel) => {
    let color = '#64748b'; // Default gray
    let statusColor = '#64748b';
    
    if (vessel.status) {
      const status = vessel.status.toLowerCase();
      if (status.includes('underway') || status.includes('at sea') || status.includes('sailing')) {
        color = '#22c55e'; // Green for moving
        statusColor = '#16a34a';
      } else if (status.includes('anchored') || status.includes('moored') || status.includes('in port')) {
        color = '#3b82f6'; // Blue for in port
        statusColor = '#2563eb';
      } else if (status.includes('delayed') || status.includes('not moving')) {
        color = '#f59e0b'; // Orange for delayed
        statusColor = '#d97706';
      }
    }
    
    const rotation = vessel.course !== undefined ? vessel.course : 0;
    let size = 18;
    let vesselShape = 'tanker';
    
    if (vessel.vesselType) {
      const type = vessel.vesselType.toLowerCase();
      if (type.includes('vlcc') || type.includes('ulcc')) {
        size = 24;
        vesselShape = 'supertanker';
      } else if (type.includes('aframax') || type.includes('suezmax')) {
        size = 22;
        vesselShape = 'largetanker';
      } else if (type.includes('lng') || type.includes('lpg')) {
        size = 20;
        vesselShape = 'gastanker';
      } else if (type.includes('chemical')) {
        size = 18;
        vesselShape = 'chemical';
      }
    }
    
    const createShipSVG = () => {
      switch (vesselShape) {
        case 'supertanker':
          return `
            <path d="M2 10 L22 10 L20 6 L18 6 L18 4 L16 4 L16 6 L14 6 L14 4 L12 4 L12 6 L10 6 L10 4 L8 4 L8 6 L6 6 L6 4 L4 4 L4 6 L2 6 Z M1 12 L23 12 L22 14 L2 14 Z" fill="${color}"/>
            <circle cx="6" cy="8" r="1" fill="white"/>
            <circle cx="12" cy="8" r="1" fill="white"/>
            <circle cx="18" cy="8" r="1" fill="white"/>
          `;
        case 'largetanker':
          return `
            <path d="M3 10 L21 10 L19 7 L17 7 L17 5 L15 5 L15 7 L13 7 L13 5 L11 5 L11 7 L9 7 L9 5 L7 5 L7 7 L5 7 L5 5 L3 5 Z M2 12 L22 12 L21 14 L3 14 Z" fill="${color}"/>
            <circle cx="8" cy="8" r="1" fill="white"/>
            <circle cx="16" cy="8" r="1" fill="white"/>
          `;
        case 'gastanker':
          return `
            <path d="M4 10 L20 10 L18 7 L16 7 L16 4 L14 4 L14 7 L10 7 L10 4 L8 4 L8 7 L6 7 L6 4 L4 4 Z M3 12 L21 12 L20 14 L4 14 Z" fill="${color}"/>
            <circle cx="8" cy="6" r="2" fill="white" stroke="${color}" stroke-width="1"/>
            <circle cx="16" cy="6" r="2" fill="white" stroke="${color}" stroke-width="1"/>
          `;
        case 'chemical':
          return `
            <path d="M4 10 L20 10 L18 8 L16 8 L16 6 L14 6 L14 8 L10 8 L10 6 L8 6 L8 8 L6 8 L6 6 L4 6 Z M3 12 L21 12 L20 14 L4 14 Z" fill="${color}"/>
            <rect x="7" y="7" width="2" height="2" fill="white"/>
            <rect x="15" y="7" width="2" height="2" fill="white"/>
          `;
        default:
          return `
            <path d="M4 10 L20 10 L18 8 L6 8 L6 6 L18 6 L18 4 L6 4 Z M3 12 L21 12 L20 14 L4 14 Z" fill="${color}"/>
            <rect x="8" y="7" width="8" height="1" fill="white"/>
          `;
      }
    };
    
    return L.divIcon({
      className: 'professional-vessel-marker',
      html: `
        <div style="
          position: relative;
          width: ${size}px;
          height: ${size}px;
          transform: rotate(${rotation}deg);
        ">
          ${vessel.speed && parseFloat(vessel.speed.toString()) > 3 ? `
            <div style="
              position: absolute;
              width: ${size + 6}px;
              height: ${size + 6}px;
              top: -3px;
              left: -3px;
              border-radius: 50%;
              background-color: ${statusColor};
              opacity: 0.2;
              animation: vesselPulse 2s infinite;
            "></div>
          ` : ''}
          <svg width="${size}" height="${size}" viewBox="0 0 24 24" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
            ${createShipSVG()}
          </svg>
        </div>
        <style>
          @keyframes vesselPulse {
            0% { transform: scale(1); opacity: 0.2; }
            50% { transform: scale(1.2); opacity: 0.1; }
            100% { transform: scale(1); opacity: 0.2; }
          }
          .professional-vessel-marker {
            transition: transform 0.3s ease;
          }
          .professional-vessel-marker:hover {
            transform: scale(1.1) !important;
            z-index: 1000;
          }
        </style>
      `,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });
  };

  // Create professional facility icons
  const createFacilityIcon = (facility: Facility) => {
    const colors = {
      refinery: '#8b5cf6',
      port: '#0ea5e9',
      oilTerminal: '#f97316',
      gasTerminal: '#10b981'
    };
    
    let color = colors.port;
    let facilityType = 'port';
    
    if (facility.type === 'refinery') {
      color = colors.refinery;
      facilityType = 'refinery';
    } else if (facility.name?.toLowerCase().includes('oil') || facility.description?.toLowerCase().includes('oil')) {
      color = colors.oilTerminal;
      facilityType = 'oilTerminal';
    } else if (facility.name?.toLowerCase().includes('gas') || facility.name?.toLowerCase().includes('lng')) {
      color = colors.gasTerminal;
      facilityType = 'gasTerminal';
    }
    
    const baseSize = facility.type === 'refinery' ? 22 : 20;
    let size = baseSize;
    
    if (facility.capacity) {
      if (facility.capacity > 500000) {
        size = baseSize + 6;
      } else if (facility.capacity > 200000) {
        size = baseSize + 4;
      } else if (facility.capacity > 100000) {
        size = baseSize + 2;
      }
    }
    
    const createFacilitySVG = () => {
      switch (facilityType) {
        case 'refinery':
          return `
            <circle cx="12" cy="12" r="10" fill="white" stroke="${color}" stroke-width="2"/>
            <path d="M6 18V10L8 8H10V6H14V8H16L18 10V18M8 14H10M14 14H16M6 18H18" stroke="${color}" stroke-width="1.5" fill="none"/>
            <circle cx="12" cy="11" r="1.5" fill="${color}"/>
          `;
        case 'oilTerminal':
          return `
            <circle cx="12" cy="12" r="10" fill="white" stroke="${color}" stroke-width="2"/>
            <path d="M8 16V8H16V16M10 10H14M10 12H14M10 14H14" stroke="${color}" stroke-width="1.5" fill="none"/>
            <circle cx="12" cy="6" r="1" fill="${color}"/>
          `;
        case 'gasTerminal':
          return `
            <circle cx="12" cy="12" r="10" fill="white" stroke="${color}" stroke-width="2"/>
            <circle cx="9" cy="10" r="2" stroke="${color}" stroke-width="1.5" fill="none"/>
            <circle cx="15" cy="10" r="2" stroke="${color}" stroke-width="1.5" fill="none"/>
            <path d="M7 14H17M9 16H15" stroke="${color}" stroke-width="1.5"/>
          `;
        default:
          return `
            <circle cx="12" cy="12" r="10" fill="white" stroke="${color}" stroke-width="2"/>
            <path d="M8 16L12 12L16 16M12 12V6M10 8L12 6L14 8" stroke="${color}" stroke-width="1.5" fill="none"/>
            <path d="M8 18H16" stroke="${color}" stroke-width="1.5"/>
          `;
      }
    };
    
    return L.divIcon({
      className: `professional-facility-marker ${facilityType}-marker`,
      html: `
        <div style="
          position: relative;
          width: ${size}px;
          height: ${size}px;
        ">
          <svg width="${size}" height="${size}" viewBox="0 0 24 24" style="
            filter: drop-shadow(0 3px 6px rgba(0,0,0,0.2));
            transition: transform 0.2s ease;
          ">
            ${createFacilitySVG()}
          </svg>
        </div>
        <style>
          .professional-facility-marker:hover svg {
            transform: scale(1.1);
          }
          .professional-facility-marker {
            cursor: pointer;
          }
        </style>
      `,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });
  };

  // Filter vessels based on search
  const filteredVessels = useMemo(() => {
    if (!search.trim()) return vessels;
    
    const searchLower = search.toLowerCase();
    return vessels.filter(vessel => 
      vessel.name.toLowerCase().includes(searchLower) ||
      vessel.imo?.toLowerCase().includes(searchLower) ||
      vessel.mmsi?.toLowerCase().includes(searchLower) ||
      vessel.vesselType.toLowerCase().includes(searchLower) ||
      vessel.flag?.toLowerCase().includes(searchLower) ||
      vessel.destination?.toLowerCase().includes(searchLower) ||
      vessel.cargoType?.toLowerCase().includes(searchLower)
    );
  }, [vessels, search]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map);

    const markers = L.layerGroup().addTo(map);
    
    mapInstanceRef.current = map;
    markersRef.current = markers;

    return () => {
      map.remove();
    };
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [vesselsData, portsData, refineriesData] = await Promise.all([
          apiRequest('/api/vessels'),
          apiRequest('/api/ports'),
          apiRequest('/api/refineries')
        ]);

        setVessels(vesselsData || []);
        
        const allFacilities = [
          ...(portsData || []).map((port: any) => ({ ...port, type: 'port' as const })),
          ...(refineriesData || []).map((refinery: any) => ({ ...refinery, type: 'refinery' as const }))
        ];
        setFacilities(allFacilities);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update map markers
  useEffect(() => {
    if (!markersRef.current || !mapInstanceRef.current) return;

    markersRef.current.clearLayers();

    // Add vessel markers
    filteredVessels.forEach(vessel => {
      const lat = parseFloat(vessel.currentLat?.toString() || '0');
      const lng = parseFloat(vessel.currentLng?.toString() || '0');
      
      if (lat && lng) {
        const marker = L.marker([lat, lng], {
          icon: createVesselIcon(vessel)
        });

        const popupContent = `
          <div class="p-3 min-w-[200px]">
            <h3 class="font-semibold text-sm mb-2">${vessel.name}</h3>
            <div class="space-y-1 text-xs">
              <div><strong>Type:</strong> ${vessel.vesselType}</div>
              <div><strong>IMO:</strong> ${vessel.imo || 'N/A'}</div>
              <div><strong>Flag:</strong> ${vessel.flag || 'N/A'}</div>
              <div><strong>Status:</strong> ${vessel.status || 'Unknown'}</div>
              ${vessel.speed ? `<div><strong>Speed:</strong> ${vessel.speed} kts</div>` : ''}
              ${vessel.destination ? `<div><strong>Destination:</strong> ${vessel.destination}</div>` : ''}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => setSelectedVessel(vessel));
        markersRef.current?.addLayer(marker);
      }
    });

    // Add facility markers
    facilities.forEach(facility => {
      const shouldShow = (facility.type === 'refinery' && showRefineries) || 
                        (facility.type === 'port' && showPorts);
      
      if (!shouldShow) return;

      const lat = parseFloat(facility.lat?.toString() || '0');
      const lng = parseFloat(facility.lng?.toString() || '0');
      
      if (lat && lng) {
        const marker = L.marker([lat, lng], {
          icon: createFacilityIcon(facility)
        });

        const popupContent = `
          <div class="p-3 min-w-[200px]">
            <h3 class="font-semibold text-sm mb-2">${facility.name}</h3>
            <div class="space-y-1 text-xs">
              <div><strong>Type:</strong> ${facility.type}</div>
              <div><strong>Country:</strong> ${facility.country}</div>
              ${facility.capacity ? `<div><strong>Capacity:</strong> ${facility.capacity.toLocaleString()}</div>` : ''}
              ${facility.description ? `<div><strong>Description:</strong> ${facility.description}</div>` : ''}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        markersRef.current?.addLayer(marker);
      }
    });
  }, [filteredVessels, facilities, showRefineries, showPorts]);

  // Handle region change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const region = MAP_REGIONS[selectedRegion];
    mapInstanceRef.current.setView(region.center, region.zoom, {
      animate: true,
      duration: 1.5
    });
  }, [selectedRegion]);

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-background">
      {/* Map container */}
      <div ref={mapRef} className="absolute inset-0 z-0" />
      
      {/* Top search bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-2xl px-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search vessels by name, IMO, MMSI, type, flag, or destination..."
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



      {/* Vessel details panel */}
      {selectedVessel && (
        <div className="absolute bottom-4 left-4 z-10 w-80">
          <Card className="bg-card/95 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{selectedVessel.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedVessel(null)}
                  className="h-6 w-6"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium">Type:</span>
                  <div>{selectedVessel.vesselType}</div>
                </div>
                <div>
                  <span className="font-medium">IMO:</span>
                  <div>{selectedVessel.imo || 'N/A'}</div>
                </div>
                <div>
                  <span className="font-medium">Flag:</span>
                  <div>{selectedVessel.flag || 'N/A'}</div>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <div>{selectedVessel.status || 'Unknown'}</div>
                </div>
                {selectedVessel.speed && (
                  <div>
                    <span className="font-medium">Speed:</span>
                    <div>{selectedVessel.speed} knots</div>
                  </div>
                )}
                {selectedVessel.destination && (
                  <div className="col-span-2">
                    <span className="font-medium">Destination:</span>
                    <div>{selectedVessel.destination}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-background/50 backdrop-blur-sm flex items-center justify-center">
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span>Loading vessel data...</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}