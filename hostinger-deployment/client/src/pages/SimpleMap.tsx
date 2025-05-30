import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { apiRequest } from '@/lib/queryClient';

// Fix the default icon issue
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Define types for our data
interface Refinery {
  id: number;
  name: string;
  country: string;
  region: string;
  lat: string;
  lng: string;
  capacity: number;
}

interface Port {
  id: number;
  name: string;
  country: string;
  region: string;
  lat: string;
  lng: string;
  type?: string;
}

export default function SimpleMap() {
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
  
  // Hard-coded sample locations
  const sampleLocations = [
    { id: 1, name: "New York Harbor", lat: 40.7128, lng: -74.0060 },
    { id: 2, name: "Port of Rotterdam", lat: 51.9225, lng: 4.4792 },
    { id: 3, name: "Singapore Port", lat: 1.2903, lng: 103.8615 },
    { id: 4, name: "Shanghai Port", lat: 31.2304, lng: 121.4737 },
    { id: 5, name: "Houston Refinery", lat: 29.7604, lng: -95.3698 }
  ];

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
        
        {/* Render sample markers first to make sure something shows up */}
        {sampleLocations.map(location => (
          <Marker
            key={`sample-${location.id}`}
            position={[location.lat, location.lng]}
          >
            <Popup>
              <div>
                <h3>{location.name}</h3>
                <p>Sample Location</p>
              </div>
            </Popup>
          </Marker>
        ))}
        
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
                <p><strong>Type:</strong> {port.type || "Commercial"}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}