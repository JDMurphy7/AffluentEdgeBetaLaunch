import { useQuery } from "@tanstack/react-query";
import type { PortfolioMetrics, PortfolioSnapshot } from "../lib/types.js";

export function usePortfolioMetrics(userId: number) {
  return useQuery({
    queryKey: [`/api/portfolio/metrics`],
    queryFn: async () => {
      const response = await fetch(`/api/portfolio/metrics`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch portfolio metrics');
      return response.json() as Promise<PortfolioMetrics>;
    },
  });
}

export function usePortfolioSnapshots(userId: number, limit?: number) {
  return useQuery({
    queryKey: [`/api/portfolio/snapshots`, limit],
    queryFn: async () => {
      const url = `/api/portfolio/snapshots${limit ? `?limit=${limit}` : ''}`;
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch portfolio snapshots');
      return response.json() as Promise<PortfolioSnapshot[]>;
    },
  });
}
