"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Sun, Moon, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch — only render after mount
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-8 h-8" />

  const THEMES = [
    { value: "light",  icon: Sun,     label: "Light"  },
    { value: "dark",   icon: Moon,    label: "Dark"   },
    { value: "system", icon: Monitor, label: "System" },
  ]

  const current = THEMES.find(t => t.value === theme) ?? THEMES[2]
  const Icon = current.icon

  // Cycle through themes on click
  const cycle = () => {
    const idx  = THEMES.findIndex(t => t.value === theme)
    const next = THEMES[(idx + 1) % THEMES.length]
    setTheme(next.value)
  }

  return (
    <button
      type="button"
      onClick={cycle}
      title={`Theme: ${current.label}`}
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-md",
        "text-muted-foreground hover:text-foreground hover:bg-accent",
        "transition-colors duration-150",
        className
      )}>
      <Icon className="h-4 w-4" />
    </button>
  )
}