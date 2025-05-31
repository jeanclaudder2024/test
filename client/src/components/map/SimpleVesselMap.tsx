import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Ship, Anchor, MapPin, Factory } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
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
  lat: string;
  lng: string;
  country: string;
  type?: string;
  capacity?: number;
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
    departurePort?: string;
    destinationPort?: string;
    departureLat?: string;
    departureLng?: string;
    destinationLat?: string;
    destinationLng?: string;
  };
}

export default function SimpleVesselMap({ vessel }: SimpleVesselMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [ports, setPorts] = useState<Port[]>([]);
  const [departurePortData, setDeparturePortData] = useState<Port | null>(null);
  const [destinationPortData, setDestinationPortData] = useState<Port | null>(null);

  useEffect(() => {
    setIsClient(true);
    fetchPorts();
  }, []);

  useEffect(() => {
    if (ports.length > 0) {
      // Find departure and destination ports
      if (vessel.departurePort) {
        const depPort = ports.find(p => p.name.toLowerCase().includes(vessel.departurePort!.toLowerCase()));
        setDeparturePortData(depPort || null);
      }
      if (vessel.destinationPort) {
        const destPort = ports.find(p => p.name.toLowerCase().includes(vessel.destinationPort!.toLowerCase()));
        setDestinationPortData(destPort || null);
      }
    }
  }, [ports, vessel.departurePort, vessel.destinationPort]);

  const fetchPorts = async () => {
    try {
      const response = await axios.get('/api/ports');
      setPorts(response.data || []);
    } catch (error) {
      console.error('Error fetching ports:', error);
    }
  };

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

  // Port icons
  const departurePortIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#16a34a" width="28" height="28">
        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
      </svg>
    `),
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });

  const destinationPortIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64=' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#dc2626" width="28" height="28">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    `),
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });

  // Create voyage route
  const createVoyageRoute = () => {
    const route: [number, number][] = [];
    
    // Add departure port if available
    if (departurePortData) {
      route.push([parseFloat(departurePortData.lat), parseFloat(departurePortData.lng)]);
    }
    
    // Add current vessel position
    route.push(vesselPosition);
    
    // Add destination port if available
    if (destinationPortData) {
      route.push([parseFloat(destinationPortData.lat), parseFloat(destinationPortData.lng)]);
    }
    
    return route;
  };

  const voyageRoute = createVoyageRoute();

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
        
        {/* Departure Port */}
        {departurePortData && (
          <Marker 
            position={[parseFloat(departurePortData.lat), parseFloat(departurePortData.lng)]} 
            icon={departurePortIcon}
          >
            <Popup>
              <div className="text-sm space-y-2 max-w-[200px]">
                <div className="font-semibold text-base flex items-center">
                  <Anchor className="h-4 w-4 mr-1.5 text-green-600" />
                  {departurePortData.name}
                </div>
                <div className="space-y-1 text-xs">
                  <div>Country: {departurePortData.country}</div>
                  {departurePortData.type && <div>Type: {departurePortData.type}</div>}
                  {departurePortData.capacity && <div>Capacity: {departurePortData.capacity.toLocaleString()} TEU</div>}
                </div>
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  Departure Port
                </Badge>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Port */}
        {destinationPortData && (
          <Marker 
            position={[parseFloat(destinationPortData.lat), parseFloat(destinationPortData.lng)]} 
            icon={destinationPortIcon}
          >
            <Popup>
              <div className="text-sm space-y-2 max-w-[200px]">
                <div className="font-semibold text-base flex items-center">
                  <Anchor className="h-4 w-4 mr-1.5 text-red-600" />
                  {destinationPortData.name}
                </div>
                <div className="space-y-1 text-xs">
                  <div>Country: {destinationPortData.country}</div>
                  {destinationPortData.type && <div>Type: {destinationPortData.type}</div>}
                  {destinationPortData.capacity && <div>Capacity: {destinationPortData.capacity.toLocaleString()} TEU</div>}
                </div>
                <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                  Destination Port
                </Badge>
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
                {vessel.departurePort && <div>From: {vessel.departurePort}</div>}
                {vessel.destinationPort && <div>To: {vessel.destinationPort}</div>}
              </div>
              <Badge variant="secondary" className="text-xs">Current Position</Badge>
            </div>
          </Popup>
        </Marker>

        {/* Voyage Route */}
        {voyageRoute.length > 1 && (
          <Polyline
            positions={voyageRoute}
            pathOptions={{
              color: '#3B82F6',
              weight: 3,
              opacity: 0.7,
              dashArray: '10, 5'
            }}
          />
        )}

        {/* 20km radius circle */}
        <Circle
          center={vesselPosition}
          radius={20000} // 20km in meters
          pathOptions={{
            color: '#3B82F6',
            weight: 1,
            opacity: 0.3,
            fillOpacity: 0.05
          }}
        />
      </MapContainer>
    </div>
  );
}