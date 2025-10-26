"use client"

import { LayoutDashboard, Mic, CheckSquare, Phone, Users, Link2, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { View } from "@/app/page"

interface SidebarProps {
  currentView: View
  onViewChange: (view: View) => void
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const navItems = [
    { id: "dashboard" as View, icon: LayoutDashboard, label: "Dashboard", badge: null },
    { id: "process-meeting" as View, icon: Mic, label: "Process Meeting", badge: null },
    { id: "active-tasks" as View, icon: CheckSquare, label: "Active Tasks", badge: "12" },
    { id: "call-logs" as View, icon: Phone, label: "Call Logs", badge: "3 new" },
    { id: "team" as View, icon: Users, label: "Team", badge: null },
    { id: "blockchain" as View, icon: Link2, label: "Blockchain", badge: null },
    { id: "settings" as View, icon: Settings, label: "Settings", badge: null },
  ]

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-60 bg-sidebar border-r border-sidebar-border">
      <nav className="p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive ? "bg-primary text-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge variant={isActive ? "secondary" : "destructive"} className="text-xs">
                  {item.badge}
                </Badge>
              )}
            </button>
          )
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-3 space-y-3">
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="text-xs font-medium text-muted-foreground mb-1">Inbound Number</div>
          <div className="text-sm font-semibold mb-2">1-844-ECHO-AI</div>
          <Button variant="outline" size="sm" className="w-full text-xs bg-transparent">
            Copy
          </Button>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse-dot" />
            <span className="text-sm font-medium">Echo Status: Active</span>
          </div>
          <div className="text-xs text-muted-foreground">Next call in 23 min</div>
        </div>
      </div>
    </aside>
  )
}
