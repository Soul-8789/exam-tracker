import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export function weekKey(date: Date) {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1))
  return d.toISOString().slice(0, 10)
}

export function usePlannerWeek(weekStart: string) {
  return useQuery({
    queryKey: ["planner", weekStart],
    queryFn:  async () => {
      const r = await fetch(`/api/planner?weekStart=${weekStart}`)
      if (!r.ok) throw new Error("fetch failed")
      return r.json()
    },
    staleTime: 30_000,
  })
}

export function useCreateSession(weekStart: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const r = await fetch("/api/planner", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "session", ...body }),
      })
      if (!r.ok) throw new Error(await r.text())
      return r.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["planner", weekStart] }),
  })
}

export function useToggleSession(weekStart: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, isCompleted }: { id: string; isCompleted: boolean }) => {
      const r = await fetch("/api/planner", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isCompleted }),
      })
      return r.json()
    },
    // Optimistic toggle
    onMutate: async ({ id, isCompleted }) => {
      await qc.cancelQueries({ queryKey: ["planner", weekStart] })
      const prev = qc.getQueryData(["planner", weekStart])
      qc.setQueryData(["planner", weekStart], (old: any) => ({
        ...old,
        sessions: old?.sessions.map((s: any) =>
          s.id === id ? { ...s, isCompleted } : s
        ),
      }))
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["planner", weekStart], ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["planner", weekStart] }),
  })
}

export function useDeleteSession(weekStart: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/planner?id=${id}`, { method: "DELETE" })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["planner", weekStart] }),
  })
}

export function useSaveGoals() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const r = await fetch("/api/planner", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "goals", ...body }),
      })
      return r.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["planner"] }),
  })
}

export function useSmartSchedule() {
  return useMutation({
    mutationFn: async (body: { days?: number; subjectId?: string }) => {
      const r = await fetch("/api/planner/smart", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!r.ok) throw new Error("Failed to generate schedule")
      return r.json()
    },
  })
}