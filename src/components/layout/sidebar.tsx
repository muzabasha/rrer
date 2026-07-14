"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Award,
  Rocket,
  GraduationCap,
  BarChart3,
  LineChart,
  FileText,
  Search,
  Settings,
  Bot,
} from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Faculty", href: "/faculty", icon: Users },
  { name: "Clusters", href: "/clusters", icon: BarChart3 },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Consultancy", href: "/consultancy", icon: LineChart },
  { name: "Patents", href: "/patents", icon: Award },
  { name: "NEST", href: "/nest", icon: Rocket },
  { name: "PhD Scholars", href: "/phd", icon: GraduationCap },
  { name: "Students", href: "/students", icon: Users },
  { name: "KPI", href: "/kpi", icon: BarChart3 },
  { name: "Executive", href: "/executive", icon: LineChart },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Search", href: "/search", icon: Search },
  { name: "AI Assistant", href: "/ai-assistant", icon: Bot },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 flex-col border-r bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="text-lg font-bold">
          REVA Research
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-3">
        <ThemeToggle />
      </div>
    </aside>
  )
}
