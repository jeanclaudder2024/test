import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Ship, Anchor, MapPin, Navigation } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Port {
  id: number;
  name: string;
  country: string;
  lat: number;
  lng: number;
}

interface SimpleVesselMapProps {
  vessel: {
    id: number;
    name: string;
    currentLat: string;
    currentLng: string;
    vesselType?: string;
    flag?: string;
    speed?: string;
    course?: string;
    departurePort?: string | number;
    destinationPort?: string | number;
  };
  ports?: Port[];
}

export default function SimpleVesselMap({ vessel, ports = [] }: SimpleVesselMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Helper function to find port by ID or name
  const findPort = (portIdOrName: string | number | undefined): Port | null => {
    if (!portIdOrName || !ports.length) return null;
    
    // Try to find by ID first
    if (typeof portIdOrName === 'number' || !isNaN(Number(portIdOrName))) {
      const port = ports.find(p => p.id === Number(portIdOrName));
      if (port) return port;
    }
    
    // Try to find by name
    const port = ports.find(p => p.name === portIdOrName);
    return port || null;
  };

  // Get departure and destination ports
  const departurePort = findPort(vessel.departurePort);
  const destinationPort = findPort(vessel.destinationPort);

  if (!isClient) {
    return (
      <div className="h-96 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 mx-auto mb-3 text-blue-600" />
          <p className="text-lg font-medium text-blue-900 dark:text-blue-100">Loading Map...</p>
        </div>
      </div>
    );
  }

  const vesselPosition: [number, number] = [
    parseFloat(vessel.currentLat),
    parseFloat(vessel.currentLng)
  ];

  // Custom vessel icon
  const vesselIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2563eb" width="32" height="32">
        <path d="M3 18h18v-2H3v2zm6.31-8.24c.41-.67 1.28-.67 1.69 0l4.89 8.24H2.42l6.89-8.24z"/>
        <circle cx="12" cy="12" r="2" fill="#ffffff"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });

  // Custom port icons
  const departurePortIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#16a34a" width="28" height="28">
        <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
      </svg>
    `),
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });

  const destinationPortIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#dc2626" width="28" height="28">
        <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
      </svg>
    `),
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });

  // Calculate route lines
  const getRouteLines = () => {
    const lines: [number, number][][] = [];
    
    if (departurePort && departurePort.lat && departurePort.lng) {
      // Line from departure port to vessel current position
      lines.push([
        [parseFloat(departurePort.lat), parseFloat(departurePort.lng)],
        vesselPosition
      ]);
    }
    
    if (destinationPort && destinationPort.lat && destinationPort.lng) {
      // Line from vessel current position to destination port
      lines.push([
        vesselPosition,
        [parseFloat(destinationPort.lat), parseFloat(destinationPort.lng)]
      ]);
    }
    
    return lines;
  };

  const routeLines = getRouteLines();

  return (
    <div className="h-96 rounded-lg overflow-hidden border-2 border-blue-200 dark:border-blue-800">
      <MapContainer
        center={vesselPosition}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Route Lines */}
        {routeLines.map((line, index) => (
          <Polyline
            key={index}
            positions={line}
            pathOptions={{
              color: index === 0 ? '#16a34a' : '#dc2626', // Green for departure route, red for destination route
              weight: 3,
              opacity: 0.7,
              dashArray: '10, 5'
            }}
          />
        ))}

        {/* Departure Port Marker */}
        {departurePort && departurePort.lat && departurePort.lng && (
          <Marker position={[parseFloat(departurePort.lat), parseFloat(departurePort.lng)]} icon={departurePortIcon}>
            <Popup>
              <div className="text-sm space-y-2 max-w-[200px]">
                <div className="font-semibold text-base flex items-center">
                  <Navigation className="h-4 w-4 mr-1.5 text-green-600" />
                  {departurePort.name}
                </div>
                <div className="space-y-1 text-xs">
                  <div>Country: {departurePort.country}</div>
                  <div>Position: {parseFloat(departurePort.lat || 0).toFixed(4)}°, {parseFloat(departurePort.lng || 0).toFixed(4)}°</div>
                </div>
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">Departure Port</Badge>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Port Marker */}
        {destinationPort && destinationPort.lat && destinationPort.lng && (
          <Marker position={[parseFloat(destinationPort.lat), parseFloat(destinationPort.lng)]} icon={destinationPortIcon}>
            <Popup>
              <div className="text-sm space-y-2 max-w-[200px]">
                <div className="font-semibold text-base flex items-center">
                  <Anchor className="h-4 w-4 mr-1.5 text-red-600" />
                  {destinationPort.name}
                </div>
                <div className="space-y-1 text-xs">
                  <div>Country: {destinationPort.country}</div>
                  <div>Position: {parseFloat(destinationPort.lat || 0).toFixed(4)}°, {parseFloat(destinationPort.lng || 0).toFixed(4)}°</div>
                </div>
                <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">Destination Port</Badge>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Vessel Marker */}
        <Marker position={vesselPosition} icon={vesselIcon}>
          <Popup>
            <div className="text-sm space-y-2 max-w-[200px]">
              <div className="font-semibold text-base flex items-center">
                <Ship className="h-4 w-4 mr-1.5 text-blue-600" />
                {vessel.name}
              </div>
              <div className="space-y-1 text-xs">
                <div>Position: {parseFloat(vessel.currentLat).toFixed(4)}°, {parseFloat(vessel.currentLng).toFixed(4)}°</div>
                {vessel.vesselType && <div>Type: {vessel.vesselType}</div>}
                {vessel.flag && <div>Flag: {vessel.flag}</div>}
                {vessel.speed && <div>Speed: {vessel.speed} knots</div>}
                {vessel.course && <div>Course: {vessel.course}°</div>}
                {departurePort && <div>From: {departurePort.name}</div>}
                {destinationPort && <div>To: {destinationPort.name}</div>}
              </div>
              <Badge variant="secondary" className="text-xs">Current Position</Badge>
            </div>
          </Popup>
        </Marker>

        {/* 20km radius circle */}
        <Circle
          center={vesselPosition}
          radius={20000} // 20km in meters
          pathOptions={{
            color: '#3B82F6',
            weight: 2,
            opacity: 0.5,
            fillOpacity: 0.1
          }}
        />
      </MapContainer>
    </div>
  );
}