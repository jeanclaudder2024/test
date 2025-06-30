import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2 } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface Position {
  lat: number;
  lng: number;
}

// Fix Leaflet marker icon issue
const defaultIcon = L.icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(`
    <svg width="25" height="41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z" fill="#3b82f6"/>
      <circle cx="12.5" cy="12.5" r="6" fill="white"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = defaultIcon;

function MapEvents({ onPositionSelect }: { onPositionSelect: (position: Position) => void }) {
  useMapEvents({
    click: (e) => {
      onPositionSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  
  return null;
}

interface SimpleMapSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPosition: (position: Position) => void;
  initialPosition?: Position;
}

export function SimpleMapSelector({ 
  open, 
  onOpenChange, 
  onSelectPosition,
  initialPosition 
}: SimpleMapSelectorProps) {
  const [position, setPosition] = useState<Position | undefined>(initialPosition);
  const [manualLat, setManualLat] = useState<string>(initialPosition?.lat.toString() || "");
  const [manualLng, setManualLng] = useState<string>(initialPosition?.lng.toString() || "");

  useEffect(() => {
    if (open) {
      setPosition(initialPosition);
      setManualLat(initialPosition?.lat.toString() || "");
      setManualLng(initialPosition?.lng.toString() || "");
    }
  }, [open, initialPosition]);

  const handlePositionSelect = (newPosition: Position) => {
    setPosition(newPosition);
    setManualLat(newPosition.lat.toString());
    setManualLng(newPosition.lng.toString());
  };

  const handleManualUpdate = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      setPosition({ lat, lng });
    }
  };

  const handleConfirm = () => {
    if (position) {
      onSelectPosition(position);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Select Refinery Location</DialogTitle>
          <DialogDescription>
            Click on the map to select the refinery location, or enter coordinates manually below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Interactive Map */}
          <div className="h-[60vh] w-full relative rounded-md overflow-hidden border">
            <MapContainer
              center={[initialPosition?.lat || 25, initialPosition?.lng || 45]}
              zoom={6}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Show selected position */}
              {position && (
                <Marker 
                  position={[position.lat, position.lng]} 
                  icon={defaultIcon}
                />
              )}
              
              {/* Map click events */}
              <MapEvents onPositionSelect={handlePositionSelect} />
            </MapContainer>
          </div>

          {/* Manual Coordinate Input */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Enter coordinates manually</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude" className="text-xs text-muted-foreground">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="e.g., 25.2048"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  onBlur={handleManualUpdate}
                />
              </div>
              <div>
                <Label htmlFor="longitude" className="text-xs text-muted-foreground">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="e.g., 55.2708"
                  value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                  onBlur={handleManualUpdate}
                />
              </div>
            </div>
          </div>

          {/* Selected Position Display */}
          {position && (
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-medium">Selected Location</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Latitude: {position.lat.toFixed(6)}, Longitude: {position.lng.toFixed(6)}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!position}>
            Confirm Location
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}