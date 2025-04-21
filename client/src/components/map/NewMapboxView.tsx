import { useState, useEffect, useCallback, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Vessel, Refinery, Region } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Ship, Navigation as NavigationIcon, Droplet } from 'lucide-react';
import { OIL_PRODUCT_TYPES } from '@/../../shared/constants';
import { MapStyleSelector, mapStyles } from './MapStyles';
import 'mapbox-gl/dist/mapbox-gl.css';

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

interface MapboxViewProps {
  vessels: Vessel[];
  refineries: Refinery[];
  selectedRegion: Region | null;
  trackedVessel?: Vessel | null;
  onVesselClick: (vessel: Vessel) => void;
  onRefineryClick?: (refinery: Refinery) => void;
  isLoading?: boolean;
}

export default function MapboxView({
  vessels,
  refineries,
  selectedRegion,
  trackedVessel,
  onVesselClick,
  onRefineryClick,
  isLoading = false
}: MapboxViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const markerRefs = useRef<Record<string, mapboxgl.Marker>>({});
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v12');
  
  // Default center and zoom
  const defaultCenter = { lng: 10, lat: 25 };
  const defaultZoom = 1.5;
  
  // Initialize map
  useEffect(() => {
    if (isLoading || !mapContainer.current || map.current) return;
    
    // Set API access token
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 
      "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA";
    
    // Create the map instance
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle, // Use the style from state
      center: defaultCenter,
      zoom: defaultZoom,
      attributionControl: true
    });
    
    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
    map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-right');
    
    // Setup popup
    popupRef.current = new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: '300px'
    });
    
    // Setup map events
    map.current.on('load', () => {
      addMarkers();
    });
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isLoading, mapStyle]);
  
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
  
  // Add all markers to the map
  const addMarkers = useCallback(() => {
    if (!map.current) return;
    
    // Clear previous markers
    Object.values(markerRefs.current).forEach(marker => marker.remove());
    markerRefs.current = {};
    
    // Add vessel markers
    filteredVessels.forEach(vessel => {
      if (!vessel.currentLat || !vessel.currentLng || !map.current) return;
      
      // Create marker element
      const el = document.createElement('div');
      el.className = 'vessel-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.background = 'rgba(255,255,255,0.8)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.border = `2px solid ${getVesselColor(vessel.vesselType || 'Oil Tanker')}`;
      el.style.boxShadow = '0 0 0 2px rgba(0,0,0,0.1)';
      el.style.cursor = 'pointer';
      
      // Add emoji
      const span = document.createElement('span');
      span.style.fontSize = '14px';
      span.textContent = getVesselEmoji(vessel.vesselType || 'Oil Tanker');
      el.appendChild(span);
      
      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([
          typeof vessel.currentLng === 'number' ? vessel.currentLng : parseFloat(String(vessel.currentLng)),
          typeof vessel.currentLat === 'number' ? vessel.currentLat : parseFloat(String(vessel.currentLat))
        ])
        .addTo(map.current);
      
      // Add click event
      marker.getElement().addEventListener('click', () => {
        if (map.current && popupRef.current) {
          // Create popup content
          const popupContent = document.createElement('div');
          popupContent.className = 'p-2 max-w-[200px]';
          popupContent.innerHTML = `
            <h3 class="font-bold text-sm">${vessel.name}</h3>
            <div class="text-xs mt-1">
              <div><span class="font-semibold">Type:</span> ${vessel.vesselType || 'Unknown'}</div>
              <div><span class="font-semibold">IMO:</span> ${vessel.imo || 'Unknown'}</div>
              <div><span class="font-semibold">Flag:</span> ${vessel.flag || 'Unknown'}</div>
              ${vessel.departurePort ? `<div><span class="font-semibold">From:</span> ${vessel.departurePort}</div>` : ''}
              ${vessel.destinationPort ? `<div><span class="font-semibold">To:</span> ${vessel.destinationPort}</div>` : ''}
            </div>
          `;
          
          // Set popup
          popupRef.current
            .setLngLat([
              typeof vessel.currentLng === 'number' ? vessel.currentLng : parseFloat(String(vessel.currentLng)),
              typeof vessel.currentLat === 'number' ? vessel.currentLat : parseFloat(String(vessel.currentLat))
            ])
            .setDOMContent(popupContent)
            .addTo(map.current);
            
          // Trigger vessel selection
          onVesselClick(vessel);
        }
      });
      
      // Add to marker references
      markerRefs.current[`vessel-${vessel.id}`] = marker;
    });
    
    // Add refinery markers
    refineries.forEach(refinery => {
      if (!map.current) return;
      
      // Create marker element
      const el = document.createElement('div');
      el.className = 'refinery-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.background = 'rgba(255,255,255,0.9)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.border = '2px solid #dc3545';
      el.style.boxShadow = '0 0 0 2px rgba(0,0,0,0.1)';
      el.style.cursor = 'pointer';
      
      // Add emoji
      const span = document.createElement('span');
      span.style.fontSize = '14px';
      span.textContent = '⛽';
      el.appendChild(span);
      
      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([refinery.lng, refinery.lat])
        .addTo(map.current);
      
      // Add click event
      marker.getElement().addEventListener('click', () => {
        if (map.current && popupRef.current && onRefineryClick) {
          // Create popup content
          const popupContent = document.createElement('div');
          popupContent.className = 'p-2 max-w-[200px]';
          popupContent.innerHTML = `
            <h3 class="font-bold text-sm">${refinery.name}</h3>
            <div class="text-xs mt-1">
              <div><span class="font-semibold">Country:</span> ${refinery.country || 'Unknown'}</div>
              <div><span class="font-semibold">Region:</span> ${refinery.region || 'Unknown'}</div>
              <div><span class="font-semibold">Status:</span> ${refinery.status || 'Unknown'}</div>
              ${refinery.capacity ? `<div><span class="font-semibold">Capacity:</span> ${refinery.capacity.toLocaleString()} bpd</div>` : ''}
            </div>
          `;
          
          // Set popup
          popupRef.current
            .setLngLat([refinery.lng, refinery.lat])
            .setDOMContent(popupContent)
            .addTo(map.current);
            
          // Trigger refinery selection
          onRefineryClick(refinery);
        }
      });
      
      // Add to marker references
      markerRefs.current[`refinery-${refinery.id}`] = marker;
    });
  }, [filteredVessels, refineries, onVesselClick, onRefineryClick]);
  
  // Update markers when vessels or refineries change
  useEffect(() => {
    if (map.current && map.current.loaded()) {
      addMarkers();
    }
  }, [filteredVessels, refineries, addMarkers]);
  
  // Update map when region changes
  useEffect(() => {
    if (!map.current || !selectedRegion) return;
    
    const position = regionPositions[selectedRegion];
    if (position) {
      map.current.flyTo({
        center: [position.lng, position.lat],
        zoom: position.zoom,
        essential: true
      });
    }
  }, [selectedRegion]);
  
  // Update map when tracked vessel changes
  useEffect(() => {
    if (!map.current || !trackedVessel || !trackedVessel.currentLat || !trackedVessel.currentLng) return;
    
    const lat = typeof trackedVessel.currentLat === 'number' ? trackedVessel.currentLat : parseFloat(String(trackedVessel.currentLat));
    const lng = typeof trackedVessel.currentLng === 'number' ? trackedVessel.currentLng : parseFloat(String(trackedVessel.currentLng));
    
    map.current.flyTo({
      center: [lng, lat],
      zoom: 8,
      essential: true
    });
  }, [trackedVessel]);
  
  if (isLoading) {
    return (
      <div className="relative h-96 md:h-[500px] bg-gray-100 flex items-center justify-center">
        <div className="text-primary text-lg">Loading map...</div>
      </div>
    );
  }
  
  // Handle map style change
  const handleStyleChange = (styleId: string) => {
    setMapStyle(styleId);
    
    if (map.current) {
      map.current.setStyle(styleId);
      
      // Re-add markers after style change when the map is loaded
      map.current.once('style.load', () => {
        addMarkers();
      });
    }
  };

  return (
    <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute top-0 left-0 w-full h-full" />
      
      {/* Map Style Selector */}
      <MapStyleSelector currentStyle={mapStyle} onStyleChange={handleStyleChange} />
      
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