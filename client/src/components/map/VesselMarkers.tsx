import React from 'react';
import { Marker, Popup } from 'react-leaflet';
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
  return (
    <>
      {vessels.map((vessel) => {
        // Skip vessels without valid coordinates
        if (!vessel.currentLat || !vessel.currentLng) return null;
        
        // Parse coordinates ensuring they're valid numbers
        const lat = parseFloat(vessel.currentLat);
        const lng = parseFloat(vessel.currentLng);
        
        // Skip if coordinates aren't valid numbers
        if (isNaN(lat) || isNaN(lng)) return null;
        
        return (
          <Marker
            key={`vessel-${vessel.id}`}
            position={[lat, lng]}
            zIndexOffset={10000}
            icon={new L.Icon({
              iconUrl: getVesselIconUrl(vessel),
              iconSize: [40, 40],
              iconAnchor: [20, 20],
              popupAnchor: [0, -20],
              className: `vessel-icon vessel-marker status-${getVesselStatus(vessel).toLowerCase()}`
            })}
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