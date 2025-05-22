import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { fixLeafletZIndexIssues } from './LeafletFixZIndex';

/**
 * Component to handle map events to ensure markers are always visible
 * This fixes z-index issues and ensures markers don't disappear on zoom
 */
export const MapEventHandler: React.FC = () => {
  const map = useMap();
  const containerRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    // Get the map container element
    containerRef.current = map.getContainer();
    
    // Force higher z-index for marker panes
    const enhanceMapVisibility = () => {
      // Apply fixes to map container
      fixLeafletZIndexIssues(containerRef.current);
      
      // Set higher z-index on map panes
      const markerPane = map.getPane('markerPane');
      if (markerPane) {
        markerPane.style.zIndex = '1000';
      }
      
      // Invalidate size to refresh map
      setTimeout(() => {
        map.invalidateSize();
      }, 50);
    };
    
    // Add event handlers for common map interactions
    map.on('zoomend', enhanceMapVisibility);
    map.on('moveend', enhanceMapVisibility);
    map.on('layeradd', enhanceMapVisibility);
    
    // Initial fix
    enhanceMapVisibility();
    
    // Run again after a slight delay to catch any delayed rendering
    const timer = setTimeout(enhanceMapVisibility, 500);
    
    return () => {
      // Clean up
      clearTimeout(timer);
      map.off('zoomend', enhanceMapVisibility);
      map.off('moveend', enhanceMapVisibility);
      map.off('layeradd', enhanceMapVisibility);
    };
  }, [map]);
  
  return null;
};

export default MapEventHandler;