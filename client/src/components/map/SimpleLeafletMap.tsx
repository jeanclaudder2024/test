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
  const tileLayerRef = useRef<any>(null);
  const [mapStyle, setMapStyle] = useState(mapStyles[0].id);
  const [mapLanguage, setMapLanguage] = useState<LanguageOption>('en');
  const [isMapReady, setIsMapReady] = useState(false);
  const [displayVessels, setDisplayVessels] = useState<Vessel[]>([]);
  
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
  
  // Initialize map only once
  useEffect(() => {
    // Don't proceed until Leaflet is loaded
    if (!isMapReady) return;
    
    const L = window.L;
    if (!L) return;
    
    const mapContainer = document.getElementById(MAP_CONTAINER_ID);
    if (!mapContainer) return;
    
    // Only create the map if it doesn't exist yet
    if (!mapRef.current) {
      // Create new map
      const map = L.map(mapContainer, {
        center: [0, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 18,
        worldCopyJump: true
      });
      
      mapRef.current = map;
      
      // Initial tile layer will be added in the next effect
    }
  }, [isMapReady]);
  
  // Handle map style and language changes separately
  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;
    
    const L = window.L;
    if (!L) return;
    
    const map = mapRef.current;
    
    // Remove existing tile layers
    map.eachLayer((layer: any) => {
      if (layer && layer._url) { // Check if it's a tile layer
        map.removeLayer(layer);
      }
    });
    
    // Add new tile layer based on current style and language
    const selectedMapStyle = mapStyles.find(style => style.id === mapStyle) || mapStyles[0];
    
    // Keep track of the current tile layer
    const tileLayer = L.tileLayer(selectedMapStyle.url, {
      attribution: selectedMapStyle.attribution,
      maxZoom: 19,
      language: mapLanguage === 'multilingual' ? undefined : mapLanguage
    }).addTo(map);
    
    // Store reference to current tile layer
    tileLayerRef.current = tileLayer;
    
  }, [isMapReady, mapStyle, mapLanguage]);
  
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
  
  // Handle map view updates separately (region selection and initialCenter/initialZoom)
  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;
    
    const map = mapRef.current;
    
    // Set view based on priority:
    // 1. Initial center and zoom passed by parent
    // 2. Selected region
    // 3. Default center and zoom
    if (initialCenter && initialZoom) {
      // Use the provided initial center and zoom
      map.setView(initialCenter, initialZoom);
    } else if (selectedRegion) {
      const position = regionPositions[selectedRegion];
      if (position) {
        map.setView([position.lat, position.lng], position.zoom);
      }
    }
    
    // Make sure map is sized properly after view changes
    map.invalidateSize();
  }, [isMapReady, selectedRegion, initialCenter, initialZoom]);
  
  // Handle marker updates separately
  useEffect(() => {
    // Don't proceed if map isn't ready or we're loading
    if (!isMapReady || isLoading || !mapRef.current) return;
    
    const L = window.L;
    if (!L) return;
    
    const map = mapRef.current;
    
    // Clear existing markers before updating
    clearMarkers();
    
    // Function to check if a coordinate is likely at sea (not on land)
    // This uses a more detailed approach to identify major shipping lanes and seas
    const isCoordinateAtSea = (lat: number, lng: number): boolean => {
      // Step 1: Major land mass boundary checks
      
      // North America - Main landmass
      if (lat >= 25 && lat <= 73 && lng >= -140 && lng <= -60) {
        // Exclude known sea areas within this bounding box
        
        // Hudson Bay
        if (lat >= 51 && lat <= 63 && lng >= -95 && lng <= -78) return true;
        
        // Gulf of Mexico and parts of the Caribbean
        if (lat >= 18 && lat <= 30 && lng >= -98 && lng <= -80) return true;
        
        // Great Lakes region (to exclude)
        if (lat >= 41 && lat <= 49 && lng >= -93 && lng <= -76) return false;
        
        return false;
      }
      
      // Central America - Narrow land bridge
      if (lat >= 7 && lat <= 22 && lng >= -110 && lng <= -75) {
        // Caribbean Sea
        if (lat >= 11 && lat <= 20 && lng >= -85 && lng <= -65) return true;
        return false;
      }
      
      // South America - Main landmass with more precise boundaries
      if (lat >= -55 && lat <= 13 && lng >= -81 && lng <= -35) {
        // Amazon River (major shipping lane)
        if (lat >= -3 && lat <= 0 && lng >= -60 && lng <= -49) return true;
        return false;
      }
      
      // Europe - More precise boundaries
      if (lat >= 35 && lat <= 72 && lng >= -10 && lng <= 40) {
        // Mediterranean Sea
        if (lat >= 30 && lat <= 45 && lng >= -5 && lng <= 36) return true;
        
        // Baltic Sea
        if (lat >= 53 && lat <= 66 && lng >= 10 && lng <= 30) return true;
        
        // North Sea
        if (lat >= 51 && lat <= 62 && lng >= -2 && lng <= 10) return true;
        
        // English Channel
        if (lat >= 48 && lat <= 52 && lng >= -5 && lng <= 2) return true;
        
        return false;
      }
      
      // Africa - More precise boundaries
      if (lat >= -35 && lat <= 37 && lng >= -18 && lng <= 52) {
        // Red Sea
        if (lat >= 12 && lat <= 30 && lng >= 32 && lng <= 44) return true;
        
        // Gulf of Aden
        if (lat >= 10 && lat <= 15 && lng >= 43 && lng <= 52) return true;
        
        return false;
      }
      
      // Asia - Split into regions for more precision
      // Middle East
      if (lat >= 12 && lat <= 42 && lng >= 35 && lng <= 65) {
        // Persian Gulf - major oil shipping area
        if (lat >= 24 && lat <= 30 && lng >= 48 && lng <= 57) return true;
        
        // Arabian Sea
        if (lat >= 10 && lat <= 25 && lng >= 55 && lng <= 75) return true;
        
        return false;
      }
      
      // East Asia
      if (lat >= 20 && lat <= 48 && lng >= 105 && lng <= 145) {
        // South China Sea
        if (lat >= 5 && lat <= 25 && lng >= 105 && lng <= 122) return true;
        
        // East China Sea
        if (lat >= 25 && lat <= 34 && lng >= 118 && lng <= 130) return true;
        
        // Sea of Japan
        if (lat >= 35 && lat <= 47 && lng >= 128 && lng <= 142) return true;
        
        return false;
      }
      
      // Southeast Asia - Island region, mostly sea
      if (lat >= -10 && lat <= 20 && lng >= 95 && lng <= 140) {
        // Major islands to exclude
        // Sumatra
        if (lat >= -6 && lat <= 6 && lng >= 95 && lng <= 107) return false;
        
        // Java
        if (lat >= -9 && lat <= -6 && lng >= 105 && lng <= 116) return false;
        
        // Borneo
        if (lat >= -4 && lat <= 8 && lng >= 108 && lng <= 119) return false;
        
        // Philippines - main islands
        if (lat >= 5 && lat <= 19 && lng >= 117 && lng <= 126) return false;
        
        // Straits of Malacca - important shipping lane
        if (lat >= 1 && lat <= 6 && lng >= 98 && lng <= 104) return true;
        
        return true; // Most of SE Asia is sea
      }
      
      // Australia
      if (lat >= -45 && lat <= -10 && lng >= 110 && lng <= 155) {
        // Great Barrier Reef area
        if (lat >= -25 && lat <= -10 && lng >= 142 && lng <= 155) return true;
        return false;
      }
      
      // Antarctica
      if (lat <= -60) return false;
      
      // Major shipping lanes and areas that should always be sea
      
      // North Atlantic shipping lanes
      if (lat >= 30 && lat <= 50 && lng >= -70 && lng <= -10) return true;
      
      // South Atlantic
      if (lat >= -40 && lat <= 0 && lng >= -40 && lng <= 10) return true;
      
      // Indian Ocean
      if (lat >= -35 && lat <= 25 && lng >= 55 && lng <= 100) return true;
      
      // North Pacific shipping lanes
      if (lat >= 25 && lat <= 60 && lng >= 145 && lng <= -130) return true;
      
      // South Pacific
      if (lat >= -50 && lat <= 0 && lng >= 160 && lng <= -80) return true;
      
      // If not matched in any of the above rules, use general check
      // Most coordinates away from major landmasses are sea
      return true;
    };
    
    // Filter and add vessel markers - only show cargo vessels
    const filteredVessels = vessels
      .filter(vessel => {
        // Check if vessel has valid coordinates
        if (!vessel.currentLat || !vessel.currentLng) return false;
        
        const lat = typeof vessel.currentLat === 'number' 
          ? vessel.currentLat 
          : parseFloat(String(vessel.currentLat));
          
        const lng = typeof vessel.currentLng === 'number'
          ? vessel.currentLng
          : parseFloat(String(vessel.currentLng));
          
        if (isNaN(lat) || isNaN(lng)) return false;
        
        // Filter for cargo vessels only
        const isCargoVessel = vessel.vesselType?.toLowerCase().includes('cargo') || false;
        
        // Only show cargo vessels that are at sea
        return isCargoVessel && isCoordinateAtSea(lat, lng);
      })
      .slice(0, 500); // Show more cargo vessels - up to 500
      
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
      
      // Create custom icon with pulsing animation for better visibility
      const customIcon = L.divIcon({
        html: `
          <div class="vessel-marker-container">
            <div class="vessel-marker-pulse" style="border-color: ${getVesselColor()};"></div>
            <div class="vessel-marker" style="
              width: 26px;
              height: 26px;
              border-radius: 50%;
              background: rgba(255,255,255,0.95);
              display: flex;
              align-items: center;
              justify-content: center;
              border: 2px solid ${getVesselColor()};
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              font-size: 14px;
              text-align: center;
              z-index: 900;
              position: relative;
            ">
              ${getVesselEmoji()}
            </div>
          </div>
        `,
        className: 'vessel-marker-wrapper',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });
      
      // Add marker with enhanced popup
      const marker = L.marker([lat, lng], { icon: customIcon })
        .bindPopup(`
          <div class="vessel-popup">
            <div class="vessel-popup-header" style="
              border-bottom: 2px solid ${getVesselColor()};
              padding: 8px;
              margin: -8px -8px 8px -8px;
              background-color: rgba(255,255,255,0.9);
              border-top-left-radius: 8px;
              border-top-right-radius: 8px;
              display: flex;
              align-items: center;
              gap: 8px;
            ">
              <div style="
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: white;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid ${getVesselColor()};
                font-size: 14px;
              ">${getVesselEmoji()}</div>
              <h3 style="
                font-weight: bold;
                margin: 0;
                font-size: 14px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                flex: 1;
              ">${vessel.name}</h3>
            </div>
            
            <div style="padding: 0 8px 8px; font-size: 12px; line-height: 1.6;">
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <span style="width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; color: #666;">🚢</span>
                <span style="font-weight: 500; margin-right: 4px; color: #555;">Type:</span>
                <span style="flex: 1;">${vessel.vesselType || 'Unknown'}</span>
              </div>
              
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <span style="width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; color: #666;">🛢️</span>
                <span style="font-weight: 500; margin-right: 4px; color: #555;">Cargo:</span>
                <span style="flex: 1;">${vessel.cargoType || 'Unknown'}</span>
              </div>
              
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <span style="width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; color: #666;">🔢</span>
                <span style="font-weight: 500; margin-right: 4px; color: #555;">IMO:</span>
                <span style="flex: 1;">${vessel.imo || 'Unknown'}</span>
              </div>
              
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <span style="width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; color: #666;">🏳️</span>
                <span style="font-weight: 500; margin-right: 4px; color: #555;">Flag:</span>
                <span style="flex: 1;">${vessel.flag || 'Unknown'}</span>
              </div>
              
              ${vessel.departurePort ? `
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <span style="width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; color: #666;">🔙</span>
                <span style="font-weight: 500; margin-right: 4px; color: #555;">From:</span>
                <span style="flex: 1;">${vessel.departurePort}</span>
              </div>
              ` : ''}
              
              ${vessel.destinationPort ? `
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <span style="width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; color: #666;">🔜</span>
                <span style="font-weight: 500; margin-right: 4px; color: #555;">To:</span>
                <span style="flex: 1;">${vessel.destinationPort}</span>
              </div>
              ` : ''}
              
              <div style="
                border-top: 1px solid #eee;
                margin-top: 8px;
                padding-top: 8px;
                text-align: center;
              ">
                <span style="
                  background-color: ${getVesselColor()};
                  color: white;
                  padding: 4px 8px;
                  border-radius: 12px;
                  font-size: 10px;
                  display: inline-block;
                ">
                  ${vessel.currentRegion || 'Unknown Region'}
                </span>
              </div>
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
          <div class="refinery-marker-container">
            <div class="refinery-marker-glow" style="background-color: ${getRefineryColor()}33;"></div>
            <div class="refinery-marker" style="
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: rgba(255,255,255,0.98);
              display: flex;
              align-items: center;
              justify-content: center;
              border: 3px solid ${getRefineryColor()};
              box-shadow: 0 3px 6px rgba(0,0,0,0.3);
              font-size: 16px;
              text-align: center;
              z-index: 910;
              position: relative;
            ">
              ${getRefineryEmoji()}
            </div>
          </div>
        `,
        className: 'refinery-marker-wrapper',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });
      
      const marker = L.marker([refinery.lat, refinery.lng], { icon: refineryIcon })
        .bindPopup(`
          <div class="refinery-popup">
            <div class="refinery-popup-header" style="
              border-bottom: 2px solid ${getRefineryColor()};
              padding: 8px;
              margin: -8px -8px 8px -8px;
              background-color: rgba(255,255,255,0.9);
              border-top-left-radius: 8px;
              border-top-right-radius: 8px;
              display: flex;
              align-items: center;
              gap: 8px;
            ">
              <div style="
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: white;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid ${getRefineryColor()};
                font-size: 14px;
              ">${getRefineryEmoji()}</div>
              <h3 style="
                font-weight: bold;
                margin: 0;
                font-size: 14px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                flex: 1;
              ">${refinery.name}</h3>
            </div>
            
            <div style="padding: 0 8px 8px; font-size: 12px; line-height: 1.6;">
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <span style="width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; color: #666;">🏢</span>
                <span style="font-weight: 500; margin-right: 4px; color: #555;">Company:</span>
                <span style="flex: 1;">${refinery.name}</span>
              </div>
              
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <span style="width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; color: #666;">🌍</span>
                <span style="font-weight: 500; margin-right: 4px; color: #555;">Country:</span>
                <span style="flex: 1;">${refinery.country || 'Unknown'}</span>
              </div>
              
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <span style="width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; color: #666;">🌐</span>
                <span style="font-weight: 500; margin-right: 4px; color: #555;">Region:</span>
                <span style="flex: 1;">${refinery.region || 'Unknown'}</span>
              </div>
              
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <span style="width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; color: #666;">📊</span>
                <span style="font-weight: 500; margin-right: 4px; color: #555;">Status:</span>
                <span style="
                  flex: 1;
                  color: ${getRefineryColor()};
                  font-weight: 500;
                ">${refinery.status || 'Unknown'}</span>
              </div>
              
              ${refinery.capacity ? `
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <span style="width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; color: #666;">⚡</span>
                <span style="font-weight: 500; margin-right: 4px; color: #555;">Capacity:</span>
                <span style="flex: 1;">${refinery.capacity.toLocaleString()} bpd</span>
              </div>
              ` : ''}
              
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <span style="width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; color: #666;">👤</span>
                <span style="font-weight: 500; margin-right: 4px; color: #555;">Country:</span>
                <span style="flex: 1;">${refinery.country}</span>
              </div>
              
              <div style="
                border-top: 1px solid #eee;
                margin-top: 8px;
                padding-top: 8px;
                display: flex;
                justify-content: center;
                gap: 6px;
              ">
                <button style="
                  background-color: ${getRefineryColor()};
                  color: white;
                  padding: 3px 6px;
                  border-radius: 4px;
                  font-size: 10px;
                  border: none;
                  cursor: pointer;
                ">
                  View Details
                </button>
                <button style="
                  background-color: #f8f9fa;
                  color: #555;
                  padding: 3px 6px;
                  border-radius: 4px;
                  font-size: 10px;
                  border: 1px solid #ddd;
                  cursor: pointer;
                ">
                  View Associated Vessels
                </button>
              </div>
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
    
    // Map sizing is handled in the view update effect
    
  }, [
    isMapReady,
    vessels,
    refineries,
    onVesselClick,
    onRefineryClick,
    isLoading
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
      
      {/* Tracking functionality removed */}
    </div>
  );
}