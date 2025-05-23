import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/full-map.css';

export default function BasicMap() {
  return (
    <div className="map-container">
      <MapContainer
        center={[20, 0]} 
        zoom={2}
        maxBounds={[[-90, -180], [90, 180]]}
        minZoom={1}
        maxZoom={18}
        worldCopyJump={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        attributionControl={true}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          noWrap={false}
          bounds={[[-90, -180], [90, 180]]}
        />
      </MapContainer>
    </div>
  );
}