import { useState, useEffect } from 'react';
import { Vessel, Refinery, Port } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { ACCURATE_REFINERIES, convertToRefineries, generateConnectedPorts } from '@/data/refineryData';
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
 * Hook to handle vessel and refinery data using hardcoded refinery locations
 * and AsiStream service for vessels at ports
 */
export function useVesselStream() {
  const [data, setData] = useState<VesselStreamData>({
    vessels: [],
    refineries: [],
    ports: [],
    stats: null,
    loading: true,
    error: null,
    lastUpdated: null
  });

  useEffect(() => {
    // Function to prepare data from static sources
    const fetchData = async () => {
      try {
        console.log('Fetching vessel and refinery data...');
        
        // Convert static refinery data to app format
        const refineriesData = convertToRefineries(ACCURATE_REFINERIES);
        
        // Generate ports connected to refineries
        const portsData = generateConnectedPorts(refineriesData);
        
        // Get vessels at each refinery using MarineTraffic service
        const vesselsPromises = ACCURATE_REFINERIES.map(refinery => getVesselsForRefinery(refinery));
        const vesselsResults = await Promise.all(vesselsPromises);
        const vesselsAtRefineries = vesselsResults.flat();
        
        console.log(`Loaded ${refineriesData.length} refineries, ${portsData.length} connected ports, and ${vesselsAtRefineries.length} vessels from Marine Traffic`);
        
        // Debug: Show example of the first port
        if (portsData.length > 0) {
          console.log('Example port:', portsData[0]);
          console.log('Port lat/lng type:', typeof portsData[0].lat, typeof portsData[0].lng);
        }
        
        // Debug: Show example of the first refinery
        if (refineriesData.length > 0) {
          console.log('Example refinery:', refineriesData[0]);
          console.log('Refinery lat/lng type:', typeof refineriesData[0].lat, typeof refineriesData[0].lng);
        }
        
        // Update state with the prepared data
        setData({
          vessels: vesselsAtRefineries, // Don't add ports to vessels array anymore
          refineries: refineriesData,
          ports: portsData,
          stats: null, 
          loading: false,
          error: null,
          lastUpdated: new Date()
        });
      } catch (error) {
        console.error('Error preparing data:', error);
        setData(prev => ({
          ...prev,
          error: 'Failed to prepare vessel and refinery data',
          loading: false
        }));
      }
    };

    // Initial fetch
    fetchData();
    
    // Set up interval for polling with a longer delay
    const intervalId = setInterval(fetchData, 5 * 60 * 1000); // Update every 5 minutes
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  return data;
}