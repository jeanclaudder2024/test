import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Vessel } from '@shared/schema';

// Fix for the missing icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface SimpleVesselMapProps {
  vessels: Vessel[];
  height?: string;
}

export default function SimpleVesselMap({ vessels, height = '600px' }: SimpleVesselMapProps) {
  // Take 10 vessels with valid coordinates for testing
  const filteredVessels = vessels
    .filter(v => v.currentLat && v.currentLng && 
               !isNaN(parseFloat(v.currentLat)) && 
               !isNaN(parseFloat(v.currentLng)))
    .slice(0, 10);
  
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0]);
  
  // Update map center when vessels change
  useEffect(() => {
    if (filteredVessels.length > 0) {
      const firstVessel = filteredVessels[0];
      const lat = parseFloat(firstVessel.currentLat!);
      const lng = parseFloat(firstVessel.currentLng!);
      if (!isNaN(lat) && !isNaN(lng)) {
        setMapCenter([lat, lng]);
      }
    }
  }, [filteredVessels]);
  
  return (
    <div className="border rounded-md overflow-hidden" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={3}
        style={{ height: '100%', width: '100%' }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        
        {filteredVessels.map((vessel) => {
          const lat = parseFloat(vessel.currentLat!);
          const lng = parseFloat(vessel.currentLng!);
          
          return (
            <Marker
              key={`vessel-${vessel.id}`}
              position={[lat, lng]}
              icon={L.divIcon({
                className: 'always-visible-icon',
                html: `<div style="background-color: red; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white;"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })}
            >
              <Popup>
                <div>
                  <h3 className="font-bold">{vessel.name}</h3>
                  <p>Type: {vessel.vesselType || 'Unknown'}</p>
                  <p>Flag: {vessel.flag || 'Unknown'}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Add a fixed marker for testing */}
        <Marker 
          position={[0, 0]} 
          icon={L.divIcon({
            className: 'always-visible-icon',
            html: `<div style="background-color: green; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          })}
        >
          <Popup>
            <div>
              <h3 className="font-bold">Test Marker</h3>
              <p>This is a test marker at [0,0]</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}