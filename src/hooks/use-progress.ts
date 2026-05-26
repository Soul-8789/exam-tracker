import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { ProgressUpsert } from "@/lib/types"

// ─── Query Keys ────────────────────────────────────────
export const keys = {
  chapters:  (subjectId: string) => ["chapters", subjectId] as const,
  progress:  () => ["progress"] as const,
  analytics: () => ["analytics"] as const,
  exams:     () => ["exams"] as const,
}

// ─── Fetchers ──────────────────────────────────────────
const fetchChapters = async (subjectId: string) => {
  const res = await fetch(`/api/chapters?subjectId=${subjectId}`)
  if (!res.ok) throw new Error("Failed to load chapters")
  return res.json()
}

const patchProgress = async (body: ProgressUpsert) => {
  const res = await fetch("/api/progress", {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  })
  if (!res.ok) throw new Error("Failed to update progress")
  return res.json()
}

// ─── Hooks ─────────────────────────────────────────────
export function useChapters(subjectId: string | null) {
  return useQuery({
    queryKey: subjectId ? keys.chapters(subjectId) : ["chapters", "none"],
    queryFn:  () => fetchChapters(subjectId!),
    enabled:  !!subjectId,
  })
}

export function useExams() {
  return useQuery({
    queryKey: keys.exams(),
    queryFn:  async () => {
      const res = await fetch("/api/exams")
      return res.json()
    },
  })
}

export function useUpdateProgress(subjectId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: patchProgress,

    // ── Optimistic update ─────────────────────────────
    // Instantly update the UI before the server responds
    onMutate: async (newData) => {
      // Cancel any in-flight refetches
      await qc.cancelQueries({ queryKey: keys.chapters(subjectId) })

      // Snapshot the current data so we can roll back on error
      const previous = qc.getQueryData(keys.chapters(subjectId))

      // Optimistically patch the cache
      qc.setQueryData(keys.chapters(subjectId), (old: any[]) =>
        old.map((ch) =>
          ch.id === newData.chapterId
            ? {
                ...ch,
                progress: {
                  ...(ch.progress ?? {}),
                  ...newData,
                  updatedAt: new Date().toISOString(),
                },
              }
            : ch
        )
      )

      return { previous }
    },

    // Roll back on error
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous)
        qc.setQueryData(keys.chapters(subjectId), ctx.previous)
    },

    // Refetch after settle to sync with DB
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.chapters(subjectId) })
      qc.invalidateQueries({ queryKey: keys.analytics() })
    },
  })
}