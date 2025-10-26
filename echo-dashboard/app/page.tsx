"use client"

import { useState } from "react"
import { TopBar } from "@/components/top-bar"
import { Sidebar } from "@/components/sidebar"
import { DashboardView } from "@/components/dashboard-view"
import { ProcessMeetingView } from "@/components/process-meeting-view"
import { CallLogsView } from "@/components/call-logs-view"
import { ActiveTasksView } from "@/components/active-tasks-view"

export type View = "dashboard" | "process-meeting" | "call-logs" | "active-tasks" | "team" | "blockchain" | "settings"

export default function Page() {
  const [currentView, setCurrentView] = useState<View>("dashboard")

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <div className="flex">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 ml-60 mt-16 p-8">
          {currentView === "dashboard" && <DashboardView />}
          {currentView === "process-meeting" && <ProcessMeetingView />}
          {currentView === "call-logs" && <CallLogsView />}
          {currentView === "active-tasks" && <ActiveTasksView />}
          {currentView === "team" && <div className="text-muted-foreground">Team view coming soon...</div>}
          {currentView === "blockchain" && (
            <div className="text-muted-foreground">Blockchain explorer coming soon...</div>
          )}
          {currentView === "settings" && <div className="text-muted-foreground">Settings coming soon...</div>}
        </main>
      </div>
    </div>
  )
}
