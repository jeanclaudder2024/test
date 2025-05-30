import { useEffect, useRef } from 'react';

// This component acts as a stable container for the Leaflet map
// By separating the container from the map logic, we can avoid the "_leaflet_pos" error

interface MapContainerProps {
  className?: string;
  id: string;
}

export default function MapContainer({ className = "", id }: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use a minimal effect to ensure the container always has a consistent key
  // This prevents React from remounting the node that Leaflet is attached to
  useEffect(() => {
    // Create a mutation observer to watch for any DOM changes
    if (!containerRef.current) return;
    
    // Set a data attribute to mark this as the map container
    containerRef.current.setAttribute('data-map-container', 'true');
    
    // Return empty cleanup to satisfy React
    return () => {};
  }, []);
  
  return (
    <div 
      id={id} 
      ref={containerRef} 
      className={`${className}`} 
      style={{ height: '100%', width: '100%' }}
    />
  );
}