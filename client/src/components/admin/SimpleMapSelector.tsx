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

// Major oil industry locations for easy selection
const MAJOR_LOCATIONS = [
  { name: "Persian Gulf", lat: 26.5, lng: 52.0, description: "Major oil hub" },
  { name: "Ras Tanura, Saudi Arabia", lat: 26.6513, lng: 50.1672, description: "Largest oil refinery" },
  { name: "Abadan, Iran", lat: 30.3392, lng: 48.3043, description: "Historic refinery" },
  { name: "Kuwait City, Kuwait", lat: 29.3759, lng: 47.9774, description: "Oil center" },
  { name: "Doha, Qatar", lat: 25.2854, lng: 51.5310, description: "Gas hub" },
  { name: "Abu Dhabi, UAE", lat: 24.4539, lng: 54.3773, description: "Oil capital" },
  { name: "Houston, USA", lat: 29.7604, lng: -95.3698, description: "Oil refining center" },
  { name: "Rotterdam, Netherlands", lat: 51.9244, lng: 4.4777, description: "European oil hub" },
  { name: "Singapore", lat: 1.3521, lng: 103.8198, description: "Asian trading hub" },
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
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    if (open) {
      setPosition(initialPosition);
      setManualLat(initialPosition?.lat.toString() || "");
      setManualLng(initialPosition?.lng.toString() || "");
      setSearchTerm("");
    }
  }, [open, initialPosition]);

  const handleLocationSelect = (location: typeof MAJOR_LOCATIONS[0]) => {
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

  // Filter locations based on search term
  const filteredLocations = MAJOR_LOCATIONS.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Select Refinery Location</DialogTitle>
          <DialogDescription>
            Choose from major oil industry locations or enter coordinates manually.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Location Grid */}
          <div className="max-h-[40vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredLocations.map((location, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleLocationSelect(location)}
                  className="h-auto p-4 text-left flex flex-col items-start justify-start"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="font-medium">{location.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{location.description}</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Manual Coordinate Input */}
          <div className="border-t pt-4">
            <Label className="text-sm font-medium mb-3 block">Enter precise coordinates</Label>
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