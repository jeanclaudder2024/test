import { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Very basic CSS to ensure full screen coverage
const mapContainerStyle = {
  width: '100vw',
  height: '100vh',
  margin: 0,
  padding: 0
};

export default function MapOnly() {
  const [mapReady, setMapReady] = useState(false);
  
  useEffect(() => {
    // Set map as ready after component mounts
    setMapReady(true);
  }, []);
  
  return (
    <div style={mapContainerStyle}>
      {mapReady && (
        <MapContainer
          center={[20, 0]}
          zoom={3}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
          worldCopyJump={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
        </MapContainer>
      )}
    </div>
  );
}