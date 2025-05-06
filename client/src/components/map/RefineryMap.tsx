import { useEffect, useRef } from 'react';
import { Refinery } from '@shared/schema';
import { Compass, ZoomIn, ZoomOut, Map as MapIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Define Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

interface RefineryMapProps {
  refinery: Refinery;
  height?: string;
  className?: string;
}

export default function RefineryMap({ refinery, height = '400px', className = '' }: RefineryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const mapInitialized = useRef(false);

  useEffect(() => {
    // Wait for the component to mount
    if (!mapRef.current || mapInitialized.current) return;

    // Make sure Leaflet is available
    if (!window.L) {
      console.error('Leaflet is not loaded');
      return;
    }

    const L = window.L;
    
    // Parse and validate coordinates
    let lat = 0, lng = 0;
    
    try {
      lat = typeof refinery.lat === 'number' 
        ? refinery.lat 
        : Number(refinery.lat || 0);
        
      lng = typeof refinery.lng === 'number'
        ? refinery.lng
        : Number(refinery.lng || 0);
        
      // Validate coordinates
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        console.error('Invalid coordinates:', { lat, lng });
        lat = 0;
        lng = 0;
      }
    } catch (error) {
      console.error('Error parsing coordinates:', error);
      lat = 0;
      lng = 0;
    }

    // Initialize map with modern style
    leafletMap.current = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: 9,
      zoomControl: false, // We'll add custom zoom controls
      scrollWheelZoom: true,
      attributionControl: false,
    });

    // Add a modern and minimal tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(leafletMap.current);

    // Add attribution in a more subtle way
    L.control.attribution({
      position: 'bottomright',
      prefix: false
    }).addTo(leafletMap.current);

    // Create a custom refinery icon
    const refineryIcon = L.divIcon({
      html: `
        <div class="relative group">
          <div class="absolute -inset-0.5 rounded-full bg-primary opacity-25 blur group-hover:opacity-50 transition"></div>
          <div class="relative flex items-center justify-center w-10 h-10 bg-background rounded-full border-2 border-primary shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
              <path d="M2 22h20"></path>
              <path d="M15 10h4c.8 0 1.3.5 1.5 1.2.3 1-.2 2.2-1.2 2.8H15"></path>
              <rect x="8" y="10" width="7" height="8" rx="1"></rect>
              <path d="M8 14H5c-.8 0-1.3-.5-1.5-1.2-.3-1 .2-2.2 1.2-2.8H8"></path>
              <path d="M2 6h20"></path>
              <path d="M22 2H2"></path>
            </svg>
          </div>
        </div>
      `,
      className: 'custom-refinery-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    // Add marker for the refinery
    const marker = L.marker([lat, lng], { 
      icon: refineryIcon,
      title: refinery.name
    })
    .addTo(leafletMap.current)
    .bindPopup(`
      <div class="refinery-popup">
        <div class="font-medium text-base mb-1">${refinery.name}</div>
        <div class="text-xs text-muted-foreground mb-2">${refinery.country}, ${refinery.region}</div>
        
        <div class="text-xs font-medium mb-1 text-primary">Processing Capacity</div>
        <div class="text-sm">${refinery.capacity ? (refinery.capacity / 1000).toFixed(0) + ' kbpd' : 'N/A'}</div>
        
        <div class="mt-3 text-xs">
          <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary">${refinery.status || 'Unknown'}</span>
        </div>
      </div>
    `, {
      className: 'custom-popup',
      closeButton: false,
      maxWidth: 300,
      minWidth: 200
    });

    // Auto-open the popup
    marker.openPopup();

    // Draw a pulsing circle around the refinery
    L.circle([lat, lng], {
      color: 'var(--primary)',
      fillColor: 'var(--primary)',
      fillOpacity: 0.1,
      radius: 5000,
      weight: 1,
      className: 'pulsing-circle'
    }).addTo(leafletMap.current);

    // Add scale control
    L.control.scale({
      position: 'bottomleft',
      imperial: false
    }).addTo(leafletMap.current);

    // Add custom CSS for the pulsing effect
    const style = document.createElement('style');
    style.textContent = `
      .pulsing-circle {
        animation: pulse-animation 2s infinite;
      }
      
      @keyframes pulse-animation {
        0% { transform: scale(0.9); opacity: 0.7; }
        50% { transform: scale(1); opacity: 0.5; }
        100% { transform: scale(0.9); opacity: 0.7; }
      }
      
      .custom-popup .leaflet-popup-content-wrapper {
        border-radius: 0.5rem;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      }
      
      .custom-popup .leaflet-popup-tip {
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      }
    `;
    document.head.appendChild(style);

    mapInitialized.current = true;

    // Cleanup on unmount
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
      
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
      
      mapInitialized.current = false;
    };
  }, [refinery]);

  // Handle window resize to update map
  useEffect(() => {
    const handleResize = () => {
      if (leafletMap.current) {
        leafletMap.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Force a resize after mounting to ensure the map fully renders
    setTimeout(handleResize, 100);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleZoomIn = () => {
    if (leafletMap.current) {
      leafletMap.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (leafletMap.current) {
      leafletMap.current.zoomOut();
    }
  };

  const handleResetView = () => {
    if (leafletMap.current) {
      const lat = typeof refinery.lat === 'number' ? refinery.lat : Number(refinery.lat || 0);
      const lng = typeof refinery.lng === 'number' ? refinery.lng : Number(refinery.lng || 0);
      
      leafletMap.current.setView([lat, lng], 9);
    }
  };

  // Coordinates fallback warning
  const invalidCoordinates = !refinery.lat || !refinery.lng || 
    typeof refinery.lat === 'string' && refinery.lat.trim() === '' ||
    typeof refinery.lng === 'string' && refinery.lng.trim() === '';

  return (
    <div className={`relative rounded-lg overflow-hidden border border-border ${className}`}>
      {invalidCoordinates && (
        <div className="absolute top-3 left-3 z-20 bg-amber-50 text-amber-800 px-3 py-1.5 rounded text-xs flex items-center">
          <Badge variant="outline" className="bg-amber-100 border-amber-300 text-amber-800 mr-2">Note</Badge>
          Using fallback coordinates
        </div>
      )}
      
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full z-10"
        style={{ height }}
      />

      {/* Custom Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
        <button 
          onClick={handleZoomIn}
          className="w-8 h-8 bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm rounded-full border border-border flex items-center justify-center text-foreground transition-colors"
          title="Zoom in"
        >
          <ZoomIn size={16} />
        </button>
        
        <button 
          onClick={handleZoomOut}
          className="w-8 h-8 bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm rounded-full border border-border flex items-center justify-center text-foreground transition-colors"
          title="Zoom out"
        >
          <ZoomOut size={16} />
        </button>
        
        <button 
          onClick={handleResetView}
          className="w-8 h-8 bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm rounded-full border border-border flex items-center justify-center text-foreground transition-colors"
          title="Reset view"
        >
          <Compass size={16} />
        </button>
      </div>
      
      {/* Map Info Badge */}
      <div className="absolute top-3 right-3 z-20">
        <div className="bg-background/80 backdrop-blur-sm text-xs px-2.5 py-1 rounded-full flex items-center shadow-sm border border-border">
          <MapIcon className="h-3 w-3 mr-1 text-primary" />
          <span>Refinery Location</span>
        </div>
      </div>
    </div>
  );
}