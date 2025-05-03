import { useState, useEffect } from 'react';
import { Vessel, Refinery, Port } from '@shared/schema';
import axios from 'axios';

interface UseMaritimeDataProps {
  region?: string;
  includeVessels?: boolean;
  includeRefineries?: boolean;
  includePorts?: boolean;
  includeConnections?: boolean;
  pollingInterval?: number; // Polling interval in milliseconds
}

interface MaritimeData {
  vessels: Vessel[];
  refineries: Refinery[];
  ports: Port[];
  connections: any[]; // Refinery-port connections
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshData: () => Promise<void>;
}

/**
 * Hook to fetch maritime data including vessels, refineries, and ports
 * with connections between them
 */
export function useMaritimeData({
  region = 'global',
  includeVessels = true,
  includeRefineries = true,
  includePorts = true,
  includeConnections = true,
  pollingInterval = 60000, // Default to 1 minute
}: UseMaritimeDataProps = {}): MaritimeData {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [refineries, setRefineries] = useState<Refinery[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Parallel API calls for better performance
      const apiCalls = [];
      
      // Only fetch what's needed based on props
      if (includeVessels) {
        apiCalls.push(axios.get(`/api/vessels${region !== 'global' ? `?region=${region}` : ''}`));
      } else {
        apiCalls.push(Promise.resolve({ data: [] }));
      }
      
      if (includeRefineries) {
        apiCalls.push(axios.get(`/api/refineries${region !== 'global' ? `?region=${region}` : ''}`));
      } else {
        apiCalls.push(Promise.resolve({ data: [] }));
      }
      
      if (includePorts) {
        apiCalls.push(axios.get(`/api/ports${region !== 'global' ? `?region=${region}` : ''}`));
      } else {
        apiCalls.push(Promise.resolve({ data: [] }));
      }
      
      if (includeConnections && includeRefineries && includePorts) {
        apiCalls.push(axios.get('/api/refinery-port/connections'));
      } else {
        apiCalls.push(Promise.resolve({ data: [] }));
      }
      
      const [vesselsRes, refineriesRes, portsRes, connectionsRes] = await Promise.all(apiCalls);
      
      setVessels(vesselsRes.data);
      setRefineries(refineriesRes.data);
      setPorts(portsRes.data);
      setConnections(connectionsRes.data);
      setLastUpdated(new Date());
      
      console.log(`Loaded ${vesselsRes.data.length} vessels, ${refineriesRes.data.length} refineries, ${portsRes.data.length} ports, and ${connectionsRes.data.length} connections`);
    } catch (err) {
      console.error('Error fetching maritime data:', err);
      setError('Failed to fetch maritime data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
    
    // Set up polling interval
    const intervalId = setInterval(fetchData, pollingInterval);
    
    // Clean up interval
    return () => clearInterval(intervalId);
  }, [region, includeVessels, includeRefineries, includePorts, includeConnections, pollingInterval]);

  return {
    vessels,
    refineries,
    ports,
    connections,
    isLoading,
    error,
    lastUpdated,
    refreshData: fetchData
  };
}