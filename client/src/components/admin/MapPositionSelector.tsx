import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Ship, Target } from "lucide-react";

interface MapPositionSelectorProps {
  onSelectPosition: (lat: number, lng: number) => void;
  initialLat?: number | string;
  initialLng?: number | string;
}

// Custom marker icon
const shipIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2942/2942076.png",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

function LocationMarker({ onSelectPosition }) {
  const [position, setPosition] = useState(null);
  
  useMapEvents({
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
    />
  );
}

export function MapPositionSelector({ 
  onSelectPosition, 
  initialLat, 
  initialLng 
}: MapPositionSelectorProps) {
  const mapRef = useRef(null);
  const [selectedPosition, setSelectedPosition] = useState<{lat: number, lng: number} | null>(
    initialLat && initialLng 
      ? { lat: Number(initialLat), lng: Number(initialLng) } 
      : null
  );

  // Handle position selection from the map
  const handleSelectPosition = (lat: number, lng: number) => {
    setSelectedPosition({ lat, lng });
    onSelectPosition(lat, lng);
  };

  // Center the map on common maritime regions if no initial position is provided
  const defaultCenter = { lat: 28.5, lng: 18.8 }; // Near Persian Gulf, a common oil shipping area

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium">
          Click on the map to set vessel position
        </div>
        {selectedPosition && (
          <div className="text-sm">
            Selected: {selectedPosition.lat.toFixed(5)}, {selectedPosition.lng.toFixed(5)}
          </div>
        )}
      </div>
      
      <div className="h-[300px] relative rounded-md overflow-hidden border">
        <MapContainer
          center={selectedPosition || defaultCenter}
          zoom={3}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationMarker onSelectPosition={handleSelectPosition} />
          {selectedPosition && (
            <Marker 
              position={[selectedPosition.lat, selectedPosition.lng]}
              icon={shipIcon}
            />
          )}
        </MapContainer>
        
        <div className="absolute bottom-2 right-2 z-[1000]">
          <Button 
            size="sm" 
            variant="secondary" 
            className="bg-white bg-opacity-80 hover:bg-opacity-100"
            onClick={() => {
              if (mapRef.current) {
                const map = mapRef.current;
                map.setView(defaultCenter, 3);
              }
            }}
          >
            <Target className="h-4 w-4 mr-1" />
            Reset View
          </Button>
        </div>
      </div>
      
      {selectedPosition && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <div>Latitude: {selectedPosition.lat.toFixed(6)}</div>
          <div>Longitude: {selectedPosition.lng.toFixed(6)}</div>
        </div>
      )}
    </div>
  );
}