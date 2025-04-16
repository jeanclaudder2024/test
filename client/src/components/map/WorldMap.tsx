import { useRef, useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import { Vessel, Refinery, Region, MapPosition } from "@/types";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Locate } from "lucide-react";

// Define the marker icons here to prevent recreation on each render
const createVesselIcon = (type: string) => {
  const className = type.toLowerCase().includes('lng') ? 'vessel-marker-lng' : 'vessel-marker-oil';
  
  return L.divIcon({
    className: `vessel-marker ${className}`,
    html: `<div class="vessel-marker-ping"></div>`,
    iconSize: [12, 12],
  });
};

const refineryIcon = L.divIcon({
  className: 'refinery-marker',
  html: `<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
  </svg>`,
  iconSize: [16, 16],
});

interface WorldMapProps {
  vessels: Vessel[];
  refineries: Refinery[];
  selectedRegion: Region | null;
  onVesselClick: (vessel: Vessel) => void;
  onRefineryClick?: (refinery: Refinery) => void;
  isLoading?: boolean;
}

// Region center positions
const regionPositions: Record<Region, MapPosition> = {
  'North America': { lat: 40, lng: -100, zoom: 4 },
  'Europe': { lat: 50, lng: 10, zoom: 4 },
  'MEA': { lat: 25, lng: 45, zoom: 4 },
  'Africa': { lat: 0, lng: 20, zoom: 3 },
  'Russia': { lat: 60, lng: 80, zoom: 3 },
  'Asia': { lat: 30, lng: 100, zoom: 3 }
};

// MapUpdater component to change view when region changes
function MapUpdater({ region }: { region: Region | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (region && regionPositions[region]) {
      const position = regionPositions[region];
      map.flyTo([position.lat, position.lng], position.zoom);
    }
  }, [region, map]);
  
  return null;
}

export default function WorldMap({ 
  vessels, 
  refineries, 
  selectedRegion, 
  onVesselClick,
  onRefineryClick,
  isLoading = false 
}: WorldMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  
  // Default center on world view
  const defaultPosition: MapPosition = { lat: 25, lng: 10, zoom: 2 };
  
  // Custom map controls
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };
  
  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };
  
  const handleResetView = () => {
    if (mapRef.current) {
      if (selectedRegion && regionPositions[selectedRegion]) {
        const position = regionPositions[selectedRegion];
        mapRef.current.flyTo([position.lat, position.lng], position.zoom);
      } else {
        mapRef.current.flyTo([defaultPosition.lat, defaultPosition.lng], defaultPosition.zoom);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="relative h-96 md:h-[500px] bg-ocean flex items-center justify-center">
        <div className="text-primary text-lg">Loading map data...</div>
      </div>
    );
  }

  return (
    <div className="relative h-96 md:h-[500px] bg-ocean">
      <MapContainer
        center={[defaultPosition.lat, defaultPosition.lng]}
        zoom={defaultPosition.zoom}
        zoomControl={false}
        className="h-full w-full"
        whenCreated={(map) => { mapRef.current = map; }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Update map when region changes */}
        <MapUpdater region={selectedRegion} />
        
        {/* Vessel Markers */}
        {vessels.map((vessel) => (
          vessel.currentLat && vessel.currentLng ? (
            <Marker
              key={vessel.id}
              position={[vessel.currentLat, vessel.currentLng]}
              icon={createVesselIcon(vessel.vesselType)}
              eventHandlers={{
                click: () => onVesselClick(vessel)
              }}
            >
              <Popup>
                <div className="text-sm">
                  <h3 className="font-medium">{vessel.name}</h3>
                  <p>{vessel.vesselType}</p>
                  <p>IMO: {vessel.imo}</p>
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
        
        {/* Refinery Markers */}
        {refineries.map((refinery) => (
          <Marker
            key={refinery.id}
            position={[refinery.lat, refinery.lng]}
            icon={refineryIcon}
            eventHandlers={{
              click: () => onRefineryClick && onRefineryClick(refinery)
            }}
          >
            <Popup>
              <div className="text-sm">
                <h3 className="font-medium">{refinery.name}</h3>
                <p>{refinery.country}</p>
                <p>Capacity: {refinery.capacity?.toLocaleString()} bpd</p>
                <p>Status: {refinery.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 bg-white rounded-md shadow-sm">
        <Button variant="ghost" size="icon" onClick={handleZoomIn} className="p-2 text-gray-600 hover:bg-gray-100 hover:text-primary">
          <ZoomIn className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleZoomOut} className="p-2 text-gray-600 hover:bg-gray-100 hover:text-primary border-t border-gray-100">
          <ZoomOut className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleResetView} className="p-2 text-gray-600 hover:bg-gray-100 hover:text-primary border-t border-gray-100">
          <Locate className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-md shadow-sm p-2">
        <div className="flex items-center space-x-2 text-xs">
          <span className="h-3 w-3 bg-secondary rounded-full"></span>
          <span>Oil Tankers</span>
        </div>
        <div className="flex items-center space-x-2 text-xs mt-1">
          <span className="h-3 w-3 bg-accent rounded-full"></span>
          <span>LNG Carriers</span>
        </div>
        <div className="flex items-center space-x-2 text-xs mt-1">
          <span className="h-3 w-3 bg-primary rounded-sm"></span>
          <span>Refineries</span>
        </div>
      </div>
    </div>
  );
}
