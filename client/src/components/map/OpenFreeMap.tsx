import { useEffect, useRef, useState } from 'react';
import { Vessel, Refinery, Region } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import { Navigation as NavigationIcon } from 'lucide-react';
import { OIL_PRODUCT_TYPES } from '@/../../shared/constants';

// Add Leaflet types to Window
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

interface OpenFreeMapProps {
  vessels: Vessel[];
  refineries: Refinery[];
  selectedRegion: Region | null;
  trackedVessel?: Vessel | null;
  onVesselClick: (vessel: Vessel) => void;
  onRefineryClick?: (refinery: Refinery) => void;
  isLoading?: boolean;
}

// Available free map styles
const mapStyles = [
  { 
    id: 'liberty',
    name: 'Liberty',
    url: 'https://tiles.openfreemap.org/styles/liberty',
    description: 'OpenFreeMap Liberty style'
  },
  { 
    id: 'osm-bright',
    name: 'OSM Bright',
    url: 'https://tiles.openfreemap.org/styles/osm-bright',
    description: 'OpenFreeMap bright style'
  },
  {
    id: 'osm-standard',
    name: 'OSM Standard',
    tileLayer: true,
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    description: 'Standard OpenStreetMap'
  },
  {
    id: 'stamen-terrain',
    name: 'Terrain',
    tileLayer: true,
    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
    description: 'Stamen Terrain'
  },
  {
    id: 'carto-dark',
    name: 'Dark',
    tileLayer: true,
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    description: 'CARTO Dark'
  },
  {
    id: 'carto-voyager',
    name: 'Voyager',
    tileLayer: true,
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    description: 'CARTO Voyager'
  }
];

export default function OpenFreeMap({
  vessels,
  refineries,
  selectedRegion,
  trackedVessel,
  onVesselClick,
  onRefineryClick,
  isLoading = false
}: OpenFreeMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapStyle, setMapStyle] = useState(mapStyles[0].id);
  
  // Initialize map
  useEffect(() => {
    if (isLoading || !mapRef.current) return;
    
    // Load required scripts dynamically
    const loadScripts = async () => {
      // Check if scripts are already loaded
      if (window.L) return initializeMap();
      
      // Load Leaflet CSS
      const leafletCss = document.createElement('link');
      leafletCss.rel = 'stylesheet';
      leafletCss.href = 'https://unpkg.com/leaflet/dist/leaflet.css';
      document.head.appendChild(leafletCss);
      
      // Load Maplibre CSS
      const maplibreCss = document.createElement('link');
      maplibreCss.rel = 'stylesheet';
      maplibreCss.href = 'https://unpkg.com/maplibre-gl/dist/maplibre-gl.css';
      document.head.appendChild(maplibreCss);
      
      // Load Leaflet script
      const leafletScript = document.createElement('script');
      leafletScript.src = 'https://unpkg.com/leaflet/dist/leaflet.js';
      document.body.appendChild(leafletScript);
      
      // Wait for Leaflet to load
      await new Promise<void>((resolve) => {
        leafletScript.onload = () => resolve();
      });
      
      // Load Maplibre script
      const maplibreScript = document.createElement('script');
      maplibreScript.src = 'https://unpkg.com/maplibre-gl/dist/maplibre-gl.js';
      document.body.appendChild(maplibreScript);
      
      // Wait for Maplibre to load
      await new Promise<void>((resolve) => {
        maplibreScript.onload = () => resolve();
      });
      
      // Load Maplibre-Leaflet script
      const maplibreLeafletScript = document.createElement('script');
      maplibreLeafletScript.src = 'https://unpkg.com/@maplibre/maplibre-gl-leaflet/leaflet-maplibre-gl.js';
      document.body.appendChild(maplibreLeafletScript);
      
      // Wait for Maplibre-Leaflet to load
      await new Promise<void>((resolve) => {
        maplibreLeafletScript.onload = () => resolve();
      });
      
      // Initialize the map
      initializeMap();
    };
    
    // Initialize the map with OpenFreeMap styles
    const initializeMap = () => {
      const L = window.L;
      if (!L || !mapRef.current) return;
      
      // Remove previous map instance if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      
      // Create new map
      mapInstanceRef.current = L.map(mapRef.current).setView([52.517, 13.388], 2);
      
      // Get the selected style
      const selectedStyle = mapStyles.find(s => s.id === mapStyle) || mapStyles[0];
      
      if (selectedStyle.tileLayer) {
        // Add a standard tile layer
        L.tileLayer(selectedStyle.url, {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(mapInstanceRef.current);
      } else {
        // Add MapLibre GL vector layer
        // @ts-ignore - maplibreGL plugin is not properly typed
        L.maplibreGL({
          style: selectedStyle.url,
        }).addTo(mapInstanceRef.current);
      }
      
      // Add vessel markers
      addVesselMarkers(mapInstanceRef.current);
      
      // Add refinery markers
      addRefineryMarkers(mapInstanceRef.current);
      
      // Update view for selected region
      if (selectedRegion) {
        const position = regionPositions[selectedRegion];
        if (position) {
          mapInstanceRef.current.setView([position.lat, position.lng], position.zoom);
        }
      }
      
      // Update view for tracked vessel
      if (trackedVessel && trackedVessel.currentLat && trackedVessel.currentLng) {
        const lat = typeof trackedVessel.currentLat === 'number' ? trackedVessel.currentLat : parseFloat(String(trackedVessel.currentLat));
        const lng = typeof trackedVessel.currentLng === 'number' ? trackedVessel.currentLng : parseFloat(String(trackedVessel.currentLng));
        mapInstanceRef.current.setView([lat, lng], 8);
      }
    };
    
    // Get the style URL based on the style ID
    const getStyleUrl = (styleId: string) => {
      const style = mapStyles.find(s => s.id === styleId);
      return style ? style.url : mapStyles[0].url;
    };
    
    // Add vessel markers to the map
    const addVesselMarkers = (map: any) => {
      const L = window.L;
      if (!L) return;
      
      // Create custom icon function
      const createCustomIcon = (emoji: string, borderColor: string) => {
        return L.divIcon({
          html: `
            <div style="
              width: 25px;
              height: 25px;
              border-radius: 50%;
              background: rgba(255,255,255,0.9);
              display: flex;
              align-items: center;
              justify-content: center;
              border: 2px solid ${borderColor};
              box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
              font-size: 14px;
              text-align: center;
              line-height: 22px;
            ">
              ${emoji}
            </div>
          `,
          className: 'custom-marker',
          iconSize: [25, 25],
          iconAnchor: [12, 12],
        });
      };
      
      // Helper functions
      const getVesselColor = (type: string) => {
        if (type.toLowerCase().includes('lng')) return "#4ECDC4";
        if (type.toLowerCase().includes('cargo')) return "#FFD166";
        if (type.toLowerCase().includes('container')) return "#118AB2";
        if (type.toLowerCase().includes('chemical')) return "#9A48D0";
        return "#FF6B6B"; // Default to oil tanker color
      };
      
      const getVesselEmoji = (type: string): string => {
        if (type.toLowerCase().includes('lng')) return '🔋';
        if (type.toLowerCase().includes('container')) return '📦';
        if (type.toLowerCase().includes('chemical')) return '⚗️';
        if (type.toLowerCase().includes('cargo')) return '🚢';
        return '🛢️';
      };
      
      // Filter vessels
      const filteredVessels = vessels.filter(vessel => 
        vessel.currentLat && vessel.currentLng && 
        (vessel.vesselType?.toLowerCase().includes('oil') || 
         vessel.vesselType?.toLowerCase().includes('tanker') ||
         OIL_PRODUCT_TYPES.some(type => vessel.cargoType?.includes(type)))
      ).slice(0, 500); // Limit to 500 vessels for performance
      
      // Add markers
      filteredVessels.forEach(vessel => {
        if (!vessel.currentLat || !vessel.currentLng) return;
        
        const lat = typeof vessel.currentLat === 'number' ? vessel.currentLat : parseFloat(String(vessel.currentLat));
        const lng = typeof vessel.currentLng === 'number' ? vessel.currentLng : parseFloat(String(vessel.currentLng));
        
        const icon = createCustomIcon(
          getVesselEmoji(vessel.vesselType || 'Oil Tanker'),
          getVesselColor(vessel.vesselType || 'Oil Tanker')
        );
        
        const marker = L.marker([lat, lng], { icon }).addTo(map);
        
        marker.bindPopup(`
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${vessel.name}</h3>
            <div style="font-size: 12px;">
              <div><span style="font-weight: 600;">Type:</span> ${vessel.vesselType || 'Unknown'}</div>
              <div><span style="font-weight: 600;">Cargo:</span> ${vessel.cargoType || 'Unknown'}</div>
              <div><span style="font-weight: 600;">IMO:</span> ${vessel.imo || 'Unknown'}</div>
              <div><span style="font-weight: 600;">Flag:</span> ${vessel.flag || 'Unknown'}</div>
              ${vessel.departurePort ? `<div><span style="font-weight: 600;">From:</span> ${vessel.departurePort}</div>` : ''}
              ${vessel.destinationPort ? `<div><span style="font-weight: 600;">To:</span> ${vessel.destinationPort}</div>` : ''}
            </div>
          </div>
        `);
        
        marker.on('click', () => {
          onVesselClick(vessel);
        });
      });
    };
    
    // Add refinery markers to the map
    const addRefineryMarkers = (map: any) => {
      const L = window.L;
      if (!L) return;
      
      // Create custom icon
      const refineryIcon = L.divIcon({
        html: `
          <div style="
            width: 25px;
            height: 25px;
            border-radius: 50%;
            background: rgba(255,255,255,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #dc3545;
            box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
            font-size: 14px;
            text-align: center;
            line-height: 22px;
          ">
            ⛽
          </div>
        `,
        className: 'custom-marker',
        iconSize: [25, 25],
        iconAnchor: [12, 12],
      });
      
      // Add markers
      refineries.forEach(refinery => {
        const marker = L.marker([refinery.lat, refinery.lng], { icon: refineryIcon }).addTo(map);
        
        marker.bindPopup(`
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${refinery.name}</h3>
            <div style="font-size: 12px;">
              <div><span style="font-weight: 600;">Country:</span> ${refinery.country || 'Unknown'}</div>
              <div><span style="font-weight: 600;">Region:</span> ${refinery.region || 'Unknown'}</div>
              <div><span style="font-weight: 600;">Status:</span> ${refinery.status || 'Unknown'}</div>
              ${refinery.capacity ? `<div><span style="font-weight: 600;">Capacity:</span> ${refinery.capacity.toLocaleString()} bpd</div>` : ''}
            </div>
          </div>
        `);
        
        marker.on('click', () => {
          if (onRefineryClick) {
            onRefineryClick(refinery);
          }
        });
      });
    };
    
    // Load the scripts and initialize the map
    loadScripts();
    
    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [vessels, refineries, selectedRegion, trackedVessel, onVesselClick, onRefineryClick, mapStyle, isLoading]);
  
  // Handle map style change
  const handleStyleChange = (styleId: string) => {
    setMapStyle(styleId);
  };
  
  if (isLoading) {
    return (
      <div className="relative h-96 md:h-[500px] bg-gray-100 flex items-center justify-center">
        <div className="text-primary text-lg">Loading map...</div>
      </div>
    );
  }
  
  return (
    <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden">
      <div ref={mapRef} className="absolute inset-0 w-full h-full" />
      
      {/* Map Style Selector */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-3 flex flex-col gap-2 max-w-[320px]">
        <h4 className="text-xs font-semibold text-gray-500 mb-1">Map Style</h4>
        <div className="flex flex-wrap gap-1.5">
          {mapStyles.map(style => {
            // Create icons for different map styles
            let icon = '🗺️';
            if (style.id === 'liberty') icon = '🌍';
            if (style.id === 'osm-bright') icon = '🌐';
            if (style.id === 'osm-standard') icon = '🧭';
            if (style.id === 'stamen-terrain') icon = '⛰️';
            if (style.id === 'carto-dark') icon = '🌑';
            if (style.id === 'carto-voyager') icon = '🧪';
            
            return (
              <Button
                key={style.id}
                variant={style.id === mapStyle ? "default" : "outline"}
                size="sm"
                className={`flex flex-row items-center justify-center py-1 px-2 h-auto gap-1 ${
                  style.id === mapStyle ? 'bg-primary text-white' : 'border-primary/20 hover:bg-primary/10'
                }`}
                onClick={() => handleStyleChange(style.id)}
                title={style.description}
              >
                <span className="text-xs">{icon}</span>
                <span className="text-xs font-medium">{style.name}</span>
              </Button>
            );
          })}
        </div>
      </div>
      
      {/* Tracked Vessel Info */}
      {trackedVessel && trackedVessel.currentLat && trackedVessel.currentLng && (
        <div className="absolute top-20 right-4 z-10 bg-white rounded-lg shadow-md p-3 max-w-[220px]">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold flex items-center">
              <NavigationIcon className="h-3 w-3 mr-1 text-blue-500"/>
              Tracking Vessel
            </h4>
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-[10px]">LIVE</Badge>
          </div>
          <div className="space-y-1 text-xs">
            <div className="font-medium">{trackedVessel.name}</div>
            <div className="flex justify-between">
              <span className="text-gray-500">Vessel Type:</span>
              <span>{trackedVessel.vesselType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Position:</span>
              <span>
                {typeof trackedVessel.currentLat === 'number' ? trackedVessel.currentLat.toFixed(3) : parseFloat(String(trackedVessel.currentLat)).toFixed(3)}, 
                {typeof trackedVessel.currentLng === 'number' ? trackedVessel.currentLng.toFixed(3) : parseFloat(String(trackedVessel.currentLng)).toFixed(3)}
              </span>
            </div>
            {trackedVessel.destinationPort && (
              <div className="flex justify-between">
                <span className="text-gray-500">Heading to:</span>
                <span>{trackedVessel.destinationPort.split(',')[0]}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}