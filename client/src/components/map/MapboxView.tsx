import { useState, useEffect } from 'react';
import { Vessel, Refinery, Region } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Ship, Navigation as NavigationIcon, MapPin } from 'lucide-react';
import { OIL_PRODUCT_TYPES } from '@/../../shared/constants';
import { Button } from '@/components/ui/button';

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

  // For simplicity, let's display a fallback message and show a vessel card instead
  const displayedVessel = selectedVessel || trackedVessel || (filteredVessels.length > 0 ? filteredVessels[0] : null);
  
  return (
    <div className="relative h-96 md:h-[500px] bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg overflow-hidden flex flex-col">
      {/* Map Image Placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-white text-center">
          <MapPin className="h-16 w-16 mx-auto mb-4 text-white opacity-40" />
          <p className="text-xl font-bold">MapboxView requires MapGl setup</p>
          <p className="max-w-sm text-white/70 mt-2 mb-4">Switching to SimpleLeafletMap is recommended for vessel tracking</p>
        </div>
      </div>
      
      {/* Vessel Card */}
      {displayedVessel && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-80 bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
          <div className="relative h-24 overflow-hidden bg-gradient-to-r from-blue-900 to-blue-700">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-60"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1572396698880-61c914c5901e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=300&ixid=MnwxfDB8MXxyYW5kb218MHx8c2hpcHx8fHx8fDE2NDU3NjE5NTg&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=450')`
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-3 w-full">
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                <Ship className="h-4 w-4" />
                {displayedVessel.name}
              </h3>
              <div className="flex items-center mt-0.5">
                <Badge 
                  variant="outline" 
                  className="mr-1.5 text-[10px] bg-white/20 text-white border-white/30"
                >
                  {displayedVessel.vesselType || 'Oil Tanker'}
                </Badge>
                <span className="text-white/80 text-[10px]">{displayedVessel.flag}</span>
              </div>
            </div>
          </div>
          
          <div className="p-3">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded p-1.5">
                <div className="text-[10px] text-blue-500 dark:text-blue-400 font-medium">IMO NUMBER</div>
                <div className="text-sm font-medium">{displayedVessel.imo || 'N/A'}</div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded p-1.5">
                <div className="text-[10px] text-emerald-500 dark:text-emerald-400 font-medium">CARGO TYPE</div>
                <div className="text-sm font-medium truncate">{displayedVessel.cargoType || 'Unknown'}</div>
              </div>
            </div>
            
            <div className="space-y-2">
              {displayedVessel.departurePort && (
                <div className="flex items-start gap-2 text-xs">
                  <div className="mt-0.5 h-4 w-4 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 dark:text-blue-400 text-[10px]">A</span>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">DEPARTURE</div>
                    <div className="font-medium">{displayedVessel.departurePort}</div>
                  </div>
                </div>
              )}
              
              {displayedVessel.destinationPort && (
                <div className="flex items-start gap-2 text-xs">
                  <div className="mt-0.5 h-4 w-4 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 dark:text-green-400 text-[10px]">B</span>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">DESTINATION</div>
                    <div className="font-medium">{displayedVessel.destinationPort}</div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex mt-3 gap-2">
              <Button 
                variant="outline" 
                className="flex-1 text-xs h-8 border-green-500 text-green-600 hover:text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-500 dark:hover:bg-green-950/50"
                onClick={() => onVesselClick(displayedVessel)}
              >
                <NavigationIcon className="h-3 w-3 mr-1" />
                Track Vessel
              </Button>
              <Button 
                variant="default" 
                className="flex-1 text-xs h-8 bg-primary hover:bg-primary/90"
                onClick={() => {
                  onVesselClick(displayedVessel);
                  window.location.href = `/vessels/${displayedVessel.id}`;
                }}
              >
                <Ship className="h-3 w-3 mr-1" />
                View Details
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 bg-white rounded-md shadow-sm z-30">
        <div className="text-[10px] text-center p-2 border-b text-muted-foreground font-medium">MAP CONTROLS</div>
        <Button variant="ghost" size="icon" className="p-2 text-gray-600 hover:bg-gray-100 hover:text-primary">
          <MapPin className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}