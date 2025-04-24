import { useState, useEffect, useCallback, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Vessel, Refinery, Region } from '@/types';
import { Badge } from '@/components/ui/badge';
import { 
  Ship, 
  Navigation as NavigationIcon, 
  Droplet, 
  ExternalLink, 
  Radar, 
  MapPin, 
  Info, 
  Flag, 
  Calendar, 
  Globe, 
  Gauge 
} from 'lucide-react';
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
        onMove={(evt: ViewStateChangeEvent) => setViewport(evt.viewState)}
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
                  width: '26px', 
                  height: '26px', 
                  background: `rgba(255,255,255,0.85)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${getVesselColor(vessel.vesselType || 'Oil Tanker')}`,
                  boxShadow: '0 0 0 2px rgba(0,0,0,0.1), 0 3px 6px rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                  transform: 'translate(-50%, -50%)',
                  // Set color for pulse animation
                  '--color-pulse': getVesselColor(vessel.vesselType || 'Oil Tanker').replace('#', '').match(/.{2}/g)?.map(c => parseInt(c, 16)).join(', ')
                } as React.CSSProperties}
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
                width: '26px', 
                height: '26px', 
                background: 'rgba(255,255,255,0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #dc3545',
                boxShadow: '0 0 0 2px rgba(0,0,0,0.15), 0 3px 8px rgba(0,0,0,0.2)',
                cursor: 'pointer',
                transform: 'translate(-50%, -50%)',
                transition: 'all 0.3s ease'
              }}
            >
              <span style={{ fontSize: '14px' }}>⛽</span>
              <div 
                style={{
                  position: 'absolute',
                  width: '150%',
                  height: '150%',
                  borderRadius: '50%',
                  border: '1px solid rgba(220, 53, 69, 0.3)',
                  zIndex: -1
                }}
              />
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
            maxWidth="260px"
          >
            <div className="p-3 max-w-[260px] bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
              {/* Header with refinery name and badge */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm text-primary flex items-center">
                  <Droplet className="h-3.5 w-3.5 mr-1.5 text-red-500" />
                  {selectedRefinery.name}
                </h3>
                <Badge 
                  variant="outline" 
                  className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-0 px-1.5 py-0"
                >
                  {selectedRefinery.status}
                </Badge>
              </div>

              {/* Refinery details with icons */}
              <div className="text-xs space-y-1.5 mb-3 text-gray-700 dark:text-gray-300">
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1.5 text-red-500/70" />
                  <span className="font-medium">Country:</span>
                  <span className="ml-1">{selectedRefinery.country}</span>
                </div>
                
                <div className="flex items-center">
                  <Globe className="h-3 w-3 mr-1.5 text-red-500/70" />
                  <span className="font-medium">Region:</span>
                  <span className="ml-1">{selectedRefinery.region}</span>
                </div>
                
                {selectedRefinery.capacity && (
                  <div className="flex items-center">
                    <Gauge className="h-3 w-3 mr-1.5 text-red-500/70" />
                    <span className="font-medium">Capacity:</span>
                    <span className="ml-1">{selectedRefinery.capacity.toLocaleString()} bpd</span>
                  </div>
                )}
              </div>

              {/* View details button */}
              <Button 
                size="sm" 
                className="text-xs h-8 w-full bg-red-500/90 hover:bg-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/refineries/${selectedRefinery.id}`;
                }}
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                View Refinery Details
              </Button>
            </div>
          </Popup>
        )}
      </Map>

      {/* Tracked Vessel Info */}
      {trackedVessel && trackedVessel.currentLat && trackedVessel.currentLng && (
        <div className="absolute top-20 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-4 max-w-[260px] border border-blue-100 dark:border-blue-900/30">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold flex items-center text-blue-600 dark:text-blue-400">
              <NavigationIcon className="h-3.5 w-3.5 mr-1.5"/>
              Tracking Vessel
            </h4>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 hover:bg-blue-100 text-[10px] px-2 py-0 flex items-center">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-1 animate-pulse"></span>
              LIVE
            </Badge>
          </div>
          
          <div className="text-xs space-y-2 mb-2">
            <div className="font-medium text-sm mb-2 text-blue-800 dark:text-blue-300 border-b border-blue-100 dark:border-blue-900/40 pb-1">
              {trackedVessel.name}
            </div>
            
            <div className="flex items-start">
              <Ship className="h-3 w-3 mr-1.5 text-blue-500/70 mt-0.5" />
              <div className="flex justify-between w-full">
                <span className="font-medium">Vessel Type:</span>
                <span className="ml-1 text-gray-700 dark:text-gray-300">{trackedVessel.vesselType}</span>
              </div>
            </div>
            
            <div className="flex items-start">
              <MapPin className="h-3 w-3 mr-1.5 text-blue-500/70 mt-0.5" />
              <div className="flex flex-col w-full">
                <span className="font-medium mb-0.5">Position:</span>
                <span className="text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded text-[10px] font-mono">
                  {typeof trackedVessel.currentLat === 'number' ? trackedVessel.currentLat.toFixed(4) : parseFloat(String(trackedVessel.currentLat)).toFixed(4)}, 
                  {typeof trackedVessel.currentLng === 'number' ? trackedVessel.currentLng.toFixed(4) : parseFloat(String(trackedVessel.currentLng)).toFixed(4)}
                </span>
              </div>
            </div>
            
            {trackedVessel.destinationPort && (
              <div className="flex items-start">
                <Radar className="h-3 w-3 mr-1.5 text-blue-500/70 mt-0.5" />
                <div className="flex justify-between w-full">
                  <span className="font-medium">Heading to:</span>
                  <span className="ml-1 text-gray-700 dark:text-gray-300">{trackedVessel.destinationPort.split(',')[0]}</span>
                </div>
              </div>
            )}
          </div>
          
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7 w-full border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30 mt-1"
            onClick={() => window.location.href = `/vessels/${trackedVessel.id}`}
          >
            <ExternalLink className="h-3 w-3 mr-1.5" />
            View Details
          </Button>
        </div>
      )}
    </div>
  );
}