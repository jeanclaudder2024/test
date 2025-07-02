import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Target } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapSelectorProps {
  lat: string;
  lng: string;
  onCoordinatesChange: (lat: string, lng: string) => void;
  className?: string;
}

function MapClickHandler({ onCoordinatesChange }: { onCoordinatesChange: (lat: string, lng: string) => void }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onCoordinatesChange(lat.toFixed(6), lng.toFixed(6));
    },
  });
  return null;
}

export default function MapSelector({ lat, lng, onCoordinatesChange, className = "" }: MapSelectorProps) {
  const [mapKey, setMapKey] = useState(0);
  
  // Parse coordinates with fallback to Dubai
  const latitude = parseFloat(lat) || 25.2048;
  const longitude = parseFloat(lng) || 55.2708;
  const center: LatLngExpression = [latitude, longitude];

  const [selectedPosition, setSelectedPosition] = useState<LatLngExpression | null>(
    lat && lng ? [latitude, longitude] : null
  );

  const handleCoordinateSelect = (newLat: string, newLng: string) => {
    const position: LatLngExpression = [parseFloat(newLat), parseFloat(newLng)];
    setSelectedPosition(position);
    onCoordinatesChange(newLat, newLng);
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: currentLat, longitude: currentLng } = position.coords;
          handleCoordinateSelect(currentLat.toFixed(6), currentLng.toFixed(6));
          setMapKey(prev => prev + 1); // Force map re-render to center on new location
        },
        (error) => {
          console.error('Error getting current location:', error);
          alert('Unable to get your current location. Please click on the map to select coordinates.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleResetToDubai = () => {
    handleCoordinateSelect('25.2048', '55.2708');
    setMapKey(prev => prev + 1);
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5" />
          Select Port Location
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Click on the map to select coordinates or use your current location
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Control Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCurrentLocation}
            className="flex items-center gap-2"
          >
            <Target className="h-4 w-4" />
            Use Current Location
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetToDubai}
            className="flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            Reset to Dubai
          </Button>
        </div>

        {/* Coordinate Display */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
          <div>
            <label className="text-xs font-medium text-gray-600">Latitude</label>
            <p className="font-mono text-sm">{lat || '25.2048'}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Longitude</label>
            <p className="font-mono text-sm">{lng || '55.2708'}</p>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative">
          <MapContainer
            key={mapKey}
            center={center}
            zoom={8}
            style={{ height: '300px', width: '100%' }}
            className="rounded-lg border"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onCoordinatesChange={handleCoordinateSelect} />
            {selectedPosition && (
              <Marker position={selectedPosition} />
            )}
          </MapContainer>
          
          {/* Map Instructions Overlay */}
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
            <p className="text-xs text-gray-600 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Click anywhere on the map to set coordinates
            </p>
          </div>
        </div>

        {/* Status */}
        {selectedPosition && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg">
            <Target className="h-4 w-4" />
            Location selected! Coordinates updated automatically.
          </div>
        )}
      </CardContent>
    </Card>
  );
}