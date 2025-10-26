import { Mic, CheckSquare, Phone, Link2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function MetricsCards() {
  const metrics = [
    {
      icon: Mic,
      value: "8",
      label: "Meetings",
      trend: "+2 this week",
      trendUp: true,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: CheckSquare,
      value: "34",
      label: "Active Tasks",
      trend: "6 due today",
      trendUp: false,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      icon: Phone,
      value: "12",
      label: "Calls Today",
      trend: "Next in 23m",
      trendUp: false,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      icon: Link2,
      value: "89",
      label: "Blockchain Txns",
      trend: "View explorer →",
      trendUp: false,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div
                className={`${metric.bgColor} ${metric.color} w-12 h-12 rounded-full flex items-center justify-center mb-4`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="text-4xl font-bold mb-1">{metric.value}</div>
              <div className="text-sm font-medium text-foreground mb-1">{metric.label}</div>
              <div className="text-xs text-muted-foreground">{metric.trend}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
