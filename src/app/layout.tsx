import { UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileNav } from "@/components/mobile-nav"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/dashboard", label: "Dashboard",  icon: "⊞" },
  { href: "/tracker",   label: "Tracker",    icon: "✓" },
  { href: "/analytics", label: "Analytics",  icon: "↗" },
  { href: "/planner",   label: "Planner",    icon: "◷" },
  { href: "/mocks",     label: "Mock log",   icon: "≡" },
  { href: "/notes",     label: "Notes",      icon: "📝" },
  { href: "/custom",   label: "My Trackers", icon: "✦" },
]

export { NAV }

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">

      {/* ── Desktop sidebar ── hidden on mobile ──────────── */}
      <aside className="hidden md:flex w-52 flex-shrink-0 flex-col border-r
                        border-border/60 bg-muted/20">

        <div className="px-4 py-5 border-b border-border/40">
          <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
            ExamTracker
          </p>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm",
                "text-muted-foreground hover:text-foreground hover:bg-accent",
                "transition-colors duration-100"
              )}>
              <span className="text-base w-4 text-center flex-shrink-0">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-border/40 flex items-center
                        justify-between gap-2">
          <div className="flex items-center gap-2">
            <UserButton />
            <span className="text-xs text-muted-foreground truncate">Account</span>
          </div>
          <ThemeToggle />
        </div>
      </aside>

      {/* ── Main content area ───────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile top bar — visible only on small screens */}
        <div className="md:hidden flex items-center justify-between px-4 py-3
                        border-b border-border/60 bg-background flex-shrink-0">
          <p className="text-sm font-bold tracking-widest uppercase text-muted-foreground">
            ExamTracker
          </p>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserButton  />
            <MobileNav nav={NAV} />
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}