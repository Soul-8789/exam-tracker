"use client"

import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export type Status = "todo" | "in_progress" | "revision" | "done"

const OPTIONS: { value: Status; label: string; color: string }[] = [
  { value: "todo",        label: "📋 To-do",      color: "text-muted-foreground"             },
  { value: "in_progress", label: "📖 In progress", color: "text-blue-600 dark:text-blue-400"    },
  { value: "revision",    label: "🔁 Revision",    color: "text-violet-600 dark:text-violet-400" },
  { value: "done",        label: "✅ Done",        color: "text-emerald-600 dark:text-emerald-400" },
]

interface Props {
  value:    Status
  onChange: (v: Status) => void
  disabled?: boolean
}

export function StatusSelect({ value, onChange, disabled }: Props) {
  const current = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0]

  return (
    <Select value={value} onValueChange={(v) => onChange(v as Status)} disabled={disabled}>
      <SelectTrigger
        className={cn(
          "h-8 w-36 text-xs border-dashed",
          current.color
        )}>
        <SelectValue>{current.label}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((o) => (
          <SelectItem
            key={o.value}
            value={o.value}
            className={cn("text-xs cursor-pointer", o.color)}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}