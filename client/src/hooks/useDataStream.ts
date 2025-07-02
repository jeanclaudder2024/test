import { useQuery } from '@tanstack/react-query';
import { type Vessel, type Refinery, type Port } from '@shared/schema';

interface StreamData {
  vessels: Vessel[];
  refineries: Refinery[];
  ports: Port[];
  stats: any | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Clean data stream hook - direct API calls without complex chaining
 */
export function useDataStream(): StreamData {
  // Direct refinery query - using public endpoint (no auth required)
  const { 
    data: refineries = [], 
    isLoading: refineriesLoading, 
    error: refineriesError 
  } = useQuery<Refinery[]>({
    queryKey: ['/api/refineries'],
    staleTime: 0, // No caching for immediate fresh data
    refetchOnWindowFocus: false,
  });

  // Direct vessels query
  const { 
    data: vessels = [], 
    isLoading: vesselsLoading, 
    error: vesselsError 
  } = useQuery<Vessel[]>({
    queryKey: ['/api/vessels'],
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });

  // Direct ports query - using admin endpoint for consistency
  const { 
    data: ports = [], 
    isLoading: portsLoading, 
    error: portsError 
  } = useQuery<Port[]>({
    queryKey: ['/api/admin/ports'],
    staleTime: 0, // No caching for immediate fresh data
    refetchOnWindowFocus: false,
  });

  const loading = refineriesLoading || vesselsLoading || portsLoading;
  const error = refineriesError || vesselsError || portsError;

  return {
    vessels,
    refineries,
    ports,
    stats: null,
    loading,
    error: error ? 'Failed to load data' : null,
    lastUpdated: new Date()
  };
}