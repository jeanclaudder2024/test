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
  // Direct refinery query
  const { 
    data: refineries = [], 
    isLoading: refineriesLoading, 
    error: refineriesError 
  } = useQuery<Refinery[]>({
    queryKey: ['/api/refineries'],
    staleTime: 5 * 60 * 1000, // 5 minutes
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

  // Direct ports query
  const { 
    data: ports = [], 
    isLoading: portsLoading, 
    error: portsError 
  } = useQuery<Port[]>({
    queryKey: ['/api/ports'],
    staleTime: 10 * 60 * 1000, // 10 minutes
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