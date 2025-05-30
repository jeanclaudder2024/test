import { useEffect, useRef, useState } from 'react';
import { type Port, type Vessel } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Ship, Navigation } from 'lucide-react';

// Define Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

interface PortDetailMapProps {
  port: Port;
  nearbyVessels?: Vessel[];
  height?: string;
  onVesselClick?: (vessel: Vessel) => void;
}

export default function PortDetailMap({ 
  port, 
  nearbyVessels = [], 
  height = '300px',
  onVesselClick
}: PortDetailMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const vesselMarkersRef = useRef<any[]>([]);
  const portMarkerRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
    if (!isMapReady || !port || !port.lat || !port.lng) {
      return;
    }
    
    const L = window.L;
    if (!L || !mapContainerRef.current) return;
    
    setIsLoading(true);
    
    // Parse port coordinates
    const portLat = typeof port.lat === 'number' ? port.lat : parseFloat(String(port.lat));
    const portLng = typeof port.lng === 'number' ? port.lng : parseFloat(String(port.lng));
    
    if (isNaN(portLat) || isNaN(portLng)) {
      console.error('Invalid port coordinates:', port.lat, port.lng);
      setIsLoading(false);
      return;
    }
    
    // Function to clear all existing markers
    const clearMarkers = () => {
      // Clear vessel markers
      vesselMarkersRef.current.forEach(marker => {
        if (marker && typeof marker.remove === 'function') {
          marker.remove();
        }
      });
      vesselMarkersRef.current = [];
      
      // Clear port marker
      if (portMarkerRef.current && typeof portMarkerRef.current.remove === 'function') {
        portMarkerRef.current.remove();
        portMarkerRef.current = null;
      }
    };
    
    // Initialize or update map
    let map = mapRef.current;
    
    if (!map) {
      // Create new map centered on the port
      map = L.map(mapContainerRef.current, {
        center: [portLat, portLng],
        zoom: 9,
        minZoom: 2,
        maxZoom: 18,
        worldCopyJump: true
      });
      
      mapRef.current = map;
    } else {
      // Clear existing markers before updating
      clearMarkers();
      
      // Update map center and zoom
      map.setView([portLat, portLng], 9);
      
      // Remove existing tile layer
      map.eachLayer((layer: any) => {
        if (layer && layer._url) { // Check if it's a tile layer
          map.removeLayer(layer);
        }
      });
    }
    
    // Add tile layer - using a light style for better visibility
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);
    
    // Create port marker with custom icon
    const portIcon = L.divIcon({
      html: `
        <div class="port-marker" style="
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255,255,255,0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid #1e40af;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          font-size: 16px;
          text-align: center;
          z-index: 900;
          position: relative;
        ">
          <span style="color: #1e40af;">⚓</span>
        </div>
      `,
      className: 'port-marker-wrapper',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
    
    // Add port marker
    portMarkerRef.current = L.marker([portLat, portLng], { icon: portIcon })
      .bindPopup(`
        <div class="p-2">
          <div class="font-bold text-sm">${port.name}</div>
          <div class="text-xs">${port.country}</div>
          <div class="text-xs mt-1">${port.type} Port</div>
        </div>
      `)
      .addTo(map);
    
    // Add vessel markers
    if (nearbyVessels && nearbyVessels.length > 0) {
      nearbyVessels.forEach(vessel => {
        if (!vessel.currentLat || !vessel.currentLng) return;
        
        const lat = typeof vessel.currentLat === 'number'
          ? vessel.currentLat
          : parseFloat(String(vessel.currentLat));
          
        const lng = typeof vessel.currentLng === 'number'
          ? vessel.currentLng
          : parseFloat(String(vessel.currentLng));
          
        if (isNaN(lat) || isNaN(lng)) return;
        
        // Get vessel color based on type
        const getVesselColor = () => {
          const type = vessel.vesselType?.toLowerCase() || '';
          if (type.includes('lng')) return "#4ECDC4";
          if (type.includes('container')) return "#118AB2";
          if (type.includes('chemical')) return "#9A48D0";
          if (type.includes('cargo')) return "#FFD166";
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
        
        // Calculate distance from port
        const distance = calculateDistance(
          portLat, portLng,
          lat, lng
        );
        
        // Create custom vessel icon
        const vesselIcon = L.divIcon({
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
        
        // Add vessel marker with popup
        const marker = L.marker([lat, lng], { icon: vesselIcon })
          .bindPopup(`
            <div class="p-2">
              <div class="font-bold text-sm">${vessel.name}</div>
              <div class="text-xs">${vessel.vesselType}</div>
              <div class="text-xs text-muted-foreground">${vessel.flag}</div>
              <div class="text-xs mt-1">~${Math.round(distance)} km from port</div>
            </div>
          `)
          .addTo(map);
          
        // Add click handler for vessel marker if onVesselClick is provided
        if (onVesselClick) {
          marker.on('click', () => {
            onVesselClick(vessel);
          });
        }
        
        vesselMarkersRef.current.push(marker);
      });
      
      // Add circle around port to show range
      const radiusCircle = L.circle([portLat, portLng], {
        radius: 50000, // 50km radius
        color: '#1e40af',
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        weight: 1
      }).addTo(map);
    }
    
    // Make sure the map is sized correctly
    setTimeout(() => {
      if (map) {
        map.invalidateSize();
      }
      setIsLoading(false);
    }, 100);
    
  }, [isMapReady, port, nearbyVessels, onVesselClick]);
  
  // Function to calculate distance between two coordinates in kilometers
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
  
  // Add custom CSS for animation and styling
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .vessel-marker-pulse {
        position: absolute;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 3px solid #FF6B6B;
        opacity: 0.8;
        animation: pulse 2s infinite;
        z-index: 899;
      }
      
      @keyframes pulse {
        0% {
          transform: scale(0.9);
          opacity: 0.8;
        }
        70% {
          transform: scale(1.3);
          opacity: 0;
        }
        100% {
          transform: scale(0.9);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <div className="relative w-full" style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <span className="text-sm">Loading map...</span>
          </div>
        </div>
      )}
      
      <div ref={mapContainerRef} className="w-full h-full rounded-md" />
      
      <div className="absolute bottom-3 left-3 z-10">
        <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-xs shadow-sm">
          <MapPin className="h-3 w-3 mr-1 text-primary" />
          <span>{port.name}, {port.country}</span>
        </Badge>
      </div>
      
      <div className="absolute top-3 right-3 z-10">
        <div className="bg-background/90 backdrop-blur-sm text-xs px-2.5 py-1 rounded-full flex items-center shadow-sm border border-border">
          <Ship className="h-3 w-3 mr-1 text-primary" />
          <span>{nearbyVessels.length} nearby vessels</span>
        </div>
      </div>
    </div>
  );
}