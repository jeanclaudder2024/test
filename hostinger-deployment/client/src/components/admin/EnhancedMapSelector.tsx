import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Ship, MapPin, Factory } from "lucide-react";

// Define icon types
const shipIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2942/2942076.png",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

const portIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1527/1527237.png",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

const refineryIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2689/2689236.png",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

// Types
interface MapSelectorProps {
  onSelectPosition: (lat: number, lng: number) => void;
  initialLat?: number | string;
  initialLng?: number | string;
}

interface Facility {
  id: number;
  name: string;
  lat: number;
  lng: number;
  type: "port" | "refinery";
  country?: string;
}

// Click marker component for selecting positions
function PositionMarker({ onSelectPosition }: { onSelectPosition: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<{lat: number, lng: number} | null>(null);
  
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition({ lat, lng });
      onSelectPosition(lat, lng);
    }
  });

  return position === null ? null : (
    <Marker 
      position={position}
      icon={shipIcon}
    >
      <Popup>
        Selected position <br />
        Lat: {position.lat.toFixed(6)} <br />
        Lng: {position.lng.toFixed(6)}
      </Popup>
    </Marker>
  );
}

export function EnhancedMapSelector({ onSelectPosition, initialLat, initialLng }: MapSelectorProps) {
  const [ports, setPorts] = useState<Facility[]>([]);
  const [refineries, setRefineries] = useState<Facility[]>([]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([15, 0]);

  // Set initial position if provided
  useEffect(() => {
    if (initialLat && initialLng) {
      const lat = typeof initialLat === 'string' ? parseFloat(initialLat) : initialLat;
      const lng = typeof initialLng === 'string' ? parseFloat(initialLng) : initialLng;
      
      if (!isNaN(lat) && !isNaN(lng)) {
        setInitialPosition([lat, lng]);
      }
    }
  }, [initialLat, initialLng]);

  // Fetch ports and refineries
  useEffect(() => {
    // Fetch ports
    fetch('/api/ports?limit=50')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPorts(data.map(p => ({
            id: p.id,
            name: p.name,
            lat: p.lat,
            lng: p.lng,
            type: 'port',
            country: p.country
          })));
        }
      })
      .catch(err => {
        console.error("Error fetching ports:", err);
        // Use sample ports as fallback
        setPorts([
          { id: 1, name: "Port of Rotterdam", lat: 51.9489, lng: 4.1025, type: "port", country: "Netherlands" },
          { id: 2, name: "Port of Singapore", lat: 1.273, lng: 103.753, type: "port", country: "Singapore" },
          { id: 3, name: "Port of Shanghai", lat: 31.23, lng: 121.473, type: "port", country: "China" },
          { id: 4, name: "Port of Los Angeles", lat: 33.7395, lng: -118.2596, type: "port", country: "USA" },
          { id: 5, name: "Port of Antwerp", lat: 51.2213, lng: 4.4051, type: "port", country: "Belgium" }
        ]);
      });

    // Fetch refineries
    fetch('/api/refineries?limit=50')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRefineries(data.map(r => ({
            id: r.id,
            name: r.name,
            lat: r.lat,
            lng: r.lng,
            type: 'refinery',
            country: r.country
          })));
        }
      })
      .catch(err => {
        console.error("Error fetching refineries:", err);
        // Use sample refineries as fallback
        setRefineries([
          { id: 1, name: "Rotterdam Refinery", lat: 51.89, lng: 4.25, type: "refinery", country: "Netherlands" },
          { id: 2, name: "Jamnagar Refinery", lat: 22.237, lng: 69.141, type: "refinery", country: "India" },
          { id: 3, name: "Baytown Refinery", lat: 29.755, lng: -95.024, type: "refinery", country: "USA" },
          { id: 4, name: "Ras Tanura", lat: 26.644, lng: 50.153, type: "refinery", country: "Saudi Arabia" },
          { id: 5, name: "SK Energy Ulsan", lat: 35.5, lng: 129.38, type: "refinery", country: "South Korea" }
        ]);
      });
  }, []);

  return (
    <div className="w-full h-[400px] rounded-md overflow-hidden border">
      <MapContainer 
        center={initialPosition} 
        zoom={3} 
        style={{ height: "100%", width: "100%" }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Show ports */}
        {ports.map(port => (
          <Marker 
            key={`port-${port.id}`} 
            position={[port.lat, port.lng]} 
            icon={portIcon}
          >
            <Popup>
              <div className="p-1">
                <strong>{port.name}</strong>
                <div>Type: Port</div>
                {port.country && <div>Country: {port.country}</div>}
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Show refineries */}
        {refineries.map(refinery => (
          <Marker 
            key={`refinery-${refinery.id}`} 
            position={[refinery.lat, refinery.lng]} 
            icon={refineryIcon}
          >
            <Popup>
              <div className="p-1">
                <strong>{refinery.name}</strong>
                <div>Type: Refinery</div>
                {refinery.country && <div>Country: {refinery.country}</div>}
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Position selector marker */}
        <PositionMarker onSelectPosition={onSelectPosition} />
      </MapContainer>
      
      <div className="mt-2 text-xs text-gray-500 flex justify-between">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-400 mr-1"></div>
          <span>Ports</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-orange-400 mr-1"></div>
          <span>Refineries</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-400 mr-1"></div>
          <span>Selected Position</span>
        </div>
      </div>
    </div>
  );
}