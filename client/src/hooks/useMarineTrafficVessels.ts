import { useQuery } from '@tanstack/react-query';
import { Vessel } from '@shared/schema';
import { RefineryData } from '@/data/refineryData';
import { getVesselsForRefinery } from '@/services/marineTrafficService';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to fetch or generate vessels near a refinery
 * This hook uses the Marine Traffic API when available,
 * and falls back to generated data when API is not available or fails
 */
export function useMarineTrafficVessels(refinery: RefineryData | null) {
  const { toast } = useToast();
  
  return useQuery<Vessel[]>({
    queryKey: ['vessels', 'marine-traffic', refinery?.name],
    enabled: !!refinery,
    queryFn: async () => {
      if (!refinery) return [];
      
      try {
        const vessels = await getVesselsForRefinery(refinery);
        return vessels;
      } catch (error) {
        console.error('Error in useMarineTrafficVessels:', error);
        toast({
          title: 'Error fetching vessels',
          description: 'Could not fetch vessels from Marine Traffic API',
          variant: 'destructive',
        });
        return [];
      }
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // 5 minutes
  });
}