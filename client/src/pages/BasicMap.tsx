import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/full-map.css';
import { apiRequest } from '@/lib/queryClient';

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
        if (response && response.refineries) {
          setRefineries(response.refineries);
        }
      })
      .catch(error => console.error('Error fetching refineries:', error));
    
    // Fetch ports
    apiRequest('/api/ports')
      .then(response => {
        console.log('Ports response:', response);
        if (response && response.ports) {
          setPorts(response.ports);
        }
      })
      .catch(error => console.error('Error fetching ports:', error));
  }, []);

  // Fix Leaflet's default icon issue
  useEffect(() => {
    // Import Leaflet icon images
    import('leaflet/dist/images/marker-icon.png').then(icon => {
      import('leaflet/dist/images/marker-shadow.png').then(shadow => {
        const L = window.L; // Use the global L object
        if (L && L.Icon && L.Icon.Default) {
          L.Icon.Default.mergeOptions({
            iconUrl: icon.default,
            shadowUrl: shadow.default,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });
        }
      });
    });
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0 }}>
      <MapContainer
        center={[20, 0]} 
        zoom={2}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        {/* Render refineries */}
        {refineries.map(refinery => (
          <Marker
            key={`refinery-${refinery.id}`}
            position={[parseFloat(refinery.lat), parseFloat(refinery.lng)]}
          >
            <Popup>
              <div>
                <h3>{refinery.name}</h3>
                <p><strong>Country:</strong> {refinery.country}</p>
                <p><strong>Region:</strong> {refinery.region}</p>
                <p><strong>Capacity:</strong> {refinery.capacity.toLocaleString()} bpd</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render ports */}
        {ports.map(port => (
          <Marker
            key={`port-${port.id}`}
            position={[parseFloat(port.lat), parseFloat(port.lng)]}
          >
            <Popup>
              <div>
                <h3>{port.name}</h3>
                <p><strong>Country:</strong> {port.country}</p>
                <p><strong>Region:</strong> {port.region}</p>
                <p><strong>Type:</strong> {port.type || "Commercial"}</p>
                {port.capacity && <p><strong>Capacity:</strong> {port.capacity.toLocaleString()}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}