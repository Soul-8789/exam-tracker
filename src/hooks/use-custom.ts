import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

const CUSTOM_KEY = ["custom-exams"] as const

// ── Fetch full tree ──────────────────────────────────
export function useCustomExams() {
  return useQuery({
    queryKey: CUSTOM_KEY,
    queryFn:  async () => {
      const r = await fetch("/api/custom")
      if (!r.ok) throw new Error("fetch failed")
      return r.json()
    },
  })
}

// ── Generic POST helper ──────────────────────────────
async function postCustom(body: Record<string, unknown>) {
  const r = await fetch("/api/custom", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

// ── Create exam ──────────────────────────────────────
export function useCreateExam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; examDate?: string }) =>
      postCustom({ type: "exam", ...data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: CUSTOM_KEY }),
  })
}

// ── Create subject ───────────────────────────────────
export function useCreateSubject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      examId: string; name: string
      subjectData?: { totalMarks?: number; sectionTimeMins?: number }
    }) => postCustom({ type: "subject", ...data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: CUSTOM_KEY }),
  })
}

// ── Create chapter ───────────────────────────────────
export function useCreateChapter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      subjectId: string; name: string
      pageRange?: string; priority?: string
      expectedQs?: number; section?: string
    }) => {
      const r = await fetch("/api/custom/chapters", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!r.ok) throw new Error(await r.text())
      return r.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CUSTOM_KEY }),
  })
}

// ── Edit chapter ─────────────────────────────────────
export function useEditChapter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { id: string; [k: string]: unknown }) => {
      const r = await fetch("/api/custom/chapters", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!r.ok) throw new Error(await r.text())
      return r.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CUSTOM_KEY }),
  })
}

// ── Delete any (exam | subject | chapter) ────────────
export function useDeleteCustom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, type }: { id: string; type: string }) => {
      const r = await fetch(`/api/custom/${id}?type=${type}`, { method: "DELETE" })
      if (!r.ok) throw new Error(await r.text())
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CUSTOM_KEY })
      qc.invalidateQueries({ queryKey: ["exams"] })
    },
  })
}