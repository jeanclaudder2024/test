import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Ship, Target, Factory, Anchor } from "lucide-react";

interface MapPositionSelectorProps {
  onSelectPosition: (lat: number, lng: number) => void;
  initialLat?: number | string;
  initialLng?: number | string;
}

interface Facility {
  id: number;
  name: string;
  lat: number;
  lng: number;
  type: "port" | "refinery";
  country?: string;
}

// Custom marker icons
const shipIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2942/2942076.png",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

const portIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1527/1527237.png",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

const refineryIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2689/2689236.png",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
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
  const [ports, setPorts] = useState<Facility[]>([]);
  const [refineries, setRefineries] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFacilities, setShowFacilities] = useState(true);

  // Fetch ports and refineries
  useEffect(() => {
    const fetchFacilities = async () => {
      setIsLoading(true);
      try {
        // Fetch ports
        const portsResponse = await fetch('/api/ports?limit=50');
        const portsData = await portsResponse.json();
        
        // Fetch refineries
        const refineriesResponse = await fetch('/api/refineries');
        const refineriesData = await refineriesResponse.json();
        
        // Transform port data to Facility type
        const portFacilities = portsData.map((port: any) => ({
          id: port.id,
          name: port.name,
          lat: port.lat,
          lng: port.lng,
          type: 'port' as const,
          country: port.country
        }));
        
        // Transform refinery data to Facility type
        const refineryFacilities = refineriesData.map((refinery: any) => ({
          id: refinery.id,
          name: refinery.name,
          lat: refinery.lat,
          lng: refinery.lng,
          type: 'refinery' as const,
          country: refinery.country
        }));
        
        setPorts(portFacilities);
        setRefineries(refineryFacilities);
      } catch (error) {
        console.error('Error fetching facilities:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFacilities();
  }, []);

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
      
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
            <span>Ports</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
            <span>Refineries</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
            <span>Selected Position</span>
          </div>
        </div>
        
        <Button
          size="sm"
          variant="outline"
          className="text-xs px-2 h-7"
          onClick={() => setShowFacilities(!showFacilities)}
        >
          {showFacilities ? "Hide Facilities" : "Show Facilities"}
        </Button>
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
          
          {/* Show selected position */}
          {selectedPosition && (
            <Marker 
              position={[selectedPosition.lat, selectedPosition.lng]}
              icon={shipIcon}
            >
              <Popup>
                <div className="text-center font-semibold">Selected Position</div>
                <div className="text-xs mt-1">
                  {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Show port facilities */}
          {showFacilities && ports.map(port => (
            <Marker
              key={`port-${port.id}`}
              position={[port.lat, port.lng]}
              icon={portIcon}
            >
              <Popup>
                <div className="text-center font-semibold">{port.name}</div>
                <div className="text-xs mt-1">Port - {port.country || 'Unknown'}</div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full mt-2 h-7 text-xs"
                  onClick={() => handleSelectPosition(port.lat, port.lng)}
                >
                  <Ship className="h-3 w-3 mr-1" />
                  Place Vessel Here
                </Button>
              </Popup>
            </Marker>
          ))}
          
          {/* Show refinery facilities */}
          {showFacilities && refineries.map(refinery => (
            <Marker
              key={`refinery-${refinery.id}`}
              position={[refinery.lat, refinery.lng]}
              icon={refineryIcon}
            >
              <Popup>
                <div className="text-center font-semibold">{refinery.name}</div>
                <div className="text-xs mt-1">Refinery - {refinery.country || 'Unknown'}</div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full mt-2 h-7 text-xs"
                  onClick={() => handleSelectPosition(refinery.lat, refinery.lng)}
                >
                  <Ship className="h-3 w-3 mr-1" />
                  Place Vessel Here
                </Button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        <div className="absolute bottom-2 right-2 z-[1000] flex space-x-2">
          {isLoading && (
            <div className="bg-white bg-opacity-80 px-2 py-1 rounded-md text-xs flex items-center">
              <div className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full mr-1"></div>
              Loading facilities...
            </div>
          )}
          
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