import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
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

  // Create a custom refinery icon
  const refineryIcon = useMemo(() => {
    return L.divIcon({
      html: `
        <div style="
          background-color: #c0392b; 
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
          ">
            🏭
          </div>
        </div>
      `,
      className: 'refinery-icon',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
  }, []);

  // Create a custom port icon
  const portIcon = useMemo(() => {
    return L.divIcon({
      html: `
        <div style="
          background-color: #2980b9; 
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
          ">
            ⚓
          </div>
        </div>
      `,
      className: 'port-icon',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
  }, []);

  useEffect(() => {
    // Fetch refineries
    apiRequest('/api/refineries')
      .then(response => {
        console.log('Refineries response:', response);
        if (response && Array.isArray(response)) {
          setRefineries(response);
        } else if (response && response.refineries) {
          setRefineries(response.refineries);
        }
      })
      .catch(error => console.error('Error fetching refineries:', error));
    
    // Fetch ports
    apiRequest('/api/ports')
      .then(response => {
        console.log('Ports response:', response);
        if (response && Array.isArray(response)) {
          setPorts(response);
        } else if (response && response.ports) {
          setPorts(response.ports);
        }
      })
      .catch(error => console.error('Error fetching ports:', error));
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <MapContainer
        center={[20, 0]} 
        zoom={2}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        {/* Render refineries with custom icon */}
        {refineries.map(refinery => (
          <Marker
            key={`refinery-${refinery.id}`}
            position={[parseFloat(refinery.lat), parseFloat(refinery.lng)]}
            icon={refineryIcon}
          >
            <Popup>
              <div>
                <h3>{refinery.name}</h3>
                <p><strong>Country:</strong> {refinery.country}</p>
                <p><strong>Region:</strong> {refinery.region}</p>
                <p><strong>Capacity:</strong> {refinery.capacity ? `${refinery.capacity.toLocaleString()} bpd` : 'Unknown'}</p>
                {refinery.status && <p><strong>Status:</strong> {refinery.status}</p>}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render ports with custom icon */}
        {ports.map(port => (
          <Marker
            key={`port-${port.id}`}
            position={[parseFloat(port.lat), parseFloat(port.lng)]}
            icon={portIcon}
          >
            <Popup>
              <div>
                <h3>{port.name}</h3>
                <p><strong>Country:</strong> {port.country}</p>
                <p><strong>Region:</strong> {port.region}</p>
                <p><strong>Type:</strong> {port.type || "Commercial"}</p>
                {port.capacity && <p><strong>Capacity:</strong> {port.capacity.toLocaleString()}</p>}
                {port.status && <p><strong>Status:</strong> {port.status}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}