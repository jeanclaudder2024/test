import { useState, useEffect, useCallback, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Vessel, Refinery, Region } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Ship, Navigation as NavigationIcon, Droplet, ExternalLink, Radar, MapPin, Info, Flag, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OIL_PRODUCT_TYPES } from '@/../../shared/constants';
import Map, { Marker, Popup, NavigationControl, FullscreenControl, ScaleControl, ViewStateChangeEvent, ViewState } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Region center positions
const regionPositions: Record<string, { lat: number; lng: number; zoom: number }> = {
  'north-america': { lat: 40, lng: -100, zoom: 3 },
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

interface MapboxViewProps {
  vessels: Vessel[];
  refineries: Refinery[];
  selectedRegion: Region | null;
  trackedVessel?: Vessel | null;
  onVesselClick: (vessel: Vessel) => void;
  onRefineryClick?: (refinery: Refinery) => void;
  isLoading?: boolean;
}

export default function MapboxView({
  vessels,
  refineries,
  selectedRegion,
  trackedVessel,
  onVesselClick,
  onRefineryClick,
  isLoading = false
}: MapboxViewProps) {
  // Default to world view
  const defaultViewport = {
    latitude: 25,
    longitude: 10,
    zoom: 1.5,
    bearing: 0,
    pitch: 0
  };

  const [viewport, setViewport] = useState(defaultViewport);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [selectedRefinery, setSelectedRefinery] = useState<Refinery | null>(null);
  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA";

  // Update viewport when region changes
  useEffect(() => {
    if (selectedRegion && regionPositions[selectedRegion]) {
      const position = regionPositions[selectedRegion];
      setViewport({
        ...viewport,
        latitude: position.lat,
        longitude: position.lng,
        zoom: position.zoom
      });
    }
  }, [selectedRegion]);

  // Update viewport when tracked vessel changes
  useEffect(() => {
    if (trackedVessel && trackedVessel.currentLat && trackedVessel.currentLng) {
      setViewport({
        ...viewport,
        latitude: typeof trackedVessel.currentLat === 'number' ? trackedVessel.currentLat : parseFloat(String(trackedVessel.currentLat)),
        longitude: typeof trackedVessel.currentLng === 'number' ? trackedVessel.currentLng : parseFloat(String(trackedVessel.currentLng)),
        zoom: 8
      });
    }
  }, [trackedVessel]);

  // Handle vessel marker click
  const handleVesselClick = useCallback((vessel: Vessel) => {
    setSelectedVessel(vessel);
    setSelectedRefinery(null); // Clear refinery selection
    if (onVesselClick) {
      onVesselClick(vessel);
    }
  }, [onVesselClick]);

  // Handle refinery marker click
  const handleRefineryClick = useCallback((refinery: Refinery) => {
    setSelectedRefinery(refinery);
    setSelectedVessel(null); // Clear vessel selection
    if (onRefineryClick) {
      onRefineryClick(refinery);
    }
  }, [onRefineryClick]);

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

  // Get vessel marker color based on type
  const getVesselColor = (type: string) => {
    if (type.toLowerCase().includes('lng')) return "#4ECDC4";
    if (type.toLowerCase().includes('cargo')) return "#FFD166";
    if (type.toLowerCase().includes('container')) return "#118AB2";
    if (type.toLowerCase().includes('chemical')) return "#9A48D0";
    return "#FF6B6B"; // Default to oil tanker color
  };

  // Get vessel emoji based on type
  const getVesselEmoji = (type: string): string => {
    if (type.toLowerCase().includes('lng')) return '🔋';
    if (type.toLowerCase().includes('container')) return '📦';
    if (type.toLowerCase().includes('chemical')) return '⚗️';
    if (type.toLowerCase().includes('cargo')) return '🚢';
    return '🛢️';
  };

  if (isLoading) {
    return (
      <div className="relative h-96 md:h-[500px] bg-gray-100 flex items-center justify-center">
        <div className="text-primary text-lg">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden">
      <Map
        {...viewport}
        onMove={(evt: { viewState: ViewState }) => setViewport(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        mapboxAccessToken={mapboxToken}
        attributionControl={true}
        style={{ width: '100%', height: '100%' }}
        onClick={() => {
          setSelectedVessel(null);
          setSelectedRefinery(null);
        }}
      >
        {/* Navigation Controls */}
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />
        <ScaleControl position="bottom-right" />

        {/* Vessel Markers */}
        {filteredVessels.map(vessel => (
          vessel.currentLat && vessel.currentLng && (
            <Marker
              key={`vessel-${vessel.id}`}
              latitude={typeof vessel.currentLat === 'number' ? vessel.currentLat : parseFloat(String(vessel.currentLat))}
              longitude={typeof vessel.currentLng === 'number' ? vessel.currentLng : parseFloat(String(vessel.currentLng))}
              onClick={(e: { originalEvent: MouseEvent }) => {
                e.originalEvent.stopPropagation();
                handleVesselClick(vessel);
              }}
            >
              <div 
                className="vessel-marker relative" 
                style={{ 
                  borderRadius: '50%', 
                  width: '24px', 
                  height: '24px', 
                  background: `rgba(255,255,255,0.8)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${getVesselColor(vessel.vesselType || 'Oil Tanker')}`,
                  boxShadow: '0 0 0 2px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <span style={{ fontSize: '14px' }}>{getVesselEmoji(vessel.vesselType || 'Oil Tanker')}</span>
              </div>
            </Marker>
          )
        ))}

        {/* Refinery Markers */}
        {refineries.map(refinery => (
          <Marker
            key={`refinery-${refinery.id}`}
            latitude={refinery.lat}
            longitude={refinery.lng}
            onClick={(e: { originalEvent: MouseEvent }) => {
              e.originalEvent.stopPropagation();
              handleRefineryClick(refinery);
            }}
          >
            <div 
              className="refinery-marker" 
              style={{ 
                borderRadius: '50%', 
                width: '24px', 
                height: '24px', 
                background: 'rgba(255,255,255,0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #dc3545',
                boxShadow: '0 0 0 2px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <span style={{ fontSize: '14px' }}>⛽</span>
            </div>
          </Marker>
        ))}

        {/* Vessel Popup */}
        {selectedVessel && selectedVessel.currentLat && selectedVessel.currentLng && (
          <Popup
            latitude={typeof selectedVessel.currentLat === 'number' ? selectedVessel.currentLat : parseFloat(String(selectedVessel.currentLat))}
            longitude={typeof selectedVessel.currentLng === 'number' ? selectedVessel.currentLng : parseFloat(String(selectedVessel.currentLng))}
            closeOnClick={false}
            onClose={() => setSelectedVessel(null)}
            anchor="bottom"
            offset={25}
            maxWidth="260px"
          >
            <div className="p-3 max-w-[260px] bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
              {/* Header with vessel name and badge */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm text-primary flex items-center">
                  <Ship className="h-3.5 w-3.5 mr-1.5" />
                  {selectedVessel.name}
                </h3>
                <Badge 
                  variant="outline" 
                  className="text-[10px] bg-primary/10 dark:bg-primary/20 text-primary border-0 px-1.5 py-0"
                >
                  {selectedVessel.vesselType}
                </Badge>
              </div>

              {/* Vessel details with icons */}
              <div className="text-xs space-y-1.5 mb-3 text-gray-700 dark:text-gray-300">
                <div className="flex items-center">
                  <Info className="h-3 w-3 mr-1.5 text-primary/70" />
                  <span className="font-medium">IMO:</span>
                  <span className="ml-1">{selectedVessel.imo}</span>
                </div>
                
                <div className="flex items-center">
                  <Flag className="h-3 w-3 mr-1.5 text-primary/70" />
                  <span className="font-medium">Flag:</span>
                  <span className="ml-1">{selectedVessel.flag}</span>
                </div>
                
                {selectedVessel.departurePort && (
                  <div className="flex items-start">
                    <Calendar className="h-3 w-3 mr-1.5 text-primary/70 mt-0.5" />
                    <div>
                      <span className="font-medium">Departed:</span>
                      <span className="ml-1">{selectedVessel.departurePort}</span>
                    </div>
                  </div>
                )}
                
                {selectedVessel.destinationPort && (
                  <div className="flex items-start">
                    <MapPin className="h-3 w-3 mr-1.5 text-primary/70 mt-0.5" />
                    <div>
                      <span className="font-medium">Destination:</span>
                      <span className="ml-1">{selectedVessel.destinationPort}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  className="text-xs h-8 flex-1 bg-primary/90 hover:bg-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/vessels/${selectedVessel.id}`;
                  }}
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  View Details
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-8 flex-1 border-primary/20 text-primary hover:bg-primary/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Set as tracked vessel
                    if (onVesselClick) {
                      onVesselClick(selectedVessel);
                    }
                  }}
                >
                  <Radar className="h-3.5 w-3.5 mr-1.5" />
                  Track
                </Button>
              </div>
            </div>
          </Popup>
        )}

        {/* Refinery Popup */}
        {selectedRefinery && (
          <Popup
            latitude={selectedRefinery.lat}
            longitude={selectedRefinery.lng}
            closeOnClick={false}
            onClose={() => setSelectedRefinery(null)}
            anchor="bottom"
            offset={25}
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
          </Popup>
        )}
      </Map>

      {/* Tracked Vessel Info */}
      {trackedVessel && trackedVessel.currentLat && trackedVessel.currentLng && (
        <div className="absolute top-20 right-4 z-10 bg-white rounded-lg shadow-md p-3 max-w-[220px]">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold flex items-center">
              <NavigationIcon className="h-3 w-3 mr-1 text-blue-500"/>
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