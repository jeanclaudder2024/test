import { useEffect, useState, useRef, memo } from 'react';
import { Vessel, Refinery } from '@shared/schema';
import { REGIONS } from '@shared/constants';
import MapContainer from './MapContainer';
import { mapStyles, LanguageOption } from './MapStyles';
import { Map, Info, Globe2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define the region type
type Region = typeof REGIONS[number];

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
  
  // Function to handle map style changes
  const handleStyleChange = (style: string) => {
    setMapStyle(style);
  };
  
  // Function to handle map language changes
  const handleLanguageChange = (language: LanguageOption) => {
    setMapLanguage(language);
  };
  
  // Define vessel icon style based on cargo type
  const getVesselIcon = (cargoType: string = '', isSelected: boolean = false) => {
    // Define colors for different cargo types
    const colors: Record<string, string> = {
      'Crude Oil': '#e74c3c',
      'LNG': '#f39c12',
      'LPG': '#e67e22',
      'Refined Products': '#3498db',
      'Jet Fuel': '#9b59b6',
      'Gasoline': '#2ecc71',
      'Diesel': '#1abc9c',
      'Chemicals': '#d35400',
      'Petrochemicals': '#c0392b'
    };
    
    // Default color if cargo type doesn't match
    const defaultColor = '#95a5a6';
    
    // Use matched color or default
    const color = colors[cargoType] || defaultColor;
    
    // Make the selected vessel icon larger and differently styled
    return {
      color: isSelected ? '#2980b9' : color,
      fillColor: color,
      fillOpacity: isSelected ? 0.9 : 0.6,
      weight: isSelected ? 3 : 1,
      radius: isSelected ? 8 : 5,
      pulsing: isSelected
    };
  };

  // Define refinery icon style based on status
  const getRefineryIcon = (status: string = '', isSelected: boolean = false) => {
    // Define colors for different statuses
    const colors: Record<string, string> = {
      'operational': '#27ae60',
      'maintenance': '#f39c12',
      'offline': '#e74c3c',
      'planned': '#3498db'
    };
    
    // Default color if status doesn't match
    const defaultColor = '#7f8c8d';
    
    // Use matched color or default
    const color = colors[status] || defaultColor;
    
    // Make the selected refinery icon larger and differently styled
    return {
      color: isSelected ? '#2980b9' : color,
      fillColor: color,
      fillOpacity: isSelected ? 0.8 : 0.6,
      weight: isSelected ? 3 : 1,
      radius: isSelected ? 12 : 7
    };
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
  
  // Function to check if a coordinate is at sea (not on land)
  const isCoordinateAtSea = (lat: number, lng: number): boolean => {
    // Simple approximation - real implementation would be more complex
    return true;
  };
  
  // Main effect to initialize and update the map
  useEffect(() => {
    if (!isMapReady || !window.L) {
      // Wait for Leaflet to be loaded
      return;
    }
    
    console.log('Initializing map with vessels:', vessels.length, 'refineries:', refineries.length);
    
    const mapContainer = document.getElementById(MAP_CONTAINER_ID);
    if (!mapContainer) {
      console.error('Map container element not found with ID:', MAP_CONTAINER_ID);
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
    
    // Filter vessels to display
    const filteredVessels = vessels
      .filter(vessel => {
        // Filter by region if selected
        if (selectedRegion && vessel.currentRegion !== selectedRegion.id) {
          return false;
        }
        
        // Check for valid coordinates
        if (!vessel.currentLat || !vessel.currentLng) {
          return false;
        }
        
        const lat = typeof vessel.currentLat === 'number' 
          ? vessel.currentLat 
          : parseFloat(String(vessel.currentLat));
          
        const lng = typeof vessel.currentLng === 'number'
          ? vessel.currentLng
          : parseFloat(String(vessel.currentLng));
          
        if (isNaN(lat) || isNaN(lng)) {
          return false;
        }
        
        return true;
      })
      .slice(0, 500); // Show up to 500 vessels for performance
    
    console.log('Filtered vessels for map:', filteredVessels.length);
    setDisplayVessels(filteredVessels);
    
    // Create vessel markers
    filteredVessels.forEach(vessel => {
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
        if (type.includes('cargo')) return "#FFD166";
        if (type.includes('container')) return "#118AB2";
        if (type.includes('chemical')) return "#9A48D0";
        return "#FF6B6B"; // Default oil tanker color
      };
      
      // Create marker
      const marker = L.circleMarker([lat, lng], {
        radius: 5,
        fillColor: getVesselColor(),
        color: "#fff",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
      
      // Add tooltip
      marker.bindTooltip(`
        <div>
          <strong>${vessel.name}</strong><br>
          ${vessel.vesselType || 'Vessel'}<br>
          ${vessel.flag ? `Flag: ${vessel.flag}` : ''}
        </div>
      `);
      
      // Add click handler
      marker.on('click', () => {
        onVesselClick(vessel);
      });
      
      marker.addTo(map);
      vesselMarkersRef.current.push(marker);
    });
    
    // Create refinery markers
    refineries.forEach(refinery => {
      if (!refinery.lat || !refinery.lng) return;
      
      const lat = typeof refinery.lat === 'number' 
        ? refinery.lat 
        : parseFloat(String(refinery.lat));
        
      const lng = typeof refinery.lng === 'number'
        ? refinery.lng
        : parseFloat(String(refinery.lng));
        
      if (isNaN(lat) || isNaN(lng)) return;
      
      // Get marker color based on status
      const getMarkerColor = () => {
        if (!refinery.status) return "#7F8C8D"; // Default gray
        
        const status = refinery.status.toLowerCase();
        if (status.includes('operational')) return "#27AE60";
        if (status.includes('maintenance')) return "#F39C12";
        if (status.includes('offline')) return "#E74C3C";
        if (status.includes('planned')) return "#3498DB";
        
        return "#7F8C8D"; // Unknown status
      };
      
      // Create marker
      const marker = L.circleMarker([lat, lng], {
        radius: 8,
        fillColor: getMarkerColor(),
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      });
      
      // Add tooltip
      marker.bindTooltip(`
        <div>
          <strong>${refinery.name}</strong><br>
          ${refinery.country}<br>
          Capacity: ${refinery.capacity ? `${refinery.capacity} kbd` : 'Unknown'}<br>
          Status: ${refinery.status || 'Unknown'}
        </div>
      `);
      
      // Add click handler if provided
      if (onRefineryClick) {
        marker.on('click', () => {
          onRefineryClick(refinery);
        });
      }
      
      marker.addTo(map);
      refineryMarkersRef.current.push(marker);
    });
    
    // Set initial center and zoom from props if provided
    if (initialCenter && initialZoom) {
      map.setView(initialCenter, initialZoom);
    } else if (selectedRegion) {
      // Center on selected region
      // For now, just default to a zoom level at middle east
      // We need to associate regions with map centers in a future update
      map.setView([25, 45], 4);
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
const MemoizedLeafletMap = memo(SimpleLeafletMap);
export default MemoizedLeafletMap;