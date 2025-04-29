import { useState, useEffect } from 'react';
import { Vessel, Refinery } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { ACCURATE_REFINERIES, convertToRefineries, generateConnectedPorts } from '@/data/refineryData';
import { getVesselsAtRefineryPorts } from '@/services/asiStreamService';

interface VesselStreamData {
  vessels: Vessel[];
  refineries: Refinery[];
  ports: Vessel[];
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
        
        // Get vessels at each port using AsiStream service
        const vesselsAtPorts = getVesselsAtRefineryPorts(ACCURATE_REFINERIES);
        
        console.log(`Loaded ${refineriesData.length} refineries, ${portsData.length} connected ports, and ${vesselsAtPorts.length} vessels`);
        
        // Update state with the prepared data
        setData({
          vessels: [...portsData, ...vesselsAtPorts],
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
    
    // Set up interval for polling
    const intervalId = setInterval(fetchData, 30000); // Update every 30 seconds
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  return data;
}