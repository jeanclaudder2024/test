import { useEffect, useState, useRef, memo } from 'react';
import { Vessel, Refinery } from '@shared/schema';
import { REGIONS } from '@shared/constants';
import MapContainer from './MapContainer';
import { 
  getVesselIcon, 
  getRefineryIcon, 
  mapStyles, 
  LanguageOption 
} from './MapStyles';
import { 
  Map, 
  Info, 
  Globe2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type Region = typeof REGIONS[number];

/**
 * SimpleLeafletMap Component
 * 
 * A simplified leaflet map component that renders vessel and refinery markers.
 * This version uses standard leaflet instead of react-leaflet for better
 * performance with a large number of markers and animations.
 */

const MAP_CONTAINER_ID = 'leaflet-map-container';

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

// Declare the window interface to access the L (Leaflet) global
declare global {
  interface Window {
    L: any;
  }
}

function SimpleLeafletMap({
  vessels,
  refineries,
  selectedRegion,
  onVesselClick,
  onRefineryClick,
  isLoading = false,
  initialCenter,
  initialZoom
}: SimpleLeafletMapProps) {
  // State for map controls
  const [mapStyle, setMapStyle] = useState('carto-voyager'); // Default map style
  const [mapLanguage, setMapLanguage] = useState<LanguageOption>('en'); // Default language
  const [isMapReady, setIsMapReady] = useState(false);
  const [displayVessels, setDisplayVessels] = useState<Vessel[]>([]);
  
  // Refs to store Leaflet objects
  const mapRef = useRef<any>(null); // Leaflet map instance
  const vesselMarkersRef = useRef<any[]>([]); // Array to store vessel markers
  const refineryMarkersRef = useRef<any[]>([]); // Array to store refinery markers
  const routeLinesRef = useRef<any[]>([]); // Array to store route lines and labels
  
  // Function to handle map style changes
  const handleStyleChange = (style: string) => {
    setMapStyle(style);
  };
  
  // Function to handle map language changes
  const handleLanguageChange = (language: LanguageOption) => {
    setMapLanguage(language);
  };
  
  // Effect to check if Leaflet is loaded
  useEffect(() => {
    let leafletCheckInterval: number;
    let checkCount = 0;
    
    const checkLeaflet = () => {
      console.log('Checking for Leaflet...');
      if (window.L) {
        console.log('Leaflet found on window object!');
        setIsMapReady(true);
        clearInterval(leafletCheckInterval);
      } else {
        checkCount++;
        console.log(`Leaflet not found, check ${checkCount}/20`);
        if (checkCount >= 20) {
          // After 10 seconds, give up
          console.error('Leaflet not found after multiple checks. Please make sure Leaflet is properly loaded.');
          clearInterval(leafletCheckInterval);
        }
      }
    };
    
    // Check immediately and then every 500ms
    checkLeaflet();
    leafletCheckInterval = window.setInterval(checkLeaflet, 500);
    
    // Cleanup interval on unmount
    return () => {
      clearInterval(leafletCheckInterval);
    };
  }, []);
  
  // Main effect to initialize and update the map
  useEffect(() => {
    if (!isMapReady || !window.L) {
      // Wait for Leaflet to be loaded
      console.error('Leaflet not found on window object after initial check!');
      return;
    }
    
    console.log('Initializing map with vessels:', vessels.length, 'refineries:', refineries.length);
    
    const mapContainer = document.getElementById(MAP_CONTAINER_ID);
    if (!mapContainer) {
      console.error('Map container element not found with ID:', MAP_CONTAINER_ID);
      // Try to find the element by data attribute as a fallback
      const containerByData = document.querySelector('[data-map-container="true"]');
      if (containerByData) {
        console.log('Found map container by data attribute');
      } else {
        console.error('Could not find map container by any method');
      }
      return;
    }
    
    // Function to clear all existing markers and lines
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
      
      // Clear route lines and associated markers
      routeLinesRef.current.forEach(item => {
        if (item.line && typeof item.line.remove === 'function') {
          item.line.remove();
        }
        if (item.marker && typeof item.marker.remove === 'function') {
          item.marker.remove();
        }
      });
      routeLinesRef.current = [];
      
      // Remove any highlight classes from DOM
      document.querySelectorAll('.highlight-marker, .nearby-vessel-highlight').forEach(el => {
        el.classList.remove('highlight-marker', 'nearby-vessel-highlight');
      });
    };
    
    // Function to clear just vessel-refinery connection lines
    // This is used when showing associated vessels for a different refinery
    const clearConnectionLines = () => {
      // Only clear lines with the vessel-refinery-connection class
      routeLinesRef.current = routeLinesRef.current.filter(item => {
        if (item.line && item.line.options && item.line.options.className === 'vessel-refinery-connection') {
          if (typeof item.line.remove === 'function') {
            item.line.remove();
          }
          return false; // remove from array
        }
        return true; // keep other lines
      });
    };
    
    // If map exists, just update it; otherwise create a new one
    let map = mapRef.current;
    
    if (!map) {
      // Create new map
      const L = window.L;
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
      
      // Remove existing tile layer
      map.eachLayer((layer: any) => {
        if (layer && layer._url) { // Check if it's a tile layer
          map.removeLayer(layer);
        }
      });
    }
    
    // Add tile layer based on selected style
    const L = window.L;
    const selectedMapStyle = mapStyles.find(style => style.id === mapStyle) || mapStyles[0];
    
    L.tileLayer(selectedMapStyle.url, {
      attribution: selectedMapStyle.attribution,
      maxZoom: 19,
      language: mapLanguage === 'multilingual' ? undefined : mapLanguage
    }).addTo(map);
    
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
    
    // Filter and add vessel markers - show all vessels with valid coordinates
    const filteredVessels = vessels
      .filter(vessel => {
        // Check if vessel has valid coordinates
        if (!vessel.currentLat || !vessel.currentLng) {
          console.log('Vessel missing coordinates:', vessel.name);
          return false;
        }
        
        const lat = typeof vessel.currentLat === 'number' 
          ? vessel.currentLat 
          : parseFloat(String(vessel.currentLat));
          
        const lng = typeof vessel.currentLng === 'number'
          ? vessel.currentLng
          : parseFloat(String(vessel.currentLng));
          
        if (isNaN(lat) || isNaN(lng)) {
          console.log('Invalid coordinates for vessel:', vessel.name, vessel.currentLat, vessel.currentLng);
          return false;
        }
        
        // We want to show all vessel types, not just cargo vessels
        // Only show vessels that are at sea
        return isCoordinateAtSea(lat, lng);
      })
      .slice(0, 500); // Show up to 500 vessels for performance
      
    console.log('Filtered vessels for map:', filteredVessels.length);
      
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
              font-size: 14px;
              box-shadow: 0 0 15px rgba(0,0,0,0.2);
              z-index: 10;
            ">
              ${getVesselEmoji()}
            </div>
          </div>
        `,
        className: `vessel-marker-icon vessel-type-${vessel.vesselType?.toLowerCase().replace(/\s+/g, '-') || 'unknown'}`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
        popupAnchor: [0, -13]
      });
      
      // Create popup content with vessel details
      const popupContent = `
        <div class="vessel-popup" style="width: 220px; font-family: system-ui, sans-serif;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 5px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">
            ${vessel.name || 'Unknown Vessel'}
          </div>
          <div style="font-size: 12px; margin-bottom: 10px; color: #64748b;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Type:</span>
              <span style="font-weight: 500; color: #334155;">${vessel.vesselType || 'Unknown'}</span>
            </div>
            ${vessel.cargoType ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Cargo:</span>
              <span style="font-weight: 500; color: #334155;">${vessel.cargoType || 'Unknown'}</span>
            </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Flag:</span>
              <span style="font-weight: 500; color: #334155;">${vessel.flag || 'Unknown'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>IMO:</span>
              <span style="font-weight: 500; color: #334155;">${vessel.imo || 'Unknown'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Built:</span>
              <span style="font-weight: 500; color: #334155;">${vessel.built || 'Unknown'}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Region:</span>
              <span style="font-weight: 500; color: #334155;">${vessel.currentRegion || 'Unknown'}</span>
            </div>
          </div>
          <div>
            <button id="vessel-details-btn-${vessel.id}" style="
              width: 100%;
              padding: 6px 12px;
              background: #0ea5e9;
              color: white;
              border: none;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 500;
              cursor: pointer;
              transition: background-color 0.2s;
              box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            ">
              View Details
            </button>
          </div>
        </div>
      `;
      
      // Create marker with popup
      const marker = L.marker([lat, lng], { icon: customIcon })
        .bindPopup(popupContent)
        .on('click', () => {
          onVesselClick(vessel);
        })
        .on('popupopen', () => {
          // Add click event listeners to the button after the popup is opened
          setTimeout(() => {
            const detailsBtn = document.getElementById(`vessel-details-btn-${vessel.id}`);
            if (detailsBtn) {
              detailsBtn.addEventListener('click', (e: MouseEvent) => {
                e.stopPropagation();
                onVesselClick(vessel);
                marker.closePopup();
              });
            }
          }, 10);
        })
        .addTo(map);
      
      vesselMarkersRef.current.push(marker);
    });
    
    // Add refinery markers
    refineries.forEach(refinery => {
      if (!refinery.lat || !refinery.lng) return;
      
      // Ensure coordinates are numbers
      const lat = typeof refinery.lat === 'number' 
        ? refinery.lat 
        : parseFloat(String(refinery.lat));
        
      const lng = typeof refinery.lng === 'number'
        ? refinery.lng
        : parseFloat(String(refinery.lng));
      
      if (isNaN(lat) || isNaN(lng)) return;
      
      // Create custom icon for refinery
      const refineryIcon = getRefineryIcon(refinery.status || '', false);
      
      // Create popup content with refinery details
      const popupContent = `
        <div class="refinery-popup" style="width: 240px; font-family: system-ui, sans-serif;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 5px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">
            ${refinery.name || 'Unknown Refinery'}
          </div>
          <div style="font-size: 12px; margin-bottom: 10px; color: #64748b;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Country:</span>
              <span style="font-weight: 500; color: #334155;">${refinery.country || 'Unknown'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Region:</span>
              <span style="font-weight: 500; color: #334155;">${refinery.region || 'Unknown'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Status:</span>
              <span style="font-weight: 500; color: ${
                refinery.status === 'operational' ? '#10b981' : 
                refinery.status === 'maintenance' ? '#f59e0b' : 
                refinery.status === 'offline' ? '#ef4444' : '#94a3b8'
              };">${refinery.status || 'Unknown'}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Capacity:</span>
              <span style="font-weight: 500; color: #334155;">${
                refinery.capacity 
                  ? `${(refinery.capacity / 1000).toLocaleString()} k barrels/day` 
                  : 'Unknown'
              }</span>
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button id="view-details-btn-${refinery.id}" style="
              flex: 1;
              padding: 6px 12px;
              background: #0ea5e9;
              color: white;
              border: none;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 500;
              box-shadow: 0 1px 2px rgba(0,0,0,0.1);
              border: 1px solid #0ea5e9;
              cursor: pointer;
            ">
              View Details
            </button>
            <button id="view-vessels-btn-${refinery.id}" style="
              flex: 1;
              padding: 6px 8px;
              background: white;
              color: #0f172a;
              border: 1px solid #ddd;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 500;
              box-shadow: 0 1px 2px rgba(0,0,0,0.05);
              cursor: pointer;
            ">
              View Associated Vessels
            </button>
          </div>
        </div>
      `;
      
      const marker = L.marker([refinery.lat, refinery.lng], { icon: refineryIcon })
        .bindPopup(popupContent)
        .on('click', () => {
          if (onRefineryClick) {
            onRefineryClick(refinery);
          }
        })
        .on('popupopen', () => {
          // Add click event listeners to the buttons after the popup is opened
          setTimeout(() => {
            const viewDetailsBtn = document.getElementById(`view-details-btn-${refinery.id}`);
            const viewVesselsBtn = document.getElementById(`view-vessels-btn-${refinery.id}`);
            
            if (viewDetailsBtn) {
              viewDetailsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (onRefineryClick) {
                  onRefineryClick(refinery);
                  marker.closePopup();
                }
              });
            }
            
            if (viewVesselsBtn) {
              viewVesselsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // First clear any existing connection lines
                clearConnectionLines();
                
                const refineryLat = typeof refinery.lat === 'number' 
                  ? refinery.lat 
                  : parseFloat(String(refinery.lat));
                  
                const refineryLng = typeof refinery.lng === 'number'
                  ? refinery.lng
                  : parseFloat(String(refinery.lng));
                
                // Find vessels within 500km of this refinery
                // We use a simple distance calculation - not perfect for the globe but good enough
                const nearbyVessels = filteredVessels.filter(vessel => {
                  if (!vessel.currentLat || !vessel.currentLng) return false;
                  
                  const vesselLat = typeof vessel.currentLat === 'number'
                    ? vessel.currentLat
                    : parseFloat(String(vessel.currentLat));
                    
                  const vesselLng = typeof vessel.currentLng === 'number'
                    ? vessel.currentLng
                    : parseFloat(String(vessel.currentLng));
                    
                  if (isNaN(vesselLat) || isNaN(vesselLng)) return false;
                  
                  // Simple spherical distance calculation
                  const latDiff = Math.abs(vesselLat - refineryLat);
                  const lngDiff = Math.abs(vesselLng - refineryLng);
                  
                  // Approximation: 1 degree is roughly 111km at the equator
                  // We're looking for vessels within about 500km (~4.5 degrees)
                  return (latDiff*latDiff + lngDiff*lngDiff) < 25;
                });
                
                if (map) {
                  // First zoom to refinery
                  map.setView([refineryLat, refineryLng], 6);
                  
                  // Highlight the refinery marker
                  const markerEl = marker.getElement();
                  if (markerEl) {
                    markerEl.classList.add('highlight-marker');
                  }
                  
                  // Draw connections to nearby vessels
                  nearbyVessels.forEach(vessel => {
                    if (!vessel.currentLat || !vessel.currentLng) return;
                    
                    const vesselLat = typeof vessel.currentLat === 'number'
                      ? vessel.currentLat
                      : parseFloat(String(vessel.currentLat));
                      
                    const vesselLng = typeof vessel.currentLng === 'number'
                      ? vessel.currentLng
                      : parseFloat(String(vessel.currentLng));
                    
                    if (isNaN(vesselLat) || isNaN(vesselLng)) return;
                    
                    // Get vessel marker element to highlight it
                    const vesselMarker = vesselMarkersRef.current.find(m => {
                      if (!m._latlng) return false;
                      return m._latlng.lat === vesselLat && m._latlng.lng === vesselLng;
                    });
                    
                    if (vesselMarker) {
                      const vesselEl = vesselMarker.getElement();
                      if (vesselEl) {
                        vesselEl.classList.add('nearby-vessel-highlight');
                      }
                      
                      // Create curved connection line
                      const latlngs = [
                        [refineryLat, refineryLng],
                        [vesselLat, vesselLng],
                      ];
                      
                      // Draw a curved line
                      const line = L.polyline(latlngs, {
                        color: '#10b981',
                        weight: 2,
                        opacity: 0.7,
                        dashArray: '5, 5',
                        className: 'vessel-refinery-connection'
                      }).addTo(map);
                      
                      // Add the connection line to the ref for later cleanup
                      routeLinesRef.current.push({ line, marker: null });
                    }
                  });
                  
                  // If there are nearby vessels, show a notification
                  if (nearbyVessels.length > 0) {
                    // Create a notification that shows how many vessels are connected
                    const notification = L.control({ position: 'bottomright' });
                    
                    notification.onAdd = function() {
                      const div = L.DomUtil.create('div', 'map-notification');
                      div.innerHTML = `
                        <div style="
                          background: rgba(0, 0, 0, 0.7);
                          color: white;
                          padding: 10px 15px;
                          border-radius: 6px;
                          font-size: 14px;
                          margin-bottom: 10px;
                          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                        ">
                          <strong>${nearbyVessels.length}</strong> vessels associated with this refinery
                        </div>
                      `;
                      return div;
                    };
                    
                    notification.addTo(map);
                    
                    // Store control for later removal
                    const notificationControl = { 
                      line: notification,
                      marker: null
                    };
                    routeLinesRef.current.push(notificationControl);
                    
                    // Remove after 5 seconds
                    setTimeout(() => {
                      if (map.hasLayer(notification)) {
                        map.removeControl(notification);
                        routeLinesRef.current = routeLinesRef.current.filter(item => item !== notificationControl);
                      }
                    }, 5000);
                  }
                }
                
                // Close the popup
                marker.closePopup();
              });
            }
          }, 10);
        })
        .addTo(map);
      
      refineryMarkersRef.current.push(marker);
    });
    
    // Set initial center and zoom from props if provided
    if (initialCenter && initialZoom) {
      map.setView(initialCenter, initialZoom);
    } else if (selectedRegion) {
      // Center on selected region
      const region = REGIONS.find(r => r.name === selectedRegion.name);
      if (region && region.center) {
        map.setView(region.center, region.zoom || 4);
      }
    } else if (refineries.length === 1 && refineries[0].lat && refineries[0].lng) {
      // If only one refinery is provided, center on it
      const lat = typeof refineries[0].lat === 'number' 
        ? refineries[0].lat 
        : parseFloat(String(refineries[0].lat));
        
      const lng = typeof refineries[0].lng === 'number'
        ? refineries[0].lng
        : parseFloat(String(refineries[0].lng));
        
      if (!isNaN(lat) && !isNaN(lng)) {
        map.setView([lat, lng], 7);
      }
    }
    
    // Return cleanup function
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
  }, [
    isMapReady, 
    vessels, 
    refineries, 
    selectedRegion, 
    onVesselClick, 
    onRefineryClick, 
    mapStyle, 
    mapLanguage,
    initialCenter,
    initialZoom
  ]);
  
  // Handle loading state
  if (isLoading) {
    return (
      <div className="relative h-[500px] rounded-lg bg-slate-100 flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading map data...</div>
      </div>
    );
  }
  
  return (
    <div className="relative h-[500px] rounded-lg overflow-hidden border border-border bg-card">
      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-0 left-0 z-30 bg-black/70 text-white text-xs p-1 rounded-br">
          Vessels: {vessels.length} | Displayed: {displayVessels.length} | Refineries: {refineries.length}
        </div>
      )}
      
      {/* Stable Map Container - key prevents remounting */}
      <div className="absolute inset-0 w-full h-full z-0" style={{ width: '100%', height: '100%' }}>
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
    </div>
  );
}

// Create a memoized version of the component to prevent unnecessary re-renders
export default memo(SimpleLeafletMap);