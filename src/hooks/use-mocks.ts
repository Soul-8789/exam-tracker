import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { MockUpsert, MockSession } from "@/lib/types"

const MOCK_KEY = ["mocks"] as const

// ── Fetch all mocks ─────────────────────────────────
async function fetchMocks(): Promise<MockSession[]> {
  const res = await fetch("/api/mocks")
  if (!res.ok) throw new Error("Failed to load mocks")
  return res.json()
}

// ── Post new mock ───────────────────────────────────
async function postMock(body: MockUpsert): Promise<MockSession> {
  const res = await fetch("/api/mocks", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  })
  if (!res.ok) throw new Error("Failed to save mock")
  return res.json()
}

// ── Delete mock ─────────────────────────────────────
async function deleteMock(id: string): Promise<void> {
  const res = await fetch(`/api/mocks/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete mock")
}

// ── Hooks ───────────────────────────────────────────
export function useMocks() {
  return useQuery<MockSession[]>({
    queryKey: MOCK_KEY,
    queryFn:  fetchMocks,
  })
}

export function useAddMock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: postMock,
    // Optimistically prepend to the list
    onMutate: async (newMock) => {
      await qc.cancelQueries({ queryKey: MOCK_KEY })
      const previous = qc.getQueryData<MockSession[]>(MOCK_KEY)
      qc.setQueryData<MockSession[]>(MOCK_KEY, (old = []) => [
        {
          id:            "optimistic-" + Date.now(),
          userId:        "me",
          examId:        newMock.examId,
          attemptedOn:   newMock.attemptedOn,
          totalScore:    newMock.totalScore ? String(newMock.totalScore) : null,
          sectionScores: newMock.sectionScores ?? null,
          timeTakenMins: newMock.timeTakenMins ?? null,
          notes:         newMock.notes ?? null,
          createdAt:     new Date(),
        } as MockSession,
        ...old,
      ])
      return { previous }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(MOCK_KEY, ctx.previous)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: MOCK_KEY })
      qc.invalidateQueries({ queryKey: ["analytics"] })
    },
  })
}

export function useDeleteMock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteMock,
    // Optimistically remove from list
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: MOCK_KEY })
      const previous = qc.getQueryData<MockSession[]>(MOCK_KEY)
      qc.setQueryData<MockSession[]>(MOCK_KEY,
        (old = []) => old.filter((m) => m.id !== id)
      )
      return { previous }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(MOCK_KEY, ctx.previous)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: MOCK_KEY })
      qc.invalidateQueries({ queryKey: ["analytics"] })
    },
  })
}