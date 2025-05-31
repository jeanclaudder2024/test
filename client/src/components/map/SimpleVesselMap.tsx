import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Ship, Anchor, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
  };
}

export default function SimpleVesselMap({ vessel }: SimpleVesselMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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