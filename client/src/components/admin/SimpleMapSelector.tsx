import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Search } from "lucide-react";

interface Position {
  lat: number;
  lng: number;
}

interface SimpleMapSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPosition: (position: Position) => void;
  initialPosition?: Position;
}

const QUICK_LOCATIONS = [
  { name: "Saudi Arabia", lat: 24.7136, lng: 46.6753 },
  { name: "UAE", lat: 25.2048, lng: 55.2708 },
  { name: "Qatar", lat: 25.3548, lng: 51.1839 },
  { name: "Kuwait", lat: 29.3117, lng: 47.4818 },
  { name: "Bahrain", lat: 26.0667, lng: 50.5577 },
  { name: "Oman", lat: 21.4735, lng: 55.9754 },
  { name: "Iraq", lat: 33.2232, lng: 43.6793 },
  { name: "Iran", lat: 32.4279, lng: 53.6880 },
  { name: "USA Gulf Coast", lat: 29.7604, lng: -95.3698 },
  { name: "Singapore", lat: 1.3521, lng: 103.8198 },
  { name: "Rotterdam", lat: 51.9244, lng: 4.4777 },
  { name: "Antwerp", lat: 51.2194, lng: 4.4025 }
];

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

  const handleQuickSelect = (location: { name: string; lat: number; lng: number }) => {
    const newPosition = { lat: location.lat, lng: location.lng };
    setPosition(newPosition);
    setManualLat(location.lat.toString());
    setManualLng(location.lng.toString());
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Refinery Location</DialogTitle>
          <DialogDescription>
            Choose a quick location or enter coordinates manually to set the refinery location.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Quick Location Selector */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Select a quick location or search for a specific area</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {QUICK_LOCATIONS.map((location) => (
                <Button
                  key={location.name}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect(location)}
                  className="justify-start text-left h-auto py-2 px-3"
                >
                  <MapPin className="h-3 w-3 mr-2 flex-shrink-0" />
                  <span className="truncate">{location.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Manual Coordinate Input */}
          <div className="border-t pt-4">
            <Label className="text-sm font-medium mb-3 block">Or enter coordinates manually</Label>
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