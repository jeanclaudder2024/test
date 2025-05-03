import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Vessel, ProgressEvent } from "@/types";
import { apiRequest } from "@/lib/queryClient";

export function useVessels(region?: string) {
  const queryKey = region 
    ? ['/api/vessels', { region }] 
    : ['/api/vessels'];
  
  return useQuery<Vessel[]>({
    queryKey,
  });
}

export function useVessel(id: number | null) {
  return useQuery<Vessel>({
    queryKey: ['/api/vessels', id],
    enabled: id !== null,
  });
}

export function useVesselProgressEvents(vesselId: number | null) {
  return useQuery<ProgressEvent[]>({
    queryKey: ['/api/vessels', vesselId, 'progress'],
    enabled: vesselId !== null,
  });
}

export function useAddProgressEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { vesselId: number, event: string, date: Date, location?: string, lat?: number, lng?: number }) => {
      const response = await apiRequest('POST', `/api/vessels/${data.vesselId}/progress`, data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/vessels', variables.vesselId, 'progress'] });
    },
  });
}

export function useCreateVessel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<Vessel, 'id'>) => {
      const response = await apiRequest('POST', '/api/vessels', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vessels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
  });
}

export function useUpdateVessel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<Omit<Vessel, 'id'>> }) => {
      const response = await apiRequest('PUT', `/api/vessels/${id}`, data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/vessels', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/vessels'] });
    },
  });
}
