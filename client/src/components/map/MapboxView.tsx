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

/**
 * MapboxView Component - Simplified fallback version
 * 
 * This component provides a simplified version of MapboxView with a card displaying
 * vessel information instead of the actual interactive map which requires
 * react-map-gl and mapbox-gl setup.
 */
export default function MapboxView({
  vessels,
  refineries,
  selectedRegion,
  trackedVessel,
  onVesselClick,
  onRefineryClick,
  isLoading = false
}: MapboxViewProps) {
  // Helper function to check if vessel is an oil vessel
  function isOilVessel(vesselType: string | null): boolean {
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
  }
  
  // Filter vessels to show only oil-related ones
  const filteredVessels = vessels.filter(vessel => 
    vessel.currentLat && vessel.currentLng && 
    isOilVessel(vessel.vesselType)
  ).slice(0, 500);
  
  // Select a vessel to display in the card
  const displayedVessel = trackedVessel || (filteredVessels.length > 0 ? filteredVessels[0] : null);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="relative h-96 md:h-[500px] bg-gray-100 flex items-center justify-center">
        <div className="text-primary text-lg">Loading map...</div>
      </div>
    );
  }
  
  return (
    <div className="relative h-96 md:h-[500px] bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg overflow-hidden flex flex-col">
      {/* Map Image Placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-white text-center">
          <MapPin className="h-16 w-16 mx-auto mb-4 text-white opacity-40" />
          <p className="text-xl font-bold">MapboxView requires MapGL setup</p>
          <p className="max-w-sm text-white/70 mt-2 mb-4">Switching to SimpleLeafletMap is recommended for vessel tracking</p>
        </div>
      </div>
      
      {/* Vessel Card */}
      {displayedVessel && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-80 bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
          <div className="relative h-28 overflow-hidden bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-50"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1572396698880-61c914c5901e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=300&ixid=MnwxfDB8MXxyYW5kb218MHx8c2hpcHx8fHx8fDE2NDU3NjE5NTg&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=450')`
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/10"></div>
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
            
            <div className="absolute bottom-0 left-0 p-3 w-full">
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                <Ship className="h-4 w-4 text-blue-300" />
                {displayedVessel.name}
              </h3>
              <div className="flex items-center mt-0.5">
                <Badge 
                  variant="outline" 
                  className="mr-1.5 text-[10px] bg-blue-600/30 text-white border-blue-400/30 backdrop-blur-sm"
                >
                  {displayedVessel.vesselType || 'Oil Tanker'}
                </Badge>
                <span className="text-blue-100 text-[10px]">{displayedVessel.flag}</span>
              </div>
            </div>
          </div>
          
          <div className="p-2.5">
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              <div className="bg-blue-50 dark:bg-blue-950/40 rounded p-1.5 border border-blue-100/50 dark:border-blue-800/50">
                <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">IMO NUMBER</div>
                <div className="text-sm font-medium">{displayedVessel.imo || 'N/A'}</div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded p-1.5 border border-emerald-100/50 dark:border-emerald-800/50">
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">CARGO TYPE</div>
                <div className="text-sm font-medium truncate">{displayedVessel.cargoType || 'Unknown'}</div>
              </div>
            </div>
            
            {/* Connected route line */}
            <div className="relative mb-2">
              <div className="absolute left-[7px] top-[14px] h-[calc(100%-10px)] w-0.5 bg-gradient-to-b from-blue-400 to-green-400"></div>
              
              <div className="space-y-1.5">
                {displayedVessel.departurePort && (
                  <div className="flex items-start gap-2 text-xs">
                    <div className="mt-0.5 h-4 w-4 rounded-full bg-blue-100 dark:bg-blue-800 border-2 border-blue-400 flex items-center justify-center flex-shrink-0 z-10">
                      <span className="text-blue-600 dark:text-blue-400 text-[8px] font-bold">A</span>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground">DEPARTURE</div>
                      <div className="font-medium">{displayedVessel.departurePort}</div>
                    </div>
                  </div>
                )}
                
                {displayedVessel.destinationPort && (
                  <div className="flex items-start gap-2 text-xs">
                    <div className="mt-0.5 h-4 w-4 rounded-full bg-green-100 dark:bg-green-800 border-2 border-green-400 flex items-center justify-center flex-shrink-0 z-10">
                      <span className="text-green-600 dark:text-green-400 text-[8px] font-bold">B</span>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground">DESTINATION</div>
                      <div className="font-medium">{displayedVessel.destinationPort}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Vessel Card Actions */}
            <div className="flex mt-2 gap-1.5">
              <Button 
                variant="outline" 
                className="flex-1 text-[11px] h-7 border-green-500 text-green-600 hover:text-green-700 hover:bg-green-50/70 dark:border-green-700 dark:text-green-500 dark:hover:bg-green-950/50"
                onClick={() => onVesselClick(displayedVessel)}
              >
                <NavigationIcon className="h-3 w-3 mr-1" />
                Track Vessel
              </Button>
              <Button 
                variant="default" 
                className="flex-1 text-[11px] h-7 bg-blue-600 hover:bg-blue-700 text-white"
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