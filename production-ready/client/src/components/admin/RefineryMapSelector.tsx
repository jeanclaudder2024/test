import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Fix Leaflet marker icon issue
const defaultIcon = L.icon({
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

// Custom marker icon for refineries
const refineryIcon = L.icon({
  iconUrl: "/refinery-marker.png", // This should be available in your public folder
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface Position {
  lat: number;
  lng: number;
}

interface RefineryMapSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPosition: (position: Position) => void;
  initialPosition?: Position;
}

function SetInitialView({ position }: { position?: Position }) {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], 10);
    }
  }, [position, map]);
  
  return null;
}

function MapEvents({ onPositionSelect }: { onPositionSelect: (position: Position) => void }) {
  useMapEvents({
    click: (e) => {
      onPositionSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  
  return null;
}

export function RefineryMapSelector({ 
  open, 
  onOpenChange, 
  onSelectPosition,
  initialPosition 
}: RefineryMapSelectorProps) {
  const [position, setPosition] = useState<Position | undefined>(initialPosition);
  const [loading, setLoading] = useState<boolean>(false);
  const [refineries, setRefineries] = useState<any[]>([]);
  const [ports, setPorts] = useState<any[]>([]);
  const mapRef = useRef<L.Map | null>(null);

  // Reset position when dialog opens with initial position
  useEffect(() => {
    if (open) {
      setPosition(initialPosition);
    }
  }, [open, initialPosition]);

  // Load refineries and ports for reference
  useEffect(() => {
    if (open) {
      setLoading(true);
      
      // Fetch refineries
      fetch('/api/refineries?limit=100')
        .then(res => res.json())
        .then(data => {
          setRefineries(data.data || []);
        })
        .catch(err => {
          console.error('Error loading refineries:', err);
        });
      
      // Fetch ports
      fetch('/api/ports?limit=100')
        .then(res => res.json())
        .then(data => {
          setPorts(data || []);
        })
        .catch(err => {
          console.error('Error loading ports:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open]);

  const handlePositionSelect = (newPosition: Position) => {
    setPosition(newPosition);
  };

  const handleConfirm = () => {
    if (position) {
      onSelectPosition(position);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Select Refinery Location</DialogTitle>
          <DialogDescription>
            Click on the map to select the exact location for this refinery. 
            Existing refineries are shown in red and ports in blue for reference.
          </DialogDescription>
        </DialogHeader>
        
        <div className="h-[60vh] w-full relative mt-4 rounded-md overflow-hidden border">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : null}
          
          <MapContainer
            center={initialPosition || [25, 0]}
            zoom={initialPosition ? 10 : 2}
            style={{ height: "100%", width: "100%" }}
            whenReady={(map) => { mapRef.current = map.target; }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Show selected position */}
            {position && (
              <Marker 
                position={[position.lat, position.lng]} 
                icon={refineryIcon}
              />
            )}
            
            {/* Show existing refineries for reference */}
            {refineries.map((refinery) => (
              <Marker
                key={`refinery-${refinery.id}`}
                position={[parseFloat(refinery.lat), parseFloat(refinery.lng)]}
                icon={L.divIcon({
                  className: 'custom-refinery-marker',
                  html: `<div class="w-4 h-4 rounded-full bg-red-500 border-2 border-white"></div>`,
                  iconSize: [16, 16],
                  iconAnchor: [8, 8]
                })}
              />
            ))}
            
            {/* Show ports for reference */}
            {ports.map((port) => (
              <Marker
                key={`port-${port.id}`}
                position={[parseFloat(port.lat), parseFloat(port.lng)]}
                icon={L.divIcon({
                  className: 'custom-port-marker',
                  html: `<div class="w-3 h-3 rounded-full bg-blue-500 border-2 border-white"></div>`,
                  iconSize: [12, 12],
                  iconAnchor: [6, 6]
                })}
              />
            ))}
            
            <SetInitialView position={initialPosition} />
            <MapEvents onPositionSelect={handlePositionSelect} />
          </MapContainer>
        </div>
        
        <div className="flex justify-end gap-3 mt-4">
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

export default RefineryMapSelector;