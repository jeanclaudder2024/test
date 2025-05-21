import React, { useMemo } from 'react';
import { Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

interface PortMarkersProps {
  ports: any[];
  portIcon: string;
  PortPopupComponent: React.ComponentType<{port: any}>;
}

const PortMarkers: React.FC<PortMarkersProps> = ({
  ports,
  portIcon,
  PortPopupComponent
}) => {
  // Create a memorized port icon for better performance
  const icon = useMemo(() => {
    return L.icon({
      iconUrl: portIcon,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14],
      className: 'port-icon always-visible-marker'
    });
  }, [portIcon]);

  // Use useMemo to prevent unnecessary recreations of port markers
  const validPorts = useMemo(() => {
    return ports.filter(port => {
      if (!port.lat || !port.lng) return false;
      
      const lat = parseFloat(port.lat);
      const lng = parseFloat(port.lng);
      
      return !isNaN(lat) && !isNaN(lng);
    });
  }, [ports]);
  
  // Listen for map zoom events to refresh markers
  const MapEventsHandler = () => {
    useMapEvents({
      zoomend: () => {
        // Force update of all port markers by manipulating DOM elements
        const portMarkers = document.querySelectorAll('.port-icon');
        portMarkers.forEach(marker => {
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
      {validPorts.map((port) => {
        const lat = parseFloat(port.lat);
        const lng = parseFloat(port.lng);
        
        return (
          <Marker
            key={`port-${port.id}`}
            position={[lat, lng]}
            zIndexOffset={9000} 
            icon={icon}
            eventHandlers={{
              add: (e) => {
                const elem = e.target._icon;
                if (elem) {
                  elem.style.zIndex = "8000";
                  elem.style.display = "block";
                }
              }
            }}
          >
            <Popup maxWidth={400} minWidth={350}>
              <div className="port-popup-container">
                <PortPopupComponent port={port} />
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

export default PortMarkers;