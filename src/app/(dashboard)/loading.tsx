import { Skeleton } from "@/components/ui/skeleton"

// Next.js App Router automatically shows this while
// any page inside (dashboard) is loading
export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="lg:col-span-2 h-64 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  )
}

// Also create individual page loading files for better UX:
// src/app/(dashboard)/tracker/[examId]/loading.tsx
// src/app/(dashboard)/analytics/loading.tsx
// src/app/(dashboard)/planner/loading.tsx
// src/app/(dashboard)/mocks/loading.tsx
// src/app/(dashboard)/notes/loading.tsx
// — copy same Skeleton pattern, adjust grid to match each page layout