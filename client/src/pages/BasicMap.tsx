import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/full-map.css';
import '../styles/marker-icons.css';
import { apiRequest } from '@/lib/queryClient';
import L from 'leaflet';

// Fix for default markers
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Create custom icons for refineries and ports
const refineryIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'refinery-marker'
});

const portIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'port-marker'
});

// Define types for our data
interface Refinery {
  id: number;
  name: string;
  country: string;
  region: string;
  lat: string;
  lng: string;
  capacity: number;
  description?: string;
  operator?: string;
  status?: string;
}

interface Port {
  id: number;
  name: string;
  country: string;
  region: string;
  lat: string;
  lng: string;
  capacity?: number;
  description?: string;
  type?: string;
  status?: string;
}

export default function BasicMap() {
  const [refineries, setRefineries] = useState<Refinery[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);

  useEffect(() => {
    // Fetch refineries
    apiRequest('/api/refineries')
      .then(response => {
        console.log('Refineries response:', response);
        setRefineries(response.refineries || []);
      })
      .catch(error => console.error('Error fetching refineries:', error));
    
    // Fetch ports
    apiRequest('/api/ports')
      .then(response => {
        console.log('Ports response:', response);
        setPorts(response.ports || []);
      })
      .catch(error => console.error('Error fetching ports:', error));
  }, []);

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

        {/* Render refineries */}
        {refineries.map(refinery => (
          <Marker
            key={`refinery-${refinery.id}`}
            position={[parseFloat(refinery.lat), parseFloat(refinery.lng)]}
            icon={refineryIcon}
          >
            <Popup>
              <div>
                <h3>{refinery.name}</h3>
                <p>Country: {refinery.country}</p>
                <p>Region: {refinery.region}</p>
                <p>Capacity: {refinery.capacity} bpd</p>
                {refinery.description && <p>{refinery.description}</p>}
                {refinery.operator && <p>Operator: {refinery.operator}</p>}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render ports */}
        {ports.map(port => (
          <Marker
            key={`port-${port.id}`}
            position={[parseFloat(port.lat), parseFloat(port.lng)]}
            icon={portIcon}
          >
            <Popup>
              <div>
                <h3>{port.name}</h3>
                <p>Country: {port.country}</p>
                <p>Region: {port.region}</p>
                <p>Type: {port.type}</p>
                {port.capacity && <p>Capacity: {port.capacity}</p>}
                {port.description && <p>{port.description}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}