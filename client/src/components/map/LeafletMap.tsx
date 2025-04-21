import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import '@maplibre/maplibre-gl-leaflet';
import { Vessel, Refinery, Region } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Navigation as NavigationIcon } from 'lucide-react';
import { OIL_PRODUCT_TYPES } from '@/../../shared/constants';
import 'leaflet/dist/leaflet.css';

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

interface LeafletMapProps {
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
    id: 'https://tiles.openfreemap.org/styles/liberty',
    name: 'Liberty',
    description: 'OpenFreeMap Liberty style'
  },
  { 
    id: 'https://tiles.openfreemap.org/styles/osm-bright',
    name: 'OSM Bright',
    description: 'OpenFreeMap bright style'
  },
  { 
    id: 'https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
    name: 'Streets',
    description: 'MapTiler Streets (demo)'
  }
];

export default function LeafletMap({
  vessels,
  refineries,
  selectedRegion,
  trackedVessel,
  onVesselClick,
  onRefineryClick,
  isLoading = false
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const [mapStyle, setMapStyle] = useState(mapStyles[0].id);
  
  // Default center and zoom
  const defaultCenter: [number, number] = [25, 10];
  const defaultZoom = 1.5;
  
  // Initialize map
  useEffect(() => {
    if (isLoading || !mapRef.current) return;

    // Don't create a new map if one already exists
    if (leafletMap.current) return;
    
    // Create map instance
    leafletMap.current = L.map(mapRef.current).setView(defaultCenter, defaultZoom);
    
    // Add MapLibre layer with OpenFreeMap style
    // @ts-ignore - maplibreGL plugin is not properly typed
    L.maplibreGL({
      style: mapStyle,
      attribution: '&copy; <a href="https://openfreemap.org/">OpenFreeMap</a>'
    }).addTo(leafletMap.current);
    
    // Add scale control
    L.control.scale().addTo(leafletMap.current);
    
    // Create a layer group for markers
    layerGroupRef.current = L.layerGroup().addTo(leafletMap.current);
    
    // Add markers
    updateMarkers();
    
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [isLoading]);

  // Update the map style when it changes
  useEffect(() => {
    if (!leafletMap.current) return;
    
    // Remove the current layer
    leafletMap.current.eachLayer(layer => {
      if (layer instanceof L.TileLayer || layer instanceof L.MaplibreGL) {
        leafletMap.current?.removeLayer(layer);
      }
    });
    
    // Add the new style layer
    // @ts-ignore - maplibreGL plugin is not properly typed
    L.maplibreGL({
      style: mapStyle,
      attribution: '&copy; <a href="https://openfreemap.org/">OpenFreeMap</a>'
    }).addTo(leafletMap.current);
    
  }, [mapStyle]);
  
  // Check if vessel matches any oil product type
  const matchesOilProductType = (vesselType: string | null) => {
    if (!vesselType) return false;
    
    // Check exact match with oil product types
    if (OIL_PRODUCT_TYPES.some(product => vesselType.includes(product))) {
      return true;
    }
    
    // Check generic oil vessel types
    return (
      vesselType.toLowerCase().includes('oil') ||
      vesselType.toLowerCase().includes('tanker') ||
      vesselType.toLowerCase().includes('crude') ||
      vesselType.toLowerCase().includes('vlcc') ||
      vesselType.toLowerCase().includes('diesel') ||
      vesselType.toLowerCase().includes('petroleum') ||
      vesselType.toLowerCase().includes('gas') ||
      vesselType.toLowerCase().includes('gasoline') ||
      vesselType.toLowerCase().includes('fuel')
    );
  };
  
  // Filter down vessels for better performance
  const filteredVessels = vessels.filter(vessel => 
    vessel.currentLat && vessel.currentLng && // Must have coordinates
    matchesOilProductType(vessel.vesselType) // Only show oil vessels or vessels carrying oil products
  ).slice(0, 500); // Limit to 500 vessels for performance
  
  // Get vessel marker color based on type
  const getVesselColor = (type: string) => {
    if (type.toLowerCase().includes('lng')) return "#4ECDC4";
    if (type.toLowerCase().includes('cargo')) return "#FFD166";
    if (type.toLowerCase().includes('container')) return "#118AB2";
    if (type.toLowerCase().includes('chemical')) return "#9A48D0";
    return "#FF6B6B"; // Default to oil tanker color
  };
  
  // Get vessel emoji based on type
  const getVesselEmoji = (type: string): string => {
    if (type.toLowerCase().includes('lng')) return '🔋';
    if (type.toLowerCase().includes('container')) return '📦';
    if (type.toLowerCase().includes('chemical')) return '⚗️';
    if (type.toLowerCase().includes('cargo')) return '🚢';
    return '🛢️';
  };
  
  // Create a custom icon for markers
  const createCustomIcon = (emoji: string, borderColor: string) => {
    const html = `
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
      ">
        <span style="font-size: 14px;">${emoji}</span>
      </div>
    `;
    
    return L.divIcon({
      html: html,
      className: 'custom-marker',
      iconSize: [25, 25],
      iconAnchor: [12, 12],
    });
  };
  
  // Update markers
  const updateMarkers = useCallback(() => {
    if (!leafletMap.current || !layerGroupRef.current) return;
    
    // Clear existing markers
    layerGroupRef.current.clearLayers();
    
    // Add vessel markers
    filteredVessels.forEach(vessel => {
      if (!vessel.currentLat || !vessel.currentLng) return;
      
      const lat = typeof vessel.currentLat === 'number' ? vessel.currentLat : parseFloat(String(vessel.currentLat));
      const lng = typeof vessel.currentLng === 'number' ? vessel.currentLng : parseFloat(String(vessel.currentLng));
      
      // Create marker with custom icon
      const icon = createCustomIcon(
        getVesselEmoji(vessel.vesselType || 'Oil Tanker'),
        getVesselColor(vessel.vesselType || 'Oil Tanker')
      );
      
      const marker = L.marker([lat, lng], { icon }).addTo(layerGroupRef.current!);
      
      // Add popup
      marker.bindPopup(`
        <div class="p-2 max-w-[200px]">
          <h3 class="font-bold text-sm">${vessel.name}</h3>
          <div class="text-xs mt-1">
            <div><span class="font-semibold">Type:</span> ${vessel.vesselType || 'Unknown'}</div>
            <div><span class="font-semibold">IMO:</span> ${vessel.imo || 'Unknown'}</div>
            <div><span class="font-semibold">Flag:</span> ${vessel.flag || 'Unknown'}</div>
            ${vessel.departurePort ? `<div><span class="font-semibold">From:</span> ${vessel.departurePort}</div>` : ''}
            ${vessel.destinationPort ? `<div><span class="font-semibold">To:</span> ${vessel.destinationPort}</div>` : ''}
          </div>
        </div>
      `);
      
      // Add click event
      marker.on('click', () => {
        onVesselClick(vessel);
      });
      
      // Store reference
      markersRef.current[`vessel-${vessel.id}`] = marker;
    });
    
    // Add refinery markers
    refineries.forEach(refinery => {
      // Create marker with custom icon
      const icon = createCustomIcon('⛽', '#dc3545');
      
      const marker = L.marker([refinery.lat, refinery.lng], { icon }).addTo(layerGroupRef.current!);
      
      // Add popup
      marker.bindPopup(`
        <div class="p-2 max-w-[200px]">
          <h3 class="font-bold text-sm">${refinery.name}</h3>
          <div class="text-xs mt-1">
            <div><span class="font-semibold">Country:</span> ${refinery.country || 'Unknown'}</div>
            <div><span class="font-semibold">Region:</span> ${refinery.region || 'Unknown'}</div>
            <div><span class="font-semibold">Status:</span> ${refinery.status || 'Unknown'}</div>
            ${refinery.capacity ? `<div><span class="font-semibold">Capacity:</span> ${refinery.capacity.toLocaleString()} bpd</div>` : ''}
          </div>
        </div>
      `);
      
      // Add click event
      marker.on('click', () => {
        if (onRefineryClick) {
          onRefineryClick(refinery);
        }
      });
      
      // Store reference
      markersRef.current[`refinery-${refinery.id}`] = marker;
    });
  }, [filteredVessels, refineries, onVesselClick, onRefineryClick]);
  
  // Update markers when data changes
  useEffect(() => {
    updateMarkers();
  }, [filteredVessels, refineries, updateMarkers]);
  
  // Update map view when region changes
  useEffect(() => {
    if (!leafletMap.current || !selectedRegion) return;
    
    const position = regionPositions[selectedRegion];
    if (position) {
      leafletMap.current.setView([position.lat, position.lng], position.zoom);
    }
  }, [selectedRegion]);
  
  // Update map when tracked vessel changes
  useEffect(() => {
    if (!leafletMap.current || !trackedVessel || !trackedVessel.currentLat || !trackedVessel.currentLng) return;
    
    const lat = typeof trackedVessel.currentLat === 'number' ? trackedVessel.currentLat : parseFloat(String(trackedVessel.currentLat));
    const lng = typeof trackedVessel.currentLng === 'number' ? trackedVessel.currentLng : parseFloat(String(trackedVessel.currentLng));
    
    leafletMap.current.setView([lat, lng], 8);
  }, [trackedVessel]);
  
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
      <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-md shadow-md p-2 flex flex-wrap gap-1.5 max-w-[320px]">
        {mapStyles.map(style => (
          <button
            key={style.id}
            className={`flex flex-col items-center justify-center py-1 px-3 h-auto rounded border ${
              style.id === mapStyle 
                ? 'bg-primary text-white border-primary' 
                : 'border-primary/20 hover:bg-primary/10 text-gray-700'
            }`}
            onClick={() => handleStyleChange(style.id)}
            title={style.description}
          >
            <span className="text-xs font-medium">{style.name}</span>
          </button>
        ))}
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