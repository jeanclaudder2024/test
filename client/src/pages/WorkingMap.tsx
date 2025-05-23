import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { apiRequest } from '@/lib/queryClient';

// Fix Leaflet marker icon issues
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Set up default marker icon
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Interfaces for data types
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
}

interface Port {
  id: number;
  name: string;
  country: string;
  region: string;
  lat: string;
  lng: string;
  capacity?: number;
  type?: string;
  description?: string;
}

export default function WorkingMap() {
  const [refineries, setRefineries] = useState<Refinery[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);

  useEffect(() => {
    // Load refineries
    apiRequest('/api/refineries')
      .then(response => {
        if (response && response.refineries) {
          console.log(`Loaded ${response.refineries.length} refineries`);
          setRefineries(response.refineries);
        }
      })
      .catch(error => console.error('Failed to load refineries:', error));

    // Load ports
    apiRequest('/api/ports')
      .then(response => {
        if (response && response.ports) {
          console.log(`Loaded ${response.ports.length} ports`);
          setPorts(response.ports);
        }
      })
      .catch(error => console.error('Failed to load ports:', error));
  }, []);

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw', 
      height: '100vh',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    }}>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ 
          width: '100%', 
          height: '100%',
          background: '#f8f9fa'
        }}
        maxBounds={[[-90, -180], [90, 180]]}
        worldCopyJump={true}
        minZoom={1}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          noWrap={false}
        />
        
        {/* Show the refineries */}
        {refineries.map(refinery => (
          <Marker
            key={`refinery-${refinery.id}`}
            position={[parseFloat(refinery.lat), parseFloat(refinery.lng)]}
          >
            <Popup>
              <div style={{ maxWidth: '250px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
                  {refinery.name}
                </h3>
                <p><strong>Type:</strong> Refinery</p>
                <p><strong>Country:</strong> {refinery.country}</p>
                <p><strong>Region:</strong> {refinery.region}</p>
                <p><strong>Capacity:</strong> {refinery.capacity?.toLocaleString()} bpd</p>
                {refinery.operator && <p><strong>Operator:</strong> {refinery.operator}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Show the ports */}
        {ports.map(port => (
          <Marker
            key={`port-${port.id}`}
            position={[parseFloat(port.lat), parseFloat(port.lng)]}
          >
            <Popup>
              <div style={{ maxWidth: '250px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
                  {port.name}
                </h3>
                <p><strong>Type:</strong> {port.type || 'Port'}</p>
                <p><strong>Country:</strong> {port.country}</p>
                <p><strong>Region:</strong> {port.region}</p>
                {port.capacity && <p><strong>Capacity:</strong> {port.capacity.toLocaleString()}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}