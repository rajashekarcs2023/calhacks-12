import { MetricsCards } from "@/components/metrics-cards"
import { ActivityFeed } from "@/components/activity-feed"
import { UpcomingCalls } from "@/components/upcoming-calls"

export function DashboardView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Monitor Echo's autonomous work across your team</p>
      </div>

      <MetricsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
        <div>
          <UpcomingCalls />
        </div>
      </div>
    </div>
  )
}
