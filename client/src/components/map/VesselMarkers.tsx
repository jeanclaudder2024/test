import React, { useMemo, useEffect, useState } from 'react';
import { Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import VesselPopup from '../VesselPopup';

interface VesselMarkersProps {
  vessels: any[];
  getVesselIconUrl: (vessel: any) => string;
  getVesselStatus: (vessel: any) => string;
  getVesselRegion: (vessel: any) => string;
  currentZoom?: number; // Optional zoom level parameter
}

const VesselMarkers: React.FC<VesselMarkersProps> = ({
  vessels,
  getVesselIconUrl,
  getVesselStatus,
  getVesselRegion,
  currentZoom = 5
}) => {
  // Use map instance to get real-time zoom level
  const map = useMap();
  const [actualZoom, setActualZoom] = useState(currentZoom);
  const [forceUpdate, setForceUpdate] = useState(0); // Counter to force marker refresh
  
  // Listen for zoom changes to update marker sizes
  useEffect(() => {
    const handleZoomEnd = () => {
      setActualZoom(map.getZoom());
      // Force markers to refresh after zoom
      setTimeout(() => setForceUpdate(prev => prev + 1), 100);
    };
    
    map.on('zoomend', handleZoomEnd);
    map.on('moveend', handleZoomEnd);
    
    // Initial zoom setting
    setActualZoom(map.getZoom());
    
    return () => {
      map.off('zoomend', handleZoomEnd);
      map.off('moveend', handleZoomEnd);
    };
  }, [map]);
  
  // This creates a new icon instance for each vessel instead of sharing
  const createVesselIcon = (vessel: any) => {
    // Make vessels much bigger at low zoom levels
    const zoomFactor = actualZoom < 3 ? 2.5 : // Extra large at world view 
                      actualZoom < 4 ? 2.0 : // Very large at continent view
                      actualZoom < 5 ? 1.7 : // Large at region view
                      actualZoom < 6 ? 1.5 : // Larger at country view
                      actualZoom < 8 ? 1.2 : // Slightly larger at area view
                      1.0; // Normal size at local view
    
    // Base size increased from 42 to 50
    const iconSize = Math.round(50 * zoomFactor);
    const iconAnchor = Math.round(iconSize / 2);
    
    return L.icon({
      iconUrl: getVesselIconUrl(vessel),
      iconSize: [iconSize, iconSize],
      iconAnchor: [iconAnchor, iconAnchor],
      popupAnchor: [0, -iconAnchor],
      className: `vessel-icon vessel-marker status-${getVesselStatus(vessel).toLowerCase()} zoom-${Math.floor(actualZoom)} always-visible-marker`
    });
  };
  
  // Use useMemo to prevent unnecessary recreations of vessel markers
  const validVessels = useMemo(() => {
    return vessels.filter(vessel => {
      if (!vessel.currentLat || !vessel.currentLng) return false;
      
      const lat = parseFloat(vessel.currentLat);
      const lng = parseFloat(vessel.currentLng);
      
      return !isNaN(lat) && !isNaN(lng);
    });
  }, [vessels]);
  
  // Listen for map zoom events to refresh markers
  const MapEventsHandler = () => {
    useMapEvents({
      zoomend: () => {
        // Force DOM update by adding a class to the map container
        document.querySelector('.leaflet-container')?.classList.add('refreshed');
        setTimeout(() => {
          document.querySelector('.leaflet-container')?.classList.remove('refreshed');
        }, 50);
      }
    });
    return null;
  };
  
  return (
    <>
      <MapEventsHandler />
      {validVessels.map((vessel) => {
        const lat = parseFloat(vessel.currentLat);
        const lng = parseFloat(vessel.currentLng);
        
        // Create a new icon for each vessel
        const icon = createVesselIcon(vessel);
        
        return (
          <Marker
            key={`vessel-${vessel.id}`}
            position={[lat, lng]}
            zIndexOffset={10000} // High z-index
            icon={icon}
            eventHandlers={{
              // Add event handlers to ensure markers stay visible
              add: (e) => {
                const elem = e.target._icon;
                if (elem) {
                  elem.style.zIndex = "9000";
                  elem.style.display = "block";
                }
              }
            }}
          >
            <Popup maxWidth={400} minWidth={350}>
              <div className="vessel-popup-container">
                <VesselPopup 
                  vessel={vessel} 
                  getVesselStatus={getVesselStatus}
                  getVesselRegion={getVesselRegion}
                />
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

export default VesselMarkers;