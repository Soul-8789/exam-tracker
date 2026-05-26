import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

interface NotesFilter { chapterId?: string; tag?: string; search?: string }
interface ResFilter   { chapterId?: string; type?: string; search?: string }

function toQS(obj: Record<string, string | undefined>) {
  const p = new URLSearchParams()
  Object.entries(obj).forEach(([k, v]) => v && p.set(k, v))
  const s = p.toString(); return s ? `?${s}` : ""
}

// ── Notes ────────────────────────────────────────────────────────
export function useNotes(filter: NotesFilter = {}) {
  return useQuery({
    queryKey: ["notes", filter],
    queryFn:  async () => {
      const r = await fetch(`/api/notes${toQS(filter)}`)
      if (!r.ok) throw new Error("fetch failed")
      return r.json()
    },
  })
}

export function useCreateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const r = await fetch("/api/notes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!r.ok) throw new Error(await r.text())
      return r.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  })
}

export function useUpdateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string; [k: string]: unknown }) => {
      const r = await fetch(`/api/notes/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      return r.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  })
}

export function useDeleteNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/notes/${id}`, { method: "DELETE" })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  })
}

// ── Resources ─────────────────────────────────────────────────────
export function useResources(filter: ResFilter = {}) {
  return useQuery({
    queryKey: ["resources", filter],
    queryFn:  async () => {
      const r = await fetch(`/api/resources${toQS(filter)}`)
      if (!r.ok) throw new Error("fetch failed")
      return r.json()
    },
  })
}

export function useCreateResource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const r = await fetch("/api/resources", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!r.ok) throw new Error(await r.text())
      return r.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resources"] }),
  })
}

export function useDeleteResource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/resources?id=${id}`, { method: "DELETE" })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resources"] }),
  })
}