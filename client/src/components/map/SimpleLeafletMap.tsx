import { useEffect, useRef, useState, useMemo } from 'react';
import { type Vessel, type Refinery } from '@shared/schema';
import { type Region } from '@/types';
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
  const routeLinesRef = useRef<any[]>([]);
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
  
  // Initialize and update the map when dependencies change
  useEffect(() => {
    // Don't proceed until Leaflet is loaded and we're not in loading state
    if (!isMapReady || isLoading) return;
    
    const L = window.L;
    if (!L) return;
    
    const mapContainer = document.getElementById(MAP_CONTAINER_ID);
    if (!mapContainer) return;
    
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
    
    // Filter and add vessel markers - only show cargo vessels
    console.log(`Processing ${vessels.length} vessels for display on map`);
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
              backdrop-filter: blur(10px);
              -webkit-backdrop-filter: blur(10px);
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
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 4px;
              ">
                <span style="
                  background-color: ${getVesselColor()};
                  color: white;
                  padding: 3px 6px;
                  border-radius: 12px;
                  font-size: 10px;
                  display: inline-block;
                ">
                  ${vessel.currentRegion || 'Unknown Region'}
                </span>
                
                <div style="display: flex; gap: 4px; margin-top: 4px; width: 100%;">
                  <button 
                    class="vessel-view-details-btn"
                    vessel-id="${vessel.id}"
                    style="
                      flex: 1;
                      background-color: ${getVesselColor()};
                      color: white;
                      border: none;
                      padding: 5px 8px;
                      border-radius: 4px;
                      font-size: 11px;
                      font-weight: 500;
                      cursor: pointer;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      gap: 4px;
                    "
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    View Details
                  </button>
                  
                  <button 
                    class="vessel-track-btn"
                    vessel-id="${vessel.id}"
                    style="
                      flex: 1;
                      background-color: #f8f9fa;
                      color: #555;
                      border: 1px solid #ddd;
                      padding: 5px 8px;
                      border-radius: 4px;
                      font-size: 11px;
                      font-weight: 500;
                      cursor: pointer;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      gap: 4px;
                    "
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s-8-4.5-8-11.8a8 8 0 0 1 16 0c0 7.3-8 11.8-8 11.8Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    Track Vessel
                  </button>
                </div>
              </div>
            </div>
          </div>
        `, { 
          minWidth: 220,
          maxWidth: 280,
          className: 'vessel-popup-container'
        })
        .on('click', () => {})
        .on('popupopen', function() {
          // Add event listeners to buttons after popup is open
          setTimeout(() => {
            const popup = marker.getPopup();
            const container = popup.getElement();
            
            const viewDetailsBtn = container?.querySelector('.vessel-view-details-btn');
            if (viewDetailsBtn) {
              viewDetailsBtn.addEventListener('click', (e: MouseEvent) => {
                e.stopPropagation();
                if (onVesselClick) {
                  onVesselClick(vessel);
                }
                marker.closePopup();
              });
            }
            
            const trackBtn = container?.querySelector('.vessel-track-btn');
            if (trackBtn) {
              trackBtn.addEventListener('click', (e: MouseEvent) => {
                e.stopPropagation();
                
                // Create a notification
                const notification = document.createElement('div');
                notification.style.cssText = `
                  position: fixed;
                  top: 20px;
                  right: 20px;
                  background-color: ${getVesselColor()};
                  color: white;
                  padding: 12px 16px;
                  border-radius: 8px;
                  z-index: 9999;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                  font-size: 14px;
                  max-width: 300px;
                  opacity: 0;
                  transform: translateY(-20px);
                  transition: opacity 0.2s, transform 0.3s;
                  display: flex;
                  align-items: center;
                  gap: 10px;
                `;
                
                // Add tracking icon
                const icon = document.createElement('div');
                icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s-8-4.5-8-11.8a8 8 0 0 1 16 0c0 7.3-8 11.8-8 11.8Z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
                notification.appendChild(icon);
                
                // Add message
                const message = document.createElement('div');
                message.textContent = `Now tracking vessel ${vessel.name}`;
                notification.appendChild(message);
                
                document.body.appendChild(notification);
                
                // Show notification with animation
                setTimeout(() => {
                  notification.style.opacity = '1';
                  notification.style.transform = 'translateY(0)';
                }, 50);
                
                // Track this vessel - center map on vessel
                if (map) {
                  map.setView([lat, lng], Math.max(map.getZoom(), 6));
                  
                  // Always draw a route path when tracking a vessel
                  if (vessel.destinationPort) {
                    // Create a destination point based on vessel's course
                    // We'll draw a simulated path in the general direction the vessel might be heading
                    
                    // Determine a reasonable distance (around 500-1000km) in the general direction
                    // Use cardinal direction based on region or random if not available
                    
                    // This creates a point roughly 500-800km away in a direction that makes sense
                    // for the vessel's current location
                    const getDestinationPoint = () => {
                      // Define angle based on region
                      let angle = 0; // Default east
                      
                      // Try to make the angle somewhat logical based on region
                      const region = vessel.currentRegion?.toLowerCase() || '';
                      
                      if (region.includes('north america')) {
                        if (lng < -100) angle = 270; // West coast - head west
                        else if (lng > -75) angle = 90; // East coast - head east
                        else angle = 180; // Center - head south
                      } 
                      else if (region.includes('europe')) {
                        if (lng < 0) angle = 270; // Western Europe - head west
                        else angle = 90; // Eastern Europe - head east
                      }
                      else if (region.includes('asia')) {
                        if (lat > 30) angle = 90; // Northern Asia - head east
                        else angle = 180; // Southern Asia - head south
                      }
                      else if (region.includes('middle east')) {
                        angle = 135; // Head southeast
                      }
                      else if (region.includes('africa')) {
                        if (lat > 0) angle = 0; // Northern Africa - head north
                        else angle = 180; // Southern Africa - head south
                      }
                      else if (region.includes('australia')) {
                        angle = 0; // Head north
                      }
                      else if (region.includes('south america')) {
                        angle = 0; // Head north
                      }
                      else {
                        // Random angle if no region info
                        angle = Math.floor(Math.random() * 360);
                      }
                      
                      // Convert angle to radians
                      const angleRad = angle * Math.PI / 180;
                      
                      // Distance in degrees (roughly 5-8 degrees = 500-800km)
                      const distance = 5 + Math.random() * 3;
                      
                      // Calculate new point
                      const destLat = lat + distance * Math.cos(angleRad);
                      const destLng = lng + distance * Math.sin(angleRad);
                      
                      return [destLat, destLng];
                    };
                    
                    const destinationPoint = getDestinationPoint();
                    
                    // Create a curved path for more natural looking routes
                    // We'll use a simple curve with a control point
                    const midLat = (lat + destinationPoint[0]) / 2;
                    const midLng = (lng + destinationPoint[1]) / 2;
                    
                    // Add some curve variation
                    const curveVariation = Math.random() * 1.5;
                    const controlPoint = [
                      midLat + curveVariation * Math.sin((lng + lat) / 20), 
                      midLng + curveVariation * Math.cos((lng + lat) / 20)
                    ];
                    
                    // Create a curved path using a Bézier curve approximation with points
                    const curvePoints = [];
                    const steps = 20;
                    for (let i = 0; i <= steps; i++) {
                      const t = i / steps;
                      // Quadratic Bézier curve formula
                      const lat_ = (1-t)*(1-t)*lat + 2*(1-t)*t*controlPoint[0] + t*t*destinationPoint[0];
                      const lng_ = (1-t)*(1-t)*lng + 2*(1-t)*t*controlPoint[1] + t*t*destinationPoint[1];
                      curvePoints.push([lat_, lng_]);
                    }
                    
                    // Create the route line
                    const routeLine = L.polyline(
                      curvePoints,
                      {
                        color: getVesselColor(),
                        weight: 3,
                        opacity: 0.7,
                        dashArray: '10, 10',
                        className: 'vessel-route-line'
                      }
                    ).addTo(map);
                    
                    // Store reference to remove later
                    routeLinesRef.current.push({
                      vesselId: vessel.id,
                      line: routeLine
                    });
                    
                    // Add animated dash effect
                    const lineElement = routeLine.getElement();
                    if (lineElement) {
                      lineElement.classList.add('animated-dash');
                    }
                    
                    // Add destination marker with label
                    const destinationMarker = L.circleMarker(
                      destinationPoint, 
                      {
                        radius: 5,
                        color: getVesselColor(),
                        fillColor: getVesselColor(),
                        fillOpacity: 0.7,
                        weight: 2
                      }
                    ).addTo(map);
                    
                    // Add destination label
                    const destinationLabel = L.tooltip({
                      permanent: true,
                      direction: 'top',
                      className: 'destination-label',
                      offset: [0, -10]
                    })
                    .setContent(`<div style="color:${getVesselColor()};font-weight:bold;font-size:12px;">${vessel.destinationPort}</div>`)
                    .setLatLng(destinationPoint);
                    
                    destinationMarker.bindTooltip(destinationLabel).openTooltip();
                    
                    // Add to references for cleanup
                    routeLinesRef.current.push({
                      vesselId: vessel.id,
                      marker: destinationMarker
                    });
                  }
                }
                
                // Add subtle highlight effect to the marker
                const markerEl = marker.getElement();
                if (markerEl) {
                  markerEl.classList.add('tracking-active');
                }
                
                // Remove notification after 3 seconds
                setTimeout(() => {
                  notification.style.opacity = '0';
                  notification.style.transform = 'translateY(-20px)';
                  
                  setTimeout(() => {
                    document.body.removeChild(notification);
                  }, 300);
                }, 3000);
                
                marker.closePopup();
              });
            }
          }, 100);
        })
        .addTo(map);
      
      vesselMarkersRef.current.push(marker);
    });
    
    // Add refinery markers
    console.log(`Processing ${refineries.length} refineries for display on map`);
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
      
      // Create SVG icon based on refinery icon image
      const getRefineryIcon = () => {
        return `
          <svg width="28" height="28" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M128 42.667C128 19.103 147.103 0 170.667 0H256V85.333H128V42.667Z" fill="#f8b195"/>
            <path d="M128 85.333H256V128H128V85.333Z" fill="#f67280"/>
            <path d="M179.2 170.667C163.2 170.667 149.333 159.147 149.333 144.841C149.333 130.56 163.2 128 179.2 128H204.8C220.8 128 234.667 130.56 234.667 144.841C234.667 159.147 220.8 170.667 204.8 170.667H179.2Z" fill="#1a1a1a"/>
            <path d="M128 170.667H256V384H128V170.667Z" fill="#f8b195"/>
            <path d="M128 384H256V426.667H128V384Z" fill="#f67280"/>
            <path d="M113.067 426.667H270.933C278.933 426.667 285.333 433.067 285.333 441.067V498.133C285.333 505.6 278.933 512 270.933 512H113.067C105.067 512 98.667 505.6 98.667 498.133V441.067C98.667 433.067 105.067 426.667 113.067 426.667Z" fill="#c06c84"/>
            <path d="M396.8 362.667H332.8C323.733 362.667 317.867 352.427 322.587 344.8L354.56 292.267C355.84 290.133 356.267 287.573 356.267 285.013V98.133C356.267 92.16 361.173 87.253 367.147 87.253H377.067C391.52 87.253 406.187 87.093 406.187 107.947V285.013C406.187 287.573 406.613 290.133 407.893 292.267L439.867 344.8C444.587 352.427 438.72 362.667 429.653 362.667Z" fill="#a5c6e7"/>
            <path d="M311.467 277.333H247.467C238.4 277.333 232.533 267.093 237.253 259.467L269.227 206.933C270.507 204.8 270.933 202.24 270.933 199.68C270.933 193.707 275.84 188.8 281.813 188.8C284.373 188.8 286.933 189.227 289.067 190.507L341.6 222.48C349.227 227.2 349.227 238.933 341.6 243.627L289.067 275.627C286.933 276.907 284.373 277.333 281.813 277.333H311.467Z" fill="#9399d4"/>
            <path d="M469.333 362.667V469.333C469.333 475.307 464.427 480.213 458.453 480.213H448.533C442.56 480.213 437.653 475.307 437.653 469.333V362.667H469.333Z" fill="#a5c6e7"/>
            <path d="M416 426.667C422.667 426.667 428.373 432.373 428.373 439.04V448.96C428.373 455.627 422.667 461.333 416 461.333C409.333 461.333 403.627 455.627 403.627 448.96V439.04C403.627 432.373 409.333 426.667 416 426.667Z" fill="#5c9ade"/>
            <path d="M416 384C422.667 384 428.373 389.707 428.373 396.373V406.293C428.373 412.96 422.667 418.667 416 418.667C409.333 418.667 403.627 412.96 403.627 406.293V396.373C403.627 389.707 409.333 384 416 384Z" fill="#5c9ade"/>
            <path d="M512 0H396.8V42.667H512V0Z" fill="#a5c6e7"/>
          </svg>
        `;
      };
      
      const refineryIcon = L.divIcon({
        html: `
          <div class="refinery-marker-container">
            <div class="refinery-marker-glow" style="background-color: ${getRefineryColor()}33;"></div>
            <div class="refinery-marker" style="
              width: 42px;
              height: 42px;
              border-radius: 8px;
              background: rgba(255,255,255,0.98);
              display: flex;
              align-items: center;
              justify-content: center;
              border: 3px solid ${getRefineryColor()};
              box-shadow: 0 3px 6px rgba(0,0,0,0.3);
              text-align: center;
              z-index: 910;
              position: relative;
              padding: 2px;
            ">
              ${getRefineryIcon()}
            </div>
          </div>
        `,
        className: 'refinery-marker-wrapper',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });
      
      // Create the popup content with buttons that have proper onclick handlers
      const popupContent = document.createElement('div');
      popupContent.className = 'refinery-popup';
      popupContent.innerHTML = `
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
            width: 26px;
            height: 26px;
            border-radius: 4px;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid ${getRefineryColor()};
            padding: 1px;
          ">${getRefineryIcon()}</div>
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
          
          <div style="
            border-top: 1px solid #eee;
            margin-top: 8px;
            padding-top: 8px;
            display: flex;
            justify-content: center;
            gap: 6px;
          ">
            <button id="view-details-btn-${refinery.id}" style="
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
            <button id="view-vessels-btn-${refinery.id}" style="
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
                
                // First, clear any previous connection lines
                clearConnectionLines();
                
                // Reset any previous highlights
                document.querySelectorAll('.highlight-marker, .nearby-vessel-highlight').forEach(el => {
                  el.classList.remove('highlight-marker', 'nearby-vessel-highlight');
                });
                
                // Add a nice notification
                const notification = document.createElement('div');
                notification.style.cssText = `
                  position: fixed;
                  top: 20px;
                  left: 50%;
                  transform: translateX(-50%);
                  background-color: rgba(255, 255, 255, 0.95);
                  color: #333;
                  padding: 10px 20px;
                  border-radius: 8px;
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                  z-index: 10000;
                  font-size: 14px;
                  text-align: center;
                  border-left: 4px solid ${getRefineryColor()};
                  font-weight: 500;
                  transition: all 0.3s ease;
                  backdrop-filter: blur(10px);
                  -webkit-backdrop-filter: blur(10px);
                `;
                notification.innerHTML = `Showing vessels for refinery: ${refinery.name}`;
                document.body.appendChild(notification);
                
                // Get coordinates for this refinery
                const refineryLat = typeof refinery.lat === 'number' 
                  ? refinery.lat 
                  : parseFloat(String(refinery.lat));
                  
                const refineryLng = typeof refinery.lng === 'number'
                  ? refinery.lng
                  : parseFloat(String(refinery.lng));
                
                // Find vessels that are near this refinery (within ~500km)
                const nearbyVessels = displayVessels.filter(vessel => {
                  if (!vessel.currentLat || !vessel.currentLng) return false;
                  
                  const vesselLat = typeof vessel.currentLat === 'number'
                    ? vessel.currentLat
                    : parseFloat(String(vessel.currentLat));
                    
                  const vesselLng = typeof vessel.currentLng === 'number'
                    ? vessel.currentLng
                    : parseFloat(String(vessel.currentLng));
                    
                  // Calculate approximate distance (rough calculation)
                  const latDiff = Math.abs(vesselLat - refineryLat);
                  const lngDiff = Math.abs(vesselLng - refineryLng);
                  
                  // Rough approximation for ~500km
                  return (latDiff*latDiff + lngDiff*lngDiff) < 25;
                });
                
                if (map) {
                  // First zoom to refinery
                  map.setView([refineryLat, refineryLng], 6);
                  
                  // Highlight the refinery marker
                  const markerEl = marker.getElement();
                  if (markerEl) {
                    markerEl.classList.add('highlight-marker');
                    
                    // Remove highlight after 30 seconds
                    setTimeout(() => {
                      markerEl.classList.remove('highlight-marker');
                    }, 30000);
                  }
                  
                  // Highlight associated vessels and draw connection lines
                  nearbyVessels.forEach(vessel => {
                    // Find this vessel's marker
                    const vesselMarker = vesselMarkersRef.current.find(m => {
                      return m._latlng && 
                        vessel.currentLat && 
                        vessel.currentLng && 
                        m._latlng.lat === parseFloat(String(vessel.currentLat)) && 
                        m._latlng.lng === parseFloat(String(vessel.currentLng));
                    });
                    
                    if (vesselMarker) {
                      const vesselMarkerEl = vesselMarker.getElement();
                      if (vesselMarkerEl) {
                        vesselMarkerEl.classList.add('nearby-vessel-highlight');
                        
                        // Remove highlight after 30 seconds
                        setTimeout(() => {
                          vesselMarkerEl.classList.remove('nearby-vessel-highlight');
                        }, 30000);
                      }
                      
                      // Create a line connecting the vessel to the refinery
                      const vesselLat = typeof vessel.currentLat === 'number'
                        ? vessel.currentLat
                        : parseFloat(String(vessel.currentLat));
                        
                      const vesselLng = typeof vessel.currentLng === 'number'
                        ? vessel.currentLng
                        : parseFloat(String(vessel.currentLng));
                      
                      // Draw a curved line from vessel to refinery
                      const midLat = (vesselLat + refineryLat) / 2;
                      const midLng = (vesselLng + refineryLng) / 2;
                      
                      // Add some curve variation
                      const curveVariation = Math.random() * 0.7 - 0.35;  // Random between -0.35 and 0.35
                      const controlPoint = [
                        midLat + curveVariation, 
                        midLng + curveVariation
                      ];
                      
                      // Create a curved path using a Bézier curve approximation
                      const curvePoints = [];
                      const steps = 20;
                      for (let i = 0; i <= steps; i++) {
                        const t = i / steps;
                        // Quadratic Bézier curve formula
                        const lat_ = (1-t)*(1-t)*vesselLat + 2*(1-t)*t*controlPoint[0] + t*t*refineryLat;
                        const lng_ = (1-t)*(1-t)*vesselLng + 2*(1-t)*t*controlPoint[1] + t*t*refineryLng;
                        curvePoints.push([lat_, lng_]);
                      }
                      
                      // Create connection line
                      const connectionLine = L.polyline(
                        curvePoints,
                        {
                          color: getRefineryColor(),
                          weight: 2,
                          opacity: 0.6,
                          dashArray: '5, 8',
                          className: 'vessel-refinery-connection'
                        }
                      ).addTo(map);
                      
                      // Store reference to remove later
                      routeLinesRef.current.push({
                        vesselId: vessel.id,
                        line: connectionLine
                      });
                    }
                  });
                  
                  // Show notification of how many vessels were found
                  const countNotification = document.createElement('div');
                  countNotification.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background-color: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    z-index: 10000;
                    font-size: 14px;
                    text-align: center;
                    font-weight: 500;
                    transition: all 0.3s ease;
                  `;
                  countNotification.innerHTML = `Found ${nearbyVessels.length} vessels associated with ${refinery.name}`;
                  document.body.appendChild(countNotification);
                  
                  // Remove count notification after 10 seconds
                  setTimeout(() => {
                    countNotification.style.opacity = '0';
                    countNotification.style.transform = 'translate(-50%, 20px)';
                    
                    setTimeout(() => {
                      document.body.removeChild(countNotification);
                    }, 300);
                  }, 10000);
                }
                
                // Close popup after clicking
                marker.closePopup();
                
                // Remove notification after 3 seconds
                setTimeout(() => {
                  notification.style.opacity = '0';
                  notification.style.transform = 'translate(-50%, -20px)';
                  
                  setTimeout(() => {
                    document.body.removeChild(notification);
                  }, 300);
                }, 3000);
              });
            }
          }, 100);
        })
        .addTo(map);
      
      refineryMarkersRef.current.push(marker);
    });
    
    // Set view based on priority:
    // 1. initialCenter/initialZoom (if provided)
    // 2. Selected region
    // 3. Default view (already set when map was created)
    if (initialCenter && initialZoom) {
      try {
        // Make sure we have valid coordinates
        const validLat = typeof initialCenter[0] === 'number' ? initialCenter[0] : parseFloat(initialCenter[0] as any);
        const validLng = typeof initialCenter[1] === 'number' ? initialCenter[1] : parseFloat(initialCenter[1] as any);
        
        if (!isNaN(validLat) && !isNaN(validLng)) {
          console.log('Setting map view to:', [validLat, validLng], initialZoom);
          map.setView([validLat, validLng], initialZoom);
        } else {
          console.error('Invalid coordinates:', initialCenter);
          map.setView([0, 0], 2); // Default to world view if invalid
        }
      } catch (err) {
        console.error('Error setting map view:', err);
        map.setView([0, 0], 2); // Default to world view on error
      }
    } else if (selectedRegion) {
      const position = regionPositions[selectedRegion];
      if (position) {
        map.setView([position.lat, position.lng], position.zoom);
      }
    }
    
    // Make sure map is sized properly
    map.invalidateSize();
    
  }, [
    isMapReady,
    vessels,
    refineries,
    selectedRegion,
    mapStyle,
    mapLanguage,
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
      
      {/* Tracking functionality removed */}
    </div>
  );
}