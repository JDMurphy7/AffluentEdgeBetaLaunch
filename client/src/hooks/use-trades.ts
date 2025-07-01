import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Trade } from "@/lib/types";

export function useTrades(userId: number, limit?: number) {
  return useQuery({
    queryKey: [`/api/trades/${userId}`, limit],
    queryFn: async () => {
      const url = `/api/trades/${userId}${limit ? `?limit=${limit}` : ''}`;
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch trades');
      return response.json() as Promise<Trade[]>;
    },
  });
}

export function useCreateTrade() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (tradeData: any) => {
      const response = await apiRequest('POST', '/api/trades', tradeData);
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/trades/${variables.userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/portfolio/${variables.userId}/metrics`] });
    },
  });
}

export function useUpdateTrade() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates, userId }: { id: number; updates: Partial<Trade>; userId: number }) => {
      const response = await apiRequest('PUT', `/api/trades/${id}`, updates);
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/trades/${variables.userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/portfolio/${variables.userId}/metrics`] });
    },
  });
}
