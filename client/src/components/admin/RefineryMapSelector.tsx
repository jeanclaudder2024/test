import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Fix Leaflet marker icon issue by using data URLs
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

// Custom marker icon for refineries
const refineryIcon = L.icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(`
    <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" fill="#dc2626" stroke="white" stroke-width="2"/>
      <text x="16" y="22" text-anchor="middle" fill="white" font-size="18" font-weight="bold">R</text>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Custom marker icon for ports
const portIcon = L.icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(`
    <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" fill="#2563eb" stroke="white" stroke-width="2"/>
      <text x="16" y="22" text-anchor="middle" fill="white" font-size="18" font-weight="bold">P</text>
    </svg>
  `),
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
      const token = localStorage.getItem('authToken');
      
      // Fetch refineries
      fetch('/api/refineries?limit=100', {
        headers: {
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
      })
        .then(res => res.json())
        .then(data => {
          setRefineries(Array.isArray(data) ? data : data.data || []);
        })
        .catch(err => {
          console.error('Error loading refineries:', err);
        });
      
      // Fetch ports
      fetch('/api/admin/ports?limit=100', {
        headers: {
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
      })
        .then(res => res.json())
        .then(data => {
          setPorts(Array.isArray(data) ? data : data.data || []);
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
            center={initialPosition || [25.0, 0.0]}
            zoom={initialPosition ? 10 : 2}
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
                icon={refineryIcon}
              />
            )}
            
            {/* Show existing refineries for reference */}
            {refineries.map((refinery) => (
              refinery.lat && refinery.lng && !isNaN(parseFloat(refinery.lat)) && !isNaN(parseFloat(refinery.lng)) ? (
                <Marker
                  key={`refinery-${refinery.id}`}
                  position={[parseFloat(refinery.lat), parseFloat(refinery.lng)]}
                  icon={L.divIcon({
                    className: 'custom-refinery-marker',
                    html: `<div style="width: 16px; height: 16px; border-radius: 50%; background-color: #dc2626; border: 2px solid white;"></div>`,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                  })}
                />
              ) : null
            ))}
            
            {/* Show ports for reference */}
            {ports.map((port) => (
              port.lat && port.lng && !isNaN(parseFloat(port.lat)) && !isNaN(parseFloat(port.lng)) ? (
                <Marker
                  key={`port-${port.id}`}
                  position={[parseFloat(port.lat), parseFloat(port.lng)]}
                  icon={L.divIcon({
                    className: 'custom-port-marker',
                    html: `<div style="width: 12px; height: 12px; border-radius: 50%; background-color: #2563eb; border: 2px solid white;"></div>`,
                    iconSize: [12, 12],
                    iconAnchor: [6, 6]
                  })}
                />
              ) : null
            ))}
            
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