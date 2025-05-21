import React, { useMemo } from 'react';
import { Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import VesselPopup from '../VesselPopup';

interface VesselMarkersProps {
  vessels: any[];
  getVesselIconUrl: (vessel: any) => string;
  getVesselStatus: (vessel: any) => string;
  getVesselRegion: (vessel: any) => string;
}

const VesselMarkers: React.FC<VesselMarkersProps> = ({
  vessels,
  getVesselIconUrl,
  getVesselStatus,
  getVesselRegion
}) => {
  // This creates a new icon instance for each vessel instead of sharing
  const createVesselIcon = (vessel: any) => {
    return L.icon({
      iconUrl: getVesselIconUrl(vessel),
      iconSize: [42, 42], // Slightly larger
      iconAnchor: [21, 21],
      popupAnchor: [0, -21],
      className: `vessel-icon vessel-marker status-${getVesselStatus(vessel).toLowerCase()}`
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