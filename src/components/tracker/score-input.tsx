"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface Props {
  value:    number | null
  onChange: (v: number | null) => void
}

function barColor(score: number) {
  if (score >= 80) return "bg-emerald-500"
  if (score >= 60) return "bg-blue-500"
  if (score >= 40) return "bg-amber-500"
  return "bg-red-500"
}

export function ScoreInput({ value, onChange }: Props) {
  const [local, setLocal] = useState(String(value ?? ""))

  const commit = () => {
    const n = parseInt(local)
    if (isNaN(n)) { setLocal(""); onChange(null); return }
    const clamped = Math.min(100, Math.max(0, n))
    setLocal(String(clamped))
    onChange(clamped)
  }

  return (
    <div className="flex flex-col gap-1 w-20">
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={0}
          max={100}
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && commit()}
          placeholder="—"
          className={cn(
            "h-7 w-full rounded-md border border-dashed bg-transparent",
            "px-2 text-center text-xs tabular-nums",
            "focus:outline-none focus:ring-1 focus:ring-ring",
            "placeholder:text-muted-foreground/40"
          )}
        />
        <span className="text-[10px] text-muted-foreground">%</span>
      </div>
      <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500",
            value ? barColor(value) : "bg-transparent"
          )}
          style={{ width: `${value ?? 0}%` }}
        />
      </div>
    </div>
  )
}