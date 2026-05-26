import { cn } from "@/lib/utils"

interface Props {
  score:     number
  maxScore?: number   // default 50 (per section in SSC CGL)
  size?:     "sm" | "md"
}

export function MockScoreBadge({ score, maxScore = 50, size = "sm" }: Props) {
  const pct = (score / maxScore) * 100

  const cls =
    pct >= 80 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
  : pct >= 60 ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
  : pct >= 40 ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
  :              "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"

  return (
    <span className={cn(
      "inline-flex items-center rounded-md font-medium tabular-nums border",
      size === "sm" ? "text-[11px] px-1.5 py-0.5" : "text-sm px-2 py-1",
      cls
    )}>
      {score}/{maxScore}
    </span>
  )
}