"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Props {
  label:     string
  value:     string | number
  sub?:      string
  icon?:     string
  color?:    "default" | "green" | "blue" | "amber" | "red"
}

const COLOR_MAP = {
  default: "text-foreground",
  green:   "text-emerald-600 dark:text-emerald-400",
  blue:    "text-blue-600 dark:text-blue-400",
  amber:   "text-amber-600 dark:text-amber-400",
  red:     "text-red-600 dark:text-red-400",
}

export function StatCard({ label, value, sub, icon, color = "default" }: Props) {
  return (
    <Card className="border-border/60">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          {icon && <span className="text-lg leading-none">{icon}</span>}
        </div>
        <p className={cn("text-3xl font-bold tabular-nums mt-2 leading-none", COLOR_MAP[color])}>
          {value}
        </p>
        {sub && <p className="text-xs text-muted-foreground mt-1.5">{sub}</p>}
      </CardContent>
    </Card>
  )
}