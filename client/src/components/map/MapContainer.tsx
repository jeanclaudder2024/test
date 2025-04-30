import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Vessel, Refinery } from '@shared/schema';
import { REGIONS } from '@/../../shared/constants';
import { Loader2 } from 'lucide-react';
import EnhancedMap from './EnhancedMap';

interface MapContainerProps {
  onVesselClick: (vessel: Vessel) => void;
  onRefineryClick: (refinery: Refinery) => void;
  initialCenter?: [number, number];
  initialZoom?: number;
  filterRegion?: string | null;
  filterVesselTypes?: string[];
  filterRefineryStatuses?: string[];
  selectedRefineryId?: number | null;
  selectedVesselId?: number | null;
}

export default function MapContainer({
  onVesselClick,
  onRefineryClick,
  initialCenter,
  initialZoom,
  filterRegion = null,
  filterVesselTypes = [],
  filterRefineryStatuses = [],
  selectedRefineryId = null,
  selectedVesselId = null
}: MapContainerProps) {
  // State for generating ports from refineries
  const [ports, setPorts] = useState<Vessel[]>([]);
  
  // Fetch vessels data
  const {
    data: vessels = [],
    isLoading: vesselsLoading,
    error: vesselsError
  } = useQuery<Vessel[]>({
    queryKey: ['/api/vessels'],
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Fetch refineries data
  const {
    data: refineries = [],
    isLoading: refineriesLoading,
    error: refineriesError
  } = useQuery<Refinery[]>({
    queryKey: ['/api/refineries'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Create ports from refineries (for demonstration)
  useEffect(() => {
    if (refineries.length > 0) {
      // Convert refineries to port vessels
      const portsFromRefineries = refineries.map((refinery, index) => {
        const portId = 1000000 + index; // Ensure unique IDs for ports
        return {
          id: portId,
          name: `${refinery.name} Port`,
          vesselType: 'port',
          lat: typeof refinery.lat === 'string' ? refinery.lat : String(refinery.lat),
          lng: typeof refinery.lng === 'string' ? refinery.lng : String(refinery.lng),
          currentRegion: refinery.region,
          mmsi: `PORT-${portId}`,
          imo: `PORT-${portId}`,
          flag: refinery.country,
          refineryId: refinery.id,
          cargoType: null,
          cargoCapacity: null,
          speed: null,
          heading: null,
          destination: null,
          eta: null,
          lastPort: null,
          currentStatus: 'active',
          shipOwner: refinery.name,
          yearBuilt: null,
          grossTonnage: null,
          createdAt: null,
          updatedAt: null
        } as Vessel;
      });
      
      setPorts(portsFromRefineries);
    }
  }, [refineries]);
  
  // Apply filters to vessels
  const filteredVessels = vessels.filter(vessel => {
    // Region filter
    if (filterRegion && vessel.currentRegion !== filterRegion) {
      return false;
    }
    
    // Vessel type filter
    if (filterVesselTypes.length > 0 && !filterVesselTypes.includes(vessel.vesselType || '')) {
      return false;
    }
    
    return true;
  });
  
  // Apply filters to refineries
  const filteredRefineries = refineries.filter(refinery => {
    // Region filter
    if (filterRegion && refinery.region !== filterRegion) {
      return false;
    }
    
    // Status filter
    if (filterRefineryStatuses.length > 0 && !filterRefineryStatuses.includes(refinery.status || '')) {
      return false;
    }
    
    return true;
  });
  
  // Get vessels associated with a specific refinery
  const getVesselsForRefinery = (refineryId: number) => {
    if (!refineryId) return [];
    
    const selectedRefinery = refineries.find(r => r.id === refineryId);
    if (!selectedRefinery) return [];
    
    // Get refinery coordinates
    const refineryLat = typeof selectedRefinery.lat === 'string' 
      ? parseFloat(selectedRefinery.lat) 
      : selectedRefinery.lat || 0;
      
    const refineryLng = typeof selectedRefinery.lng === 'string' 
      ? parseFloat(selectedRefinery.lng) 
      : selectedRefinery.lng || 0;
    
    // Find vessels within ~500km of the refinery
    return vessels.filter(vessel => {
      if (!vessel.lat || !vessel.lng) return false;
      
      const vesselLat = typeof vessel.lat === 'string' ? parseFloat(vessel.lat) : vessel.lat;
      const vesselLng = typeof vessel.lng === 'string' ? parseFloat(vessel.lng) : vessel.lng;
      
      if (isNaN(vesselLat) || isNaN(vesselLng)) return false;
      
      // Calculate distance using the Haversine formula
      const R = 6371; // Earth's radius in km
      const dLat = (vesselLat - refineryLat) * Math.PI / 180;
      const dLon = (vesselLng - refineryLng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(refineryLat * Math.PI / 180) * Math.cos(vesselLat * Math.PI / 180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      // Find vessels within 500km
      return distance <= 500;
    });
  };
  
  // Calculate center if we have a selected entity
  const calculateInitialCenter = (): [number, number] | undefined => {
    if (!initialCenter) {
      if (selectedRefineryId) {
        const refinery = refineries.find(r => r.id === selectedRefineryId);
        if (refinery && refinery.lat && refinery.lng) {
          const lat = typeof refinery.lat === 'string' ? parseFloat(refinery.lat) : refinery.lat;
          const lng = typeof refinery.lng === 'string' ? parseFloat(refinery.lng) : refinery.lng;
          return [lat, lng];
        }
      } else if (selectedVesselId) {
        const vessel = vessels.find(v => v.id === selectedVesselId);
        if (vessel && vessel.lat && vessel.lng) {
          const lat = typeof vessel.lat === 'string' ? parseFloat(vessel.lat) : vessel.lat;
          const lng = typeof vessel.lng === 'string' ? parseFloat(vessel.lng) : vessel.lng;
          return [lat, lng];
        }
      }
    }
    return initialCenter;
  };
  
  // Calculate vessels to display
  const vesselsToDisplay = selectedRefineryId
    ? getVesselsForRefinery(selectedRefineryId)
    : filteredVessels;
  
  // Calculate refineries to display
  const refineriesToDisplay = selectedRefineryId
    ? refineries.filter(r => r.id === selectedRefineryId)
    : filteredRefineries;
  
  // Determine if we're loading
  const isLoading = vesselsLoading || refineriesLoading;
  
  // Handle errors
  if (vesselsError || refineriesError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Map Data</h3>
        <p className="text-red-700">
          {vesselsError ? 'Error loading vessels: ' + (vesselsError as Error).message : ''}
        </p>
        <p className="text-red-700">
          {refineriesError ? 'Error loading refineries: ' + (refineriesError as Error).message : ''}
        </p>
      </div>
    );
  }
  
  return (
    <div className="w-full relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-300">Loading marine traffic data...</p>
          </div>
        </div>
      )}
      
      <EnhancedMap
        vessels={vesselsToDisplay}
        refineries={refineriesToDisplay}
        ports={ports}
        onVesselClick={onVesselClick}
        onRefineryClick={onRefineryClick}
        isLoading={isLoading}
        initialCenter={calculateInitialCenter()}
        initialZoom={initialZoom}
      />
    </div>
  );
}