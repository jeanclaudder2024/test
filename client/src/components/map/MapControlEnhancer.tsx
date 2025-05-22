import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';

/**
 * Component to enhance map visibility and fix common display issues
 * This ensures all map elements remain visible at all zoom levels 
 */
const MapControlEnhancer: React.FC = () => {
  const map = useMap();
  
  useEffect(() => {
    // Function to fix visibility issues
    const fixMapVisibility = () => {
      // Ensure marker pane has highest z-index
      const markerPane = map.getPane('markerPane');
      if (markerPane) {
        markerPane.style.zIndex = '1000';
      }
      
      // Force re-render of the map to ensure visibility
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    };
    
    // Set up event listeners for map interactions
    map.on('zoomend', fixMapVisibility);
    map.on('moveend', fixMapVisibility);
    map.on('layeradd', fixMapVisibility);
    
    // Initial fix
    fixMapVisibility();
    
    // Additional fix with slight delay to catch asynchronous loading
    const timer = setTimeout(fixMapVisibility, 500);
    
    return () => {
      clearTimeout(timer);
      map.off('zoomend', fixMapVisibility);
      map.off('moveend', fixMapVisibility);
      map.off('layeradd', fixMapVisibility);
    };
  }, [map]);
  
  return null;
};

export default MapControlEnhancer;