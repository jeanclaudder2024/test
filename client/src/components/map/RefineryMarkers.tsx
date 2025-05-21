import React, { useMemo } from 'react';
import { Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

interface RefineryMarkersProps {
  refineries: any[];
  refineryIcon: string;
  RefineryPopupComponent: React.ComponentType<{refinery: any}>;
}

const RefineryMarkers: React.FC<RefineryMarkersProps> = ({
  refineries,
  refineryIcon,
  RefineryPopupComponent
}) => {
  // Create a memorized refinery icon for better performance
  const icon = useMemo(() => {
    return L.icon({
      iconUrl: refineryIcon,
      iconSize: [32, 32], // Slightly larger for visibility
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
      className: 'refinery-icon always-visible-marker'
    });
  }, [refineryIcon]);

  // Use useMemo to prevent unnecessary recreations of refinery markers
  const validRefineries = useMemo(() => {
    return refineries.filter(refinery => {
      if (!refinery.lat || !refinery.lng) return false;
      
      const lat = parseFloat(refinery.lat);
      const lng = parseFloat(refinery.lng);
      
      return !isNaN(lat) && !isNaN(lng);
    });
  }, [refineries]);
  
  // Listen for map zoom events to refresh markers
  const MapEventsHandler = () => {
    useMapEvents({
      zoomend: () => {
        // Force update of all refinery markers by manipulating DOM elements
        const refineryMarkers = document.querySelectorAll('.refinery-icon');
        refineryMarkers.forEach(marker => {
          marker.classList.add('marker-refresh');
          setTimeout(() => {
            marker.classList.remove('marker-refresh');
          }, 50);
        });
      }
    });
    return null;
  };
  
  return (
    <>
      <MapEventsHandler />
      {validRefineries.map((refinery) => {
        const lat = parseFloat(refinery.lat);
        const lng = parseFloat(refinery.lng);
        
        return (
          <Marker
            key={`refinery-${refinery.id}`}
            position={[lat, lng]}
            zIndexOffset={8000} 
            icon={icon}
            eventHandlers={{
              add: (e) => {
                const elem = e.target._icon;
                if (elem) {
                  elem.style.zIndex = "7000";
                  elem.style.display = "block";
                }
              }
            }}
          >
            <Popup maxWidth={400} minWidth={350}>
              <div className="refinery-popup-container">
                <RefineryPopupComponent refinery={refinery} />
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

export default RefineryMarkers;