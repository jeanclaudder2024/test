import { useQuery } from '@tanstack/react-query';
import { Refinery, Port } from '@shared/schema';

interface UseMaritimeDataProps {
  region?: string;
}

export function useMaritimeData({ region = 'global' }: UseMaritimeDataProps = {}) {
  // Fetch refineries
  const { 
    data: refineries = [], 
    isLoading: refineriesLoading,
    error: refineriesError
  } = useQuery<Refinery[]>({
    queryKey: ['/api/refineries', region],
    queryFn: async () => {
      const url = region === 'global' 
        ? '/api/refineries' 
        : `/api/refineries?region=${encodeURIComponent(region)}`;
        
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch refineries');
      }
      return response.json();
    }
  });
  
  // Fetch ports
  const { 
    data: ports = [], 
    isLoading: portsLoading,
    error: portsError
  } = useQuery<Port[]>({
    queryKey: ['/api/ports', region],
    queryFn: async () => {
      const url = region === 'global' 
        ? '/api/ports' 
        : `/api/ports?region=${encodeURIComponent(region)}`;
        
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch ports');
      }
      return response.json();
    }
  });
  
  const loading = refineriesLoading || portsLoading;
  const error = refineriesError || portsError;
  
  return {
    refineries,
    ports,
    loading,
    error
  };
}