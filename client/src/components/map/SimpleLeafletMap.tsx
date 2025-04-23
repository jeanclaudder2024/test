import { useEffect, useRef, useState, useMemo } from 'react';
import { Vessel, Refinery, Region } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import { Info, Map, Navigation, Globe2 } from 'lucide-react';
import { mapStyles, LanguageOption } from './MapStyles';
import MapContainer from './MapContainer';

// Define Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

// Region center positions
const regionPositions: Record<string, { lat: number; lng: number; zoom: number }> = {
  'north-america': { lat: 40, lng: -100, zoom: 3 },
  'south-america': { lat: -15, lng: -60, zoom: 3 },
  'central-america': { lat: 15, lng: -85, zoom: 4 },
  'western-europe': { lat: 50, lng: 0, zoom: 4 },
  'eastern-europe': { lat: 50, lng: 25, zoom: 4 },
  'middle-east': { lat: 28, lng: 45, zoom: 4 },
  'north-africa': { lat: 25, lng: 20, zoom: 4 },
  'southern-africa': { lat: -10, lng: 20, zoom: 3 },
  'russia': { lat: 60, lng: 80, zoom: 3 },
  'china': { lat: 35, lng: 105, zoom: 4 },
  'asia-pacific': { lat: 20, lng: 110, zoom: 3 },
  'southeast-asia-oceania': { lat: -10, lng: 130, zoom: 3 }
};

interface SimpleLeafletMapProps {
  vessels: Vessel[];
  refineries: Refinery[];
  selectedRegion: Region | null;
  trackedVessel?: Vessel | null;
  onVesselClick: (vessel: Vessel) => void;
  onRefineryClick?: (refinery: Refinery) => void;
  isLoading?: boolean;
  initialCenter?: [number, number]; // Optional [lat, lng] initial center
  initialZoom?: number;             // Optional initial zoom level
}

// Create a unique ID for this map instance
const MAP_CONTAINER_ID = 'leaflet-map-container';

export default function SimpleLeafletMap({
  vessels,
  refineries,
  selectedRegion,
  trackedVessel,
  onVesselClick,
  onRefineryClick,
  isLoading = false,
  initialCenter,
  initialZoom
}: SimpleLeafletMapProps) {
  // Generate a stable instance ID for this component
  const instanceId = useMemo(() => `map-${Math.random().toString(36).substring(2, 9)}`, []);
  
  const mapRef = useRef<any>(null);
  const vesselMarkersRef = useRef<any[]>([]);
  const refineryMarkersRef = useRef<any[]>([]);
  const [mapStyle, setMapStyle] = useState(mapStyles[0].id);
  const [mapLanguage, setMapLanguage] = useState<LanguageOption>('en');
  const [isMapReady, setIsMapReady] = useState(false);
  const [displayVessels, setDisplayVessels] = useState<Vessel[]>([]);
  
  // Setup the custom event listener for tracking vessels
  useEffect(() => {
    const handleTrackVessel = (event: Event) => {
      const customEvent = event as CustomEvent<{ id: number }>;
      const vesselId = customEvent.detail?.id;
      
      if (vesselId) {
        const vessel = vessels.find(v => v.id === vesselId);
        if (vessel) {
          onVesselClick(vessel);
        }
      }
    };
    
    window.addEventListener('track-vessel', handleTrackVessel);
    
    return () => {
      window.removeEventListener('track-vessel', handleTrackVessel);
    };
  }, [vessels, onVesselClick]);

  // Load Leaflet once when the component mounts
  useEffect(() => {
    if (window.L) {
      setIsMapReady(true);
      return;
    }
    
    // Add Leaflet CSS
    const linkEl = document.createElement('link');
    linkEl.rel = 'stylesheet';
    linkEl.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    linkEl.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    linkEl.crossOrigin = '';
    document.head.appendChild(linkEl);
    
    // Add Leaflet script
    const scriptEl = document.createElement('script');
    scriptEl.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    scriptEl.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    scriptEl.crossOrigin = '';
    
    scriptEl.onload = () => {
      setIsMapReady(true);
    };
    
    document.body.appendChild(scriptEl);
    
    return () => {
      // Cleanup function runs on unmount
      if (mapRef.current) {
        try {
          mapRef.current.remove();
          mapRef.current = null;
        } catch (err) {
          console.error('Error cleaning up map:', err);
        }
      }
    };
  }, []);
  
  // Initialize and update the map when dependencies change
  useEffect(() => {
    // Don't proceed until Leaflet is loaded and we're not in loading state
    if (!isMapReady || isLoading) return;
    
    const L = window.L;
    if (!L) return;
    
    const mapContainer = document.getElementById(MAP_CONTAINER_ID);
    if (!mapContainer) return;
    
    // Function to clear all existing markers
    const clearMarkers = () => {
      // Clear vessel markers
      vesselMarkersRef.current.forEach(marker => {
        if (marker && typeof marker.remove === 'function') {
          marker.remove();
        }
      });
      vesselMarkersRef.current = [];
      
      // Clear refinery markers
      refineryMarkersRef.current.forEach(marker => {
        if (marker && typeof marker.remove === 'function') {
          marker.remove();
        }
      });
      refineryMarkersRef.current = [];
    };
    
    // If map exists, just update it; otherwise create a new one
    let map = mapRef.current;
    
    if (!map) {
      // Create new map
      map = L.map(mapContainer, {
        center: [0, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 18,
        worldCopyJump: true
      });
      
      mapRef.current = map;
    } else {
      // Clear existing markers before updating
      clearMarkers();
      
      // Remove existing layer
      map.eachLayer((layer: any) => {
        if (layer && layer._url) { // Check if it's a tile layer
          map.removeLayer(layer);
        }
      });
    }
    
    // Add tile layer based on selected style
    const selectedMapStyle = mapStyles.find(style => style.id === mapStyle) || mapStyles[0];
    
    L.tileLayer(selectedMapStyle.url, {
      attribution: selectedMapStyle.attribution,
      maxZoom: 19,
      language: mapLanguage === 'multilingual' ? undefined : mapLanguage
    }).addTo(map);
    
    // Filter and add vessel markers
    const filteredVessels = vessels
      .filter(vessel => vessel.currentLat && vessel.currentLng)
      .slice(0, 1000);
      
    setDisplayVessels(filteredVessels);
    
    filteredVessels.forEach(vessel => {
      if (!vessel.currentLat || !vessel.currentLng) return;
      
      const lat = typeof vessel.currentLat === 'number'
        ? vessel.currentLat
        : parseFloat(String(vessel.currentLat));
        
      const lng = typeof vessel.currentLng === 'number'
        ? vessel.currentLng
        : parseFloat(String(vessel.currentLng));
        
      if (isNaN(lat) || isNaN(lng)) return;
      
      // Get vessel color
      const getVesselColor = () => {
        const type = vessel.vesselType?.toLowerCase() || '';
        if (type.includes('lng')) return "#4ECDC4";
        if (type.includes('cargo')) return "#FFD166";
        if (type.includes('container')) return "#118AB2";
        if (type.includes('chemical')) return "#9A48D0";
        return "#FF6B6B"; // Default oil tanker color
      };
      
      // Get vessel emoji
      const getVesselEmoji = () => {
        const type = vessel.vesselType?.toLowerCase() || '';
        if (type.includes('lng')) return '🔋';
        if (type.includes('container')) return '📦';
        if (type.includes('chemical')) return '⚗️';
        if (type.includes('cargo')) return '🚢';
        return '🛢️'; // Default oil tanker emoji
      };
      
      // Create custom icon
      const customIcon = L.divIcon({
        html: `
          <div style="
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: rgba(255,255,255,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid ${getVesselColor()};
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            font-size: 14px;
            text-align: center;
          ">
            ${getVesselEmoji()}
          </div>
        `,
        className: 'vessel-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      
      // Add marker
      const marker = L.marker([lat, lng], { icon: customIcon })
        .bindPopup(`
          <div style="padding: 12px; max-width: 240px; border-radius: 8px;">
            <!-- Vessel Image Header -->
            <div style="position: relative; height: 80px; margin: -12px -12px 10px -12px; overflow: hidden; border-radius: 8px 8px 0 0; background: linear-gradient(135deg, #003366, #006699);">
              <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.8; background-image: url('https://images.unsplash.com/photo-1572396698880-61c914c5901e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=300&ixid=MnwxfDB8MXxyYW5kb218MHx8c2hpcHx8fHx8fDE2NDU3NjE5NTg&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=450'); background-size: cover; background-position: center;"></div>
              <div style="position: absolute; bottom: 0; left: 0; width: 100%; padding: 10px; background: linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%); color: white;">
                <h3 style="margin: 0; font-size: 14px; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">${vessel.name}</h3>
                <div style="font-size: 11px; opacity: 0.9; margin-top: 2px;">${vessel.vesselType || 'Oil Tanker'}</div>
              </div>
            </div>
            
            <!-- Vessel Info -->
            <div style="font-size: 12px; line-height: 1.5; margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <div><strong>IMO:</strong> ${vessel.imo || 'Unknown'}</div>
                <div><strong>Flag:</strong> ${vessel.flag || 'Unknown'}</div>
              </div>
              <div style="background-color: #f1f5f9; border-radius: 4px; padding: 5px; margin-top: 4px;">
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span style="color: #0f766e;">🛢️</span>
                  <span><strong>Cargo:</strong> ${vessel.cargoType || 'Unknown'}</span>
                </div>
              </div>
              ${vessel.departurePort ? `
              <div style="margin-top: 6px;">
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span style="color: #166534;">🚢</span>
                  <span><strong>From:</strong> ${vessel.departurePort}</span>
                </div>
              </div>` : ''}
              ${vessel.destinationPort ? `
              <div style="margin-top: 4px;">
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span style="color: #991b1b;">📍</span>
                  <span><strong>To:</strong> ${vessel.destinationPort}</span>
                </div>
              </div>` : ''}
            </div>
            
            <!-- Action Buttons -->
            <div style="display: flex; gap: 6px;">
              <button onclick="window.location.href='/vessels/${vessel.id}'" style="flex: 1; background-color: #0284c7; color: white; border: none; border-radius: 4px; padding: 6px 10px; font-size: 12px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                <span style="font-size: 14px;">👁️</span> View Details
              </button>
              <button onclick="window.dispatchEvent(new CustomEvent('track-vessel', { detail: { id: ${vessel.id} } }))" style="flex: 1; background-color: #16a34a; color: white; border: none; border-radius: 4px; padding: 6px 10px; font-size: 12px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                <span style="font-size: 14px;">🔍</span> Track
              </button>
            </div>
          </div>
        `)
        .on('click', () => onVesselClick(vessel))
        .addTo(map);
      
      vesselMarkersRef.current.push(marker);
    });
    
    // Add refinery markers
    refineries.forEach(refinery => {
      if (!refinery.lat || !refinery.lng) return;
      
      // Get color based on refinery status
      const getRefineryColor = () => {
        const status = refinery.status?.toLowerCase() || '';
        if (status.includes('active') || status.includes('operational')) return "#22c55e"; // green
        if (status.includes('maintenance')) return "#f59e0b"; // amber
        if (status.includes('planned')) return "#3b82f6"; // blue
        if (status.includes('shutdown')) return "#ef4444"; // red
        return "#6b7280"; // gray default
      };
      
      // Get emoji based on country/region
      const getRefineryEmoji = () => {
        if (refinery.country?.includes("Saudi")) return '🏭';
        if (refinery.country?.includes("UAE")) return '⛽';
        if (refinery.country?.includes("Kuwait")) return '💧';
        if (refinery.country?.includes("Qatar")) return '🔥';
        if (refinery.region?.includes("Middle East")) return '🛢️';
        if (refinery.region?.includes("Africa")) return '⛰️';
        if (refinery.region?.includes("Europe")) return '🏢';
        if (refinery.region?.includes("Asia")) return '🌊';
        return '🏭';
      };
      
      const refineryIcon = L.divIcon({
        html: `
          <div style="
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: rgba(255,255,255,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid ${getRefineryColor()};
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            font-size: 15px;
            text-align: center;
          ">
            ${getRefineryEmoji()}
          </div>
        `,
        className: 'refinery-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
      
      const marker = L.marker([refinery.lat, refinery.lng], { icon: refineryIcon })
        .bindPopup(`
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 5px;">${refinery.name}</h3>
            <div style="font-size: 12px; line-height: 1.5;">
              <div><strong>Country:</strong> ${refinery.country || 'Unknown'}</div>
              <div><strong>Region:</strong> ${refinery.region || 'Unknown'}</div>
              <div><strong>Status:</strong> ${refinery.status || 'Unknown'}</div>
              ${refinery.capacity ? `<div><strong>Capacity:</strong> ${refinery.capacity.toLocaleString()} bpd</div>` : ''}
            </div>
          </div>
        `)
        .on('click', () => {
          if (onRefineryClick) {
            onRefineryClick(refinery);
          }
        })
        .addTo(map);
      
      refineryMarkersRef.current.push(marker);
    });
    
    // Set view based on priority:
    // 1. initialCenter/initialZoom (if provided)
    // 2. Selected region
    // 3. Tracked vessel
    // 4. Default view (already set when map was created)
    if (initialCenter && initialZoom) {
      // Use the provided initial center and zoom
      map.setView(initialCenter, initialZoom);
    } else if (selectedRegion) {
      const position = regionPositions[selectedRegion];
      if (position) {
        map.setView([position.lat, position.lng], position.zoom);
      }
    } else if (trackedVessel?.currentLat && trackedVessel?.currentLng) {
      const lat = typeof trackedVessel.currentLat === 'number'
        ? trackedVessel.currentLat
        : parseFloat(String(trackedVessel.currentLat));
      
      const lng = typeof trackedVessel.currentLng === 'number'
        ? trackedVessel.currentLng
        : parseFloat(String(trackedVessel.currentLng));
      
      map.setView([lat, lng], 7);
    }
    
    // Make sure map is sized properly
    map.invalidateSize();
    
  }, [
    isMapReady,
    mapStyle,
    mapLanguage,
    vessels,
    refineries,
    selectedRegion,
    trackedVessel,
    onVesselClick,
    onRefineryClick,
    isLoading,
    initialCenter,
    initialZoom
  ]);
  
  // Handlers for UI controls
  const handleStyleChange = (newStyle: string) => {
    setMapStyle(newStyle);
  };
  
  const handleLanguageChange = (newLanguage: LanguageOption) => {
    setMapLanguage(newLanguage);
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="relative h-[500px] rounded-lg bg-slate-100 flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading map data...</div>
      </div>
    );
  }
  
  return (
    <div className="relative h-[500px] rounded-lg overflow-hidden border border-border bg-card">
      {/* Stable Map Container - key prevents remounting */}
      <div className="absolute inset-0 w-full h-full z-0">
        <MapContainer id={MAP_CONTAINER_ID} className="w-full h-full" />
      </div>
      
      {/* Loading overlay */}
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="text-sm text-muted-foreground">Loading map...</div>
          </div>
        </div>
      )}
      
      {/* Map controls */}
      <div className="absolute bottom-4 left-4 z-10 bg-background/90 backdrop-blur-sm rounded-lg shadow-md p-3 border border-border">
        {/* Map style selector */}
        <div className="mb-3">
          <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Map className="h-3 w-3" />
            Map Style
          </h4>
          <div className="flex flex-wrap gap-1.5 max-w-[300px]">
            {mapStyles.map(style => (
              <Button
                key={style.id}
                variant={style.id === mapStyle ? "default" : "outline"}
                size="sm"
                className={`flex items-center gap-1 h-7 px-2 py-1 ${
                  style.id === mapStyle 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-background hover:bg-accent text-foreground'
                }`}
                onClick={() => handleStyleChange(style.id)}
                title={style.name}
              >
                {style.icon}
                <span className="text-xs font-medium">{style.name}</span>
              </Button>
            ))}
          </div>
        </div>
        
        {/* Map language selector */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Globe2 className="h-3 w-3" />
            Language
          </h4>
          <div className="flex gap-1.5">
            <Button
              variant={mapLanguage === 'en' ? "default" : "outline"}
              size="sm"
              className={`flex items-center gap-1 h-7 px-2 py-1 ${
                mapLanguage === 'en' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background hover:bg-accent text-foreground'
              }`}
              onClick={() => handleLanguageChange('en')}
              title="Show map labels in English"
            >
              <span className="text-xs font-medium">English</span>
            </Button>
            
            <Button
              variant={mapLanguage === 'ar' ? "default" : "outline"}
              size="sm"
              className={`flex items-center gap-1 h-7 px-2 py-1 ${
                mapLanguage === 'ar' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background hover:bg-accent text-foreground'
              }`}
              onClick={() => handleLanguageChange('ar')}
              title="Show map labels in Arabic"
            >
              <span className="text-xs font-medium">العربية</span>
            </Button>
            
            <Button
              variant={mapLanguage === 'multilingual' ? "default" : "outline"}
              size="sm"
              className={`flex items-center gap-1 h-7 px-2 py-1 ${
                mapLanguage === 'multilingual' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background hover:bg-accent text-foreground'
              }`}
              onClick={() => handleLanguageChange('multilingual')}
              title="Show map labels in local languages"
            >
              <span className="text-xs font-medium">Local</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Information badge */}
      <div className="absolute top-3 right-3 z-10">
        <div className="bg-background/90 backdrop-blur-sm text-xs px-2.5 py-1 rounded-full flex items-center shadow-sm border border-border">
          <Info className="h-3 w-3 mr-1 text-primary" />
          <span>
            {displayVessels?.length || 0} vessels
            {refineries.length > 0 && `, ${refineries.length} refineries`}
          </span>
        </div>
      </div>
      
      {/* Tracked vessel info */}
      {trackedVessel && trackedVessel.currentLat && trackedVessel.currentLng && (
        <div className="absolute top-12 right-3 z-10 bg-background/90 backdrop-blur-sm rounded-lg shadow-md p-3 border border-border max-w-[220px]">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium flex items-center gap-1">
              <Navigation className="h-3 w-3 text-primary"/>
              Tracking Vessel
            </h4>
            <Badge variant="outline" className="text-[10px] h-4 px-1.5 bg-primary/10 text-primary border-primary/20">LIVE</Badge>
          </div>
          <div className="space-y-1 text-xs">
            <div className="font-medium">{trackedVessel.name}</div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span>{trackedVessel.vesselType || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Position:</span>
              <span>
                {typeof trackedVessel.currentLat === 'number' 
                  ? trackedVessel.currentLat.toFixed(3) 
                  : parseFloat(String(trackedVessel.currentLat)).toFixed(3)}, 
                {typeof trackedVessel.currentLng === 'number' 
                  ? trackedVessel.currentLng.toFixed(3) 
                  : parseFloat(String(trackedVessel.currentLng)).toFixed(3)}
              </span>
            </div>
            {trackedVessel.destinationPort && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Destination:</span>
                <span>{trackedVessel.destinationPort.split(',')[0]}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}