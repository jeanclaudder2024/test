import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Refinery } from "@/types";
import { apiRequest } from "@/lib/queryClient";

export function useRefineries(region?: string) {
  const queryKey = region 
    ? ['/api/refineries', { region }] 
    : ['/api/refineries'];
  
  return useQuery<Refinery[]>({
    queryKey,
  });
}

export function useRefinery(id: number | null) {
  return useQuery<Refinery>({
    queryKey: ['/api/refineries', id],
    enabled: id !== null,
  });
}

export function useCreateRefinery() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<Refinery, 'id'>) => {
      const response = await apiRequest('POST', '/api/refineries', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/refineries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
  });
}

export function useUpdateRefinery() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<Omit<Refinery, 'id'>> }) => {
      const response = await apiRequest('PUT', `/api/refineries/${id}`, data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/refineries', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/refineries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
  });
}
