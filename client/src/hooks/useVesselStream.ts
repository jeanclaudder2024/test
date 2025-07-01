import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Vessel, Refinery, Port } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { generateConnectedPorts } from '@/data/refineryData';
import { getVesselsForRefinery } from '@/services/marineTrafficService';

interface VesselStreamData {
  vessels: Vessel[];
  refineries: Refinery[];
  ports: Port[];
  stats: any | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Hook to handle vessel and refinery data using database refineries
 * and MarineTraffic service for vessels at ports
 */
export function useVesselStream() {
  const [vesselsAndPorts, setVesselsAndPorts] = useState<{
    vessels: Vessel[];
    ports: Port[];
  }>({
    vessels: [],
    ports: []
  });

  // Use React Query for refineries to ensure cache invalidation works
  const { data: refineriesData = [], isLoading: refineriesLoading, error: refineriesError } = useQuery<Refinery[]>({
    queryKey: ['/api/refineries'],
    staleTime: 0, // No caching - always fresh data
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
    refetchOnWindowFocus: true, // Refresh when window regains focus
    refetchOnMount: true, // Always refetch when component mounts
  });

  // Use a stable dependency to prevent infinite loops
  const refineriesCount = refineriesData?.length || 0;
  const refineriesStable = useMemo(() => refineriesData, [refineriesCount]);

  useEffect(() => {
    // Function to prepare vessels and ports data when refineries change
    const fetchVesselsAndPorts = async () => {
      if (!refineriesStable?.length) return;
      
      try {
        console.log('Processing vessels and ports for', refineriesStable.length, 'refineries...');
        
        // Generate ports connected to refineries
        const generatedPorts = generateConnectedPorts(refineriesStable);
        
        // Get vessels at each refinery using MarineTraffic service
        // Convert refineries to the format expected by getVesselsForRefinery
        const refineryFormatForAPI = refineriesStable
          .filter(r => r.capacity !== null) // Only process refineries with valid capacity
          .map(r => ({
            name: r.name,
            country: r.country,
            region: r.region,
            lat: parseFloat(r.lat.toString()),
            lng: parseFloat(r.lng.toString()),
            capacity: r.capacity as number, // TypeScript now knows this is not null
            status: r.status || 'active'
          }));
        
        const vesselsPromises = refineryFormatForAPI.map(refinery => getVesselsForRefinery(refinery));
        const vesselsResults = await Promise.all(vesselsPromises);
        const vesselsAtRefineries = vesselsResults.flat();
        
        console.log(`Loaded ${refineriesStable.length} refineries, ${generatedPorts.length} connected ports, and ${vesselsAtRefineries.length} vessels from Marine Traffic`);
        
        // Debug: Show example of the first port
        if (generatedPorts.length > 0) {
          console.log('Example port:', generatedPorts[0]);
          console.log('Port lat/lng type:', typeof generatedPorts[0].lat, typeof generatedPorts[0].lng);
        }
        
        // Debug: Show example of the first refinery
        if (refineriesStable.length > 0) {
          console.log('Example refinery:', refineriesStable[0]);
          console.log('Refinery lat/lng type:', typeof refineriesStable[0].lat, typeof refineriesStable[0].lng);
        }
        
        // Update vessels and ports state
        setVesselsAndPorts({
          vessels: vesselsAtRefineries,
          ports: generatedPorts
        });
        
      } catch (error) {
        console.error('Error preparing vessels and ports data:', error);
        setVesselsAndPorts({
          vessels: [],
          ports: []
        });
      }
    };

    // Fetch vessels and ports when refineries data changes
    fetchVesselsAndPorts();
  }, [refineriesStable]);

  // Return combined data with proper loading states
  return {
    vessels: vesselsAndPorts.vessels,
    refineries: refineriesData,
    ports: vesselsAndPorts.ports,
    stats: null,
    loading: refineriesLoading,
    error: refineriesError ? 'Failed to fetch refineries' : null,
    lastUpdated: new Date()
  };
}