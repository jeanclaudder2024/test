import { useState, useEffect } from 'react';
import { Vessel, Refinery } from '@shared/schema';
import EnhancedMap from './EnhancedMap';
import { useDataStream } from '@/hooks/useDataStream';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface MapContainerProps {
  onVesselClick: (vessel: Vessel) => void;
  onRefineryClick: (refinery: Refinery) => void;
  filterRegion?: string | null;
  filterVesselTypes?: string[];
  filterRefineryStatuses?: string[];
  selectedRefineryId?: number | null;
  selectedVesselId?: number | null;
  initialCenter?: [number, number];
  initialZoom?: number;
}

export default function MapContainer({
  onVesselClick,
  onRefineryClick,
  filterRegion,
  filterVesselTypes = [],
  filterRefineryStatuses = [],
  selectedRefineryId,
  selectedVesselId,
  initialCenter,
  initialZoom
}: MapContainerProps) {
  // Get data from the data stream
  const { vessels = [], refineries = [], loading } = useDataStream();
  
  // Local state
  const [filteredVessels, setFilteredVessels] = useState<Vessel[]>([]);
  const [filteredRefineries, setFilteredRefineries] = useState<Refinery[]>([]);
  const [associatedVessels, setAssociatedVessels] = useState<Vessel[]>([]);

  // Apply filters and update local state
  useEffect(() => {
    // Filter vessels based on region and type
    const vesselFiltered = vessels.filter(vessel => {
      // Filter by region
      const passesRegionFilter = !filterRegion || vessel.currentRegion === filterRegion;
      
      // Filter by vessel type
      const passesTypeFilter = filterVesselTypes.length === 0 || 
        filterVesselTypes.includes(vessel.vesselType || 'Unknown') ||
        filterVesselTypes.includes(vessel.cargoType || 'Unknown');
      
      return passesRegionFilter && passesTypeFilter;
    });
    
    setFilteredVessels(vesselFiltered);
    
    // Filter refineries based on region and status
    const refineryFiltered = refineries.filter(refinery => {
      // Filter by region
      const passesRegionFilter = !filterRegion || refinery.region === filterRegion;
      
      // Filter by status
      const passesStatusFilter = filterRefineryStatuses.length === 0 ||
        filterRefineryStatuses.includes(refinery.status || 'Unknown');
      
      return passesRegionFilter && passesStatusFilter;
    });
    
    setFilteredRefineries(refineryFiltered);
    
    // If a refinery is selected, find vessels in its vicinity
    if (selectedRefineryId) {
      const selectedRefinery = refineries.find(r => r.id === selectedRefineryId);
      if (selectedRefinery) {
        const nearbyVessels = findVesselsNearRefinery(selectedRefinery, vessels);
        setAssociatedVessels(nearbyVessels);
      }
    } else {
      setAssociatedVessels([]);
    }
  }, [vessels, refineries, filterRegion, filterVesselTypes, filterRefineryStatuses, selectedRefineryId]);

  // Function to find vessels near a refinery
  const findVesselsNearRefinery = (refinery: Refinery, allVessels: Vessel[]): Vessel[] => {
    // Maximum distance in degrees (approximately 300km at the equator)
    const MAX_DISTANCE = 3; 
    
    if (!refinery.lat || !refinery.lng) return [];

    const refineryLat = typeof refinery.lat === 'string' ? parseFloat(refinery.lat) : refinery.lat;
    const refineryLng = typeof refinery.lng === 'string' ? parseFloat(refinery.lng) : refinery.lng;
    
    return allVessels.filter(vessel => {
      if (!vessel.currentLat || !vessel.currentLng) return false;
      
      const vesselLat = typeof vessel.currentLat === 'string' ? parseFloat(vessel.currentLat) : vessel.currentLat;
      const vesselLng = typeof vessel.currentLng === 'string' ? parseFloat(vessel.currentLng) : vessel.currentLng;
      
      // Simple distance calculation for demonstration
      const distance = Math.sqrt(
        Math.pow(vesselLat - refineryLat, 2) + 
        Math.pow(vesselLng - refineryLng, 2)
      );
      
      return distance <= MAX_DISTANCE;
    });
  };

  // Determine which vessels to display
  const vesselsToDisplay = selectedRefineryId ? associatedVessels : filteredVessels;
  
  // Determine which refineries to display
  const refineriesToDisplay = selectedRefineryId 
    ? refineries.filter(r => r.id === selectedRefineryId) 
    : filteredRefineries;
  
  // Get center coordinates if a refinery is selected
  const getMapCenter = (): [number, number] | undefined => {
    if (selectedRefineryId) {
      const selectedRefinery = refineries.find(r => r.id === selectedRefineryId);
      if (selectedRefinery && selectedRefinery.lat && selectedRefinery.lng) {
        return [
          typeof selectedRefinery.lat === 'string' ? parseFloat(selectedRefinery.lat) : selectedRefinery.lat,
          typeof selectedRefinery.lng === 'string' ? parseFloat(selectedRefinery.lng) : selectedRefinery.lng
        ];
      }
    }
    return initialCenter;
  };

  return (
    <Card className="h-[600px] relative overflow-hidden">
      <CardContent className="p-0 h-full">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Loading map data...</span>
          </div>
        ) : (
          <EnhancedMap
            vessels={vesselsToDisplay}
            refineries={refineriesToDisplay}
            onVesselClick={onVesselClick}
            onRefineryClick={onRefineryClick}
            isLoading={loading}
            initialCenter={getMapCenter()}
            initialZoom={selectedRefineryId ? 7 : initialZoom}
          />
        )}
      </CardContent>
    </Card>
  );
}