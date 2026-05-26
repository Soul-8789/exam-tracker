"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface Props {
  pct:       number         // 0–100
  size?:     number         // svg size in px, default 160
  stroke?:   number         // ring stroke width, default 12
  label?:    string         // sub-label under the %
  className?: string
}

export function CompletionRing({ pct, size = 160, stroke = 12, label, className }: Props) {
  const radius      = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset      = circumference - (pct / 100) * circumference
  const center      = size / 2

  const ringColor =
    pct >= 80 ? "#22c55e"  // emerald-500
  : pct >= 50 ? "#3b82f6"  // blue-500
  : pct >= 25 ? "#f59e0b"  // amber-500
  :              "#ef4444"  // red-500

  const circleRef = useRef<SVGCircleElement>(null)

  // Animate stroke-dashoffset on mount
  useEffect(() => {
    const el = circleRef.current
    if (!el) return
    el.style.transition = "none"
    el.style.strokeDashoffset = String(circumference)
    const raf = requestAnimationFrame(() => {
      el.style.transition = "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)"
      el.style.strokeDashoffset = String(offset)
    })
    return () => cancelAnimationFrame(raf)
  }, [pct])

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative">
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle
            cx={center} cy={center} r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-muted/30"
          />
          {/* Progress */}
          <circle
            ref={circleRef}
            cx={center} cy={center} r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        {/* Centre label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-3xl font-bold tabular-nums leading-none"
            style={{ color: ringColor }}>
            {pct}
          </span>
          <span className="text-xs text-muted-foreground mt-0.5">%</span>
        </div>
      </div>
      {label && <p className="text-xs font-medium text-muted-foreground">{label}</p>}
    </div>
  )
}