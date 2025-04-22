import { useEffect, useRef, useState } from 'react';
import { Vessel, Refinery, Region } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import { Info, Map, Navigation, Globe2 } from 'lucide-react';
import { OIL_PRODUCT_TYPES } from '@/../../shared/constants';
import { MapStyleSelector, mapStyles, LanguageOption } from './MapStyles';

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
}

// Import map styles from MapStyles.tsx

export default function SimpleLeafletMap({
  vessels,
  refineries,
  selectedRegion,
  trackedVessel,
  onVesselClick,
  onRefineryClick,
  isLoading = false
}: SimpleLeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapStyle, setMapStyle] = useState(mapStyles[0].id);
  const [mapLanguage, setMapLanguage] = useState<LanguageOption>('en');
  const [isMapReady, setIsMapReady] = useState(false);
  const [displayVessels, setDisplayVessels] = useState<Vessel[]>([]);
  
  // Load Leaflet scripts and styles
  useEffect(() => {
    // Skip if already loaded
    if (window.L) {
      setIsMapReady(true);
      return;
    }

    const loadLeaflet = async () => {
      // Add Leaflet CSS
      const linkElement = document.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      linkElement.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      linkElement.crossOrigin = '';
      document.head.appendChild(linkElement);

      // Add Leaflet script
      const scriptElement = document.createElement('script');
      scriptElement.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      scriptElement.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      scriptElement.crossOrigin = '';
      document.body.appendChild(scriptElement);

      // Wait for script to load
      scriptElement.onload = () => {
        setIsMapReady(true);
      };
    };

    loadLeaflet();
  }, []);

  // Initialize map after Leaflet is loaded
  useEffect(() => {
    if (!isMapReady || !mapContainerRef.current || isLoading) return;

    const L = window.L;
    if (!L) return;
    
    // Destroy existing map instance if it exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize new map
    const map = L.map(mapContainerRef.current, {
      center: [0, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 18,
      worldCopyJump: true,
      // Set language preference: en=English, ar=Arabic, uses local language by default
      language: mapLanguage === 'multilingual' ? undefined : mapLanguage
    });
    
    mapInstanceRef.current = map;
    
    // Add tile layer based on selected style
    const selectedMapStyle = mapStyles.find(style => style.id === mapStyle) || mapStyles[0];
    
    // Some tile providers accept language parameter
    L.tileLayer(selectedMapStyle.url, {
      attribution: selectedMapStyle.attribution,
      maxZoom: 19,
      // Set language for providers that support it (like ESRI and Carto)
      language: mapLanguage === 'multilingual' ? undefined : mapLanguage
    }).addTo(map);
    
    // Add vessel markers
    const vesselMarkers: any[] = [];
    const filteredVessels = vessels
      .filter(vessel => 
        vessel.currentLat && 
        vessel.currentLng 
        // Show all vessels by removing the vessel type filter
      )
      .slice(0, 1000); // Increased limit to 1000 vessels for more coverage
      
    // Update the displayVessels state for use in the component
    setDisplayVessels(filteredVessels);
    
    filteredVessels.forEach(vessel => {
      if (!vessel.currentLat || !vessel.currentLng) return;
      
      const lat = typeof vessel.currentLat === 'number' 
        ? vessel.currentLat 
        : parseFloat(String(vessel.currentLat));
      
      const lng = typeof vessel.currentLng === 'number' 
        ? vessel.currentLng 
        : parseFloat(String(vessel.currentLng));
      
      // Skip invalid coordinates
      if (isNaN(lat) || isNaN(lng)) return;
      
      // Determine icon style based on vessel type
      const getVesselColor = () => {
        const type = vessel.vesselType?.toLowerCase() || '';
        if (type.includes('lng')) return "#4ECDC4";
        if (type.includes('cargo')) return "#FFD166";
        if (type.includes('container')) return "#118AB2";
        if (type.includes('chemical')) return "#9A48D0";
        return "#FF6B6B"; // Default oil tanker color
      };
      
      const getVesselEmoji = (): string => {
        const type = vessel.vesselType?.toLowerCase() || '';
        if (type.includes('lng')) return '🔋';
        if (type.includes('container')) return '📦';
        if (type.includes('chemical')) return '⚗️';
        if (type.includes('cargo')) return '🚢';
        return '🛢️'; // Default oil tanker emoji
      };
      
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
      
      const marker = L.marker([lat, lng], { icon: customIcon })
        .bindPopup(`
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 5px;">${vessel.name}</h3>
            <div style="font-size: 12px; line-height: 1.5;">
              <div><strong>Type:</strong> ${vessel.vesselType || 'Unknown'}</div>
              <div><strong>Cargo:</strong> ${vessel.cargoType || 'Unknown'}</div>
              <div><strong>IMO:</strong> ${vessel.imo || 'Unknown'}</div>
              <div><strong>Flag:</strong> ${vessel.flag || 'Unknown'}</div>
              ${vessel.departurePort ? `<div><strong>From:</strong> ${vessel.departurePort}</div>` : ''}
              ${vessel.destinationPort ? `<div><strong>To:</strong> ${vessel.destinationPort}</div>` : ''}
            </div>
          </div>
        `)
        .on('click', () => {
          onVesselClick(vessel);
        })
        .addTo(map);
      
      vesselMarkers.push(marker);
    });
    
    // Add refinery markers
    const refineryMarkers: any[] = [];
    
    refineries.forEach(refinery => {
      if (!refinery.lat || !refinery.lng) return;
      
      const refineryIcon = L.divIcon({
        html: `
          <div style="
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: rgba(255,255,255,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #dc3545;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            font-size: 14px;
            text-align: center;
          ">
            ⛽
          </div>
        `,
        className: 'refinery-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
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
      
      refineryMarkers.push(marker);
    });
    
    // Set view based on selected region or tracked vessel
    if (selectedRegion) {
      const position = regionPositions[selectedRegion];
      if (position) {
        map.setView([position.lat, position.lng], position.zoom);
      }
    } else if (trackedVessel && trackedVessel.currentLat && trackedVessel.currentLng) {
      const lat = typeof trackedVessel.currentLat === 'number' 
        ? trackedVessel.currentLat 
        : parseFloat(String(trackedVessel.currentLat));
      
      const lng = typeof trackedVessel.currentLng === 'number' 
        ? trackedVessel.currentLng 
        : parseFloat(String(trackedVessel.currentLng));
      
      map.setView([lat, lng], 7);
    }
    
    // Add zoom after a slight delay to ensure proper sizing
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
    
    // Cleanup function to remove map and markers on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [
    isMapReady, 
    mapStyle, 
    vessels, 
    refineries, 
    selectedRegion, 
    trackedVessel, 
    onVesselClick, 
    onRefineryClick, 
    isLoading
  ]);
  
  // Handle map style change
  const handleStyleChange = (newStyle: string) => {
    setMapStyle(newStyle);
  };
  
  if (isLoading) {
    return (
      <div className="relative h-[500px] rounded-lg bg-slate-100 flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading map data...</div>
      </div>
    );
  }
  
  return (
    <div className="relative h-[500px] rounded-lg overflow-hidden border border-border bg-card">
      {/* Map container */}
      <div 
        ref={mapContainerRef} 
        className="absolute inset-0 w-full h-full z-0" 
      />
      
      {/* Loading overlay if map isn't ready */}
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="text-sm text-muted-foreground">Loading map...</div>
          </div>
        </div>
      )}
      
      {/* Map style selector */}
      <div className="absolute bottom-4 left-4 z-10 bg-background/90 backdrop-blur-sm rounded-lg shadow-md p-3 border border-border">
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
              <span className="text-xs">{style.icon}</span>
              <span className="text-xs font-medium">{style.name}</span>
            </Button>
          ))}
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