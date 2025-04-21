import { useState, useEffect, useCallback, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Polyline } from "@react-google-maps/api";
import { Vessel, Refinery, Region } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ZoomIn, ZoomOut, Locate, Ship, Factory, Navigation, Droplet } from "lucide-react";
import { REGIONS, OIL_PRODUCT_TYPES } from "@/../../shared/constants";

// Define custom styles for the map
const mapContainerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "500px",
  borderRadius: "0.5rem",
  overflow: "hidden"
};

// Define map options
const defaultOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: true,
  scrollwheel: true,  // Enable scrolling through the map with the mouse wheel
  gestureHandling: "greedy", // Make the map handle all gestures
  mapTypeId: "satellite", // Use satellite view (aerial view)
  mapTypeControlOptions: {
    style: 2, // DROPDOWN_MENU
    position: 3, // TOP_RIGHT
    mapTypeIds: ["roadmap", "satellite", "hybrid", "terrain"]
  }
};

// Region center positions
const regionPositions: Record<string, google.maps.LatLngLiteral & { zoom: number }> = {
  'north-america': { lat: 40, lng: -100, zoom: 4 },
  'south-america': { lat: -15, lng: -60, zoom: 3 },
  'central-america': { lat: 15, lng: -85, zoom: 4 },
  'western-europe': { lat: 50, lng: 0, zoom: 4 },
  'eastern-europe': { lat: 50, lng: 25, zoom: 4 },
  'middle-east': { lat: 28, lng: 45, zoom: 4 },
  'north-africa': { lat: 25, lng: 20, zoom: 4 },
  'southern-africa': { lat: -10, lng: 20, zoom: 3 },
  'russia': { lat: 60, lng: 80, zoom: 3 },
  'china': { lat: 35, lng: 105, zoom: 4 },
  'asia-pacific': { lat: 20, lng: 110, zoom: 3 },
  'southeast-asia-oceania': { lat: -10, lng: 130, zoom: 3 }
};

interface GoogleMapViewProps {
  vessels: Vessel[];
  refineries: Refinery[];
  selectedRegion: Region | null;
  trackedVessel?: Vessel | null;
  onVesselClick: (vessel: Vessel) => void;
  onRefineryClick?: (refinery: Refinery) => void;
  isLoading?: boolean;
}

export default function GoogleMapView({
  vessels,
  refineries,
  selectedRegion,
  trackedVessel,
  onVesselClick,
  onRefineryClick,
  isLoading = false
}: GoogleMapViewProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
  });
  
  // We'll create some default icons and map definitions
  const DEFAULT_MAP_MARKER_URL = "https://maps.google.com/mapfiles/ms/icons/blue-dot.png";
  const REFINERY_MARKER_URL = "https://maps.google.com/mapfiles/ms/icons/red-dot.png";

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [selectedRefinery, setSelectedRefinery] = useState<Refinery | null>(null);
  
  // Default to world view
  const defaultCenter = { lat: 25, lng: 10 };
  const defaultZoom = 2;

  // Get vessel icon based on type
  const getVesselIcon = (type: string) => {
    let iconPath = "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png";
    let iconColor = "#FF6B6B"; // Default to oil tanker color

    if (type.toLowerCase().includes('lng')) {
      iconColor = "#4ECDC4";
    } else if (type.toLowerCase().includes('cargo')) {
      iconColor = "#FFD166";
    } else if (type.toLowerCase().includes('container')) {
      iconColor = "#118AB2";
    } else if (type.toLowerCase().includes('chemical')) {
      iconColor = "#9A48D0";
    }

    // For now, we'll return a custom icon SVG
    return {
      url: iconPath,
      scaledSize: new google.maps.Size(32, 32),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(16, 32),
      labelOrigin: new google.maps.Point(16, -10)
    };
  };

  // Get refinery icon based on status
  const getRefineryIcon = (status: string) => {
    let iconColor = "#28a745"; // operational - green
    
    if (status.toLowerCase().includes('maintenance')) {
      iconColor = "#fd7e14"; // maintenance - orange
    } else if (status.toLowerCase().includes('offline')) {
      iconColor = "#dc3545"; // offline - red
    }

    return {
      url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
      scaledSize: new google.maps.Size(32, 32),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(16, 32),
      labelOrigin: new google.maps.Point(16, -10)
    };
  };

  // Get vessel emoji and label
  const getVesselLabel = (type: string): string => {
    if (type.toLowerCase().includes('lng')) return '🔋 LNG';
    if (type.toLowerCase().includes('container')) return '📦 Container';
    if (type.toLowerCase().includes('chemical')) return '⚗️ Chemical';
    if (type.toLowerCase().includes('cargo')) return '🚢 Cargo';
    return '🛢️ Oil';
  };

  // Handle map initialization
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  // Handle map unmounting
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Update map view when region changes
  useEffect(() => {
    if (map && selectedRegion && regionPositions[selectedRegion]) {
      const position = regionPositions[selectedRegion];
      map.setCenter({ lat: position.lat, lng: position.lng });
      map.setZoom(position.zoom);
    }
  }, [map, selectedRegion]);

  // Update map view when tracked vessel changes
  useEffect(() => {
    if (map && trackedVessel && trackedVessel.currentLat && trackedVessel.currentLng) {
      map.setCenter({
        lat: typeof trackedVessel.currentLat === 'number' ? trackedVessel.currentLat : parseFloat(String(trackedVessel.currentLat)),
        lng: typeof trackedVessel.currentLng === 'number' ? trackedVessel.currentLng : parseFloat(String(trackedVessel.currentLng))
      });
      map.setZoom(8);
    }
  }, [map, trackedVessel]);

  // Handle vessel marker click
  const handleVesselClick = (vessel: Vessel) => {
    setSelectedVessel(vessel);
    setSelectedRefinery(null); // Clear refinery selection
    if (onVesselClick) {
      onVesselClick(vessel);
    }
  };

  // Handle refinery marker click
  const handleRefineryClick = (refinery: Refinery) => {
    setSelectedRefinery(refinery);
    setSelectedVessel(null); // Clear vessel selection
    if (onRefineryClick) {
      onRefineryClick(refinery);
    }
  };

  // Close info windows
  const closeInfoWindows = () => {
    setSelectedVessel(null);
    setSelectedRefinery(null);
  };

  // Check if vessel matches any oil product type
  const matchesOilProductType = (vesselType: string | null) => {
    if (!vesselType) return false;
    
    // Check exact match with oil product types
    if (OIL_PRODUCT_TYPES.some(product => vesselType.includes(product))) {
      return true;
    }
    
    // Check generic oil vessel types
    return (
      vesselType.toLowerCase().includes('oil') ||
      vesselType.toLowerCase().includes('tanker') ||
      vesselType.toLowerCase().includes('crude') ||
      vesselType.toLowerCase().includes('vlcc') ||
      vesselType.toLowerCase().includes('diesel') ||
      vesselType.toLowerCase().includes('petroleum') ||
      vesselType.toLowerCase().includes('gas') ||
      vesselType.toLowerCase().includes('gasoline') ||
      vesselType.toLowerCase().includes('fuel')
    );
  };
  
  // Filter down vessels for better performance
  const filteredVessels = vessels.filter(vessel => 
    vessel.currentLat && vessel.currentLng && // Must have coordinates
    matchesOilProductType(vessel.vesselType) // Only show oil vessels or vessels carrying oil products
  ).slice(0, 500); // Limit to 500 vessels for performance

  // Render vessel routes for tracked vessel
  const renderVesselRoutes = () => {
    if (!trackedVessel || !trackedVessel.currentLat || !trackedVessel.currentLng) return null;

    const lat = typeof trackedVessel.currentLat === 'number' ? trackedVessel.currentLat : parseFloat(String(trackedVessel.currentLat));
    const lng = typeof trackedVessel.currentLng === 'number' ? trackedVessel.currentLng : parseFloat(String(trackedVessel.currentLng));
    
    // Create simulated historical path points
    const path = [
      { lat: lat - 0.8, lng: lng - 0.5 },
      { lat: lat - 0.5, lng: lng - 0.3 },
      { lat: lat - 0.3, lng: lng - 0.15 },
      { lat: lat - 0.1, lng: lng - 0.05 },
      { lat, lng } // Current position
    ];

    return (
      <Polyline
        path={path}
        options={{
          strokeColor: '#FF5722',
          strokeOpacity: 0.8,
          strokeWeight: 3
        }}
      />
    );
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (map) {
      map.setZoom((map.getZoom() || defaultZoom) + 1);
    }
  };

  const handleZoomOut = () => {
    if (map) {
      map.setZoom((map.getZoom() || defaultZoom) - 1);
    }
  };

  const handleResetView = () => {
    if (map) {
      if (selectedRegion && regionPositions[selectedRegion]) {
        const position = regionPositions[selectedRegion];
        map.setCenter({ lat: position.lat, lng: position.lng });
        map.setZoom(position.zoom);
      } else {
        map.setCenter(defaultCenter);
        map.setZoom(defaultZoom);
      }
    }
  };

  if (loadError) {
    return (
      <div className="relative h-96 md:h-[500px] bg-gray-100 flex items-center justify-center">
        <div className="text-red-500 text-lg">Error loading maps</div>
      </div>
    );
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="relative h-96 md:h-[500px] bg-gray-100 flex items-center justify-center">
        <div className="text-primary text-lg">Loading maps...</div>
      </div>
    );
  }

  return (
    <div className="relative h-96 md:h-[500px] overflow-hidden rounded-lg map-scroll-prevention">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={defaultZoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={defaultOptions}
        onClick={closeInfoWindows}
      >
        {/* Vessel Markers */}
        {filteredVessels.map(vessel => (
          vessel.currentLat && vessel.currentLng && (
            <Marker
              key={`vessel-${vessel.id}`}
              position={{
                lat: typeof vessel.currentLat === 'number' ? vessel.currentLat : parseFloat(String(vessel.currentLat)),
                lng: typeof vessel.currentLng === 'number' ? vessel.currentLng : parseFloat(String(vessel.currentLng))
              }}
              icon={getVesselIcon(vessel.vesselType || 'Oil Tanker')}
              onClick={() => handleVesselClick(vessel)}
              label={{
                text: getVesselLabel(vessel.vesselType || 'Oil Tanker'),
                color: '#FFFFFF',
                fontSize: '10px',
                fontWeight: 'bold',
                className: 'vessel-label'
              }}
            />
          )
        ))}

        {/* Refinery Markers */}
        {refineries.map(refinery => (
          <Marker
            key={`refinery-${refinery.id}`}
            position={{
              lat: refinery.lat,
              lng: refinery.lng
            }}
            icon={getRefineryIcon(refinery.status || 'operational')}
            onClick={() => handleRefineryClick(refinery)}
          />
        ))}

        {/* Vessel Info Window */}
        {selectedVessel && selectedVessel.currentLat && selectedVessel.currentLng && (
          <InfoWindow
            position={{
              lat: typeof selectedVessel.currentLat === 'number' ? selectedVessel.currentLat : parseFloat(String(selectedVessel.currentLat)),
              lng: typeof selectedVessel.currentLng === 'number' ? selectedVessel.currentLng : parseFloat(String(selectedVessel.currentLng))
            }}
            onCloseClick={() => setSelectedVessel(null)}
          >
            <div className="p-2 max-w-[200px]">
              <h3 className="font-bold text-sm">{selectedVessel.name}</h3>
              <div className="text-xs mt-1">
                <div><span className="font-semibold">Type:</span> {selectedVessel.vesselType}</div>
                <div><span className="font-semibold">IMO:</span> {selectedVessel.imo}</div>
                <div><span className="font-semibold">Flag:</span> {selectedVessel.flag}</div>
                {selectedVessel.departurePort && (
                  <div><span className="font-semibold">From:</span> {selectedVessel.departurePort}</div>
                )}
                {selectedVessel.destinationPort && (
                  <div><span className="font-semibold">To:</span> {selectedVessel.destinationPort}</div>
                )}
              </div>
            </div>
          </InfoWindow>
        )}

        {/* Refinery Info Window */}
        {selectedRefinery && (
          <InfoWindow
            position={{
              lat: selectedRefinery.lat,
              lng: selectedRefinery.lng
            }}
            onCloseClick={() => setSelectedRefinery(null)}
          >
            <div className="p-2 max-w-[200px]">
              <h3 className="font-bold text-sm">{selectedRefinery.name}</h3>
              <div className="text-xs mt-1">
                <div><span className="font-semibold">Country:</span> {selectedRefinery.country}</div>
                <div><span className="font-semibold">Region:</span> {selectedRefinery.region}</div>
                <div><span className="font-semibold">Status:</span> {selectedRefinery.status}</div>
                {selectedRefinery.capacity && (
                  <div><span className="font-semibold">Capacity:</span> {selectedRefinery.capacity.toLocaleString()} bpd</div>
                )}
              </div>
            </div>
          </InfoWindow>
        )}

        {/* Vessel Route for tracked vessel */}
        {renderVesselRoutes()}
      </GoogleMap>

      {/* Custom Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <Button
          onClick={handleZoomIn}
          className="h-8 w-8 p-0 shadow-md bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
          aria-label="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleZoomOut}
          className="h-8 w-8 p-0 shadow-md bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
          aria-label="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleResetView}
          className="h-8 w-8 p-0 shadow-md bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
          aria-label="Reset View"
        >
          <Locate className="h-4 w-4" />
        </Button>
      </div>

      {/* Tracked Vessel Info */}
      {trackedVessel && trackedVessel.currentLat && trackedVessel.currentLng && (
        <div className="absolute top-20 right-4 z-10 bg-white rounded-lg shadow-md p-3 max-w-[220px]">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold flex items-center">
              <Navigation className="h-3 w-3 mr-1 text-blue-500"/>
              Tracking Vessel
            </h4>
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-[10px]">LIVE</Badge>
          </div>
          <div className="space-y-1 text-xs">
            <div className="font-medium">{trackedVessel.name}</div>
            <div className="flex justify-between">
              <span className="text-gray-500">Vessel Type:</span>
              <span>{trackedVessel.vesselType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Position:</span>
              <span>
                {typeof trackedVessel.currentLat === 'number' ? trackedVessel.currentLat.toFixed(3) : parseFloat(String(trackedVessel.currentLat)).toFixed(3)}, 
                {typeof trackedVessel.currentLng === 'number' ? trackedVessel.currentLng.toFixed(3) : parseFloat(String(trackedVessel.currentLng)).toFixed(3)}
              </span>
            </div>
            {trackedVessel.destinationPort && (
              <div className="flex justify-between">
                <span className="text-gray-500">Heading to:</span>
                <span>{trackedVessel.destinationPort.split(',')[0]}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}