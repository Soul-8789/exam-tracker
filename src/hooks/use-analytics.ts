import { useQuery } from "@tanstack/react-query"
import type { Analytics } from "@/lib/types"

async function fetchAnalytics(): Promise<Analytics> {
  const res = await fetch("/api/analytics")
  if (!res.ok) throw new Error("Failed to load analytics")
  return res.json()
}

export function useAnalytics() {
  return useQuery<Analytics>({
    queryKey: ["analytics"],
    queryFn:  fetchAnalytics,
    // Refetch every 30s so the dashboard stays live as user
    // updates chapters in another tab
    refetchInterval: 30_000,
    staleTime:       10_000,
  })
}