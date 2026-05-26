import { create } from "zustand"

type FilterStatus = "all" | "todo" | "in_progress" | "revision" | "done"
type FilterPriority = "all" | "fire" | "high" | "medium" | "low"

interface TrackerState {
  search:          string
  filterStatus:    FilterStatus
  filterPriority:  FilterPriority
  activeSubjectId: string | null

  setSearch:          (v: string) => void
  setFilterStatus:    (v: FilterStatus) => void
  setFilterPriority:  (v: FilterPriority) => void
  setActiveSubjectId: (v: string) => void
}

export const useTrackerStore = create<TrackerState>()((set) => ({
  search:          "",
  filterStatus:    "all",
  filterPriority:  "all",
  activeSubjectId: null,

  setSearch:          (v) => set({ search: v }),
  setFilterStatus:    (v) => set({ filterStatus: v }),
  setFilterPriority:  (v) => set({ filterPriority: v }),
  setActiveSubjectId: (v) => set({ activeSubjectId: v }),
}))