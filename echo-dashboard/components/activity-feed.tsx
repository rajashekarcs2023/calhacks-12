import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Phone, Mic, Headphones } from "lucide-react"

export function ActivityFeed() {
  const activities = [
    {
      type: "call",
      icon: Phone,
      avatar: "/placeholder.svg?height=40&width=40",
      avatarFallback: "AI",
      title: "Call Completed",
      time: "2m ago",
      description: 'Called Sarah Chen about "Login Bug Fix"',
      update: 'Update: "Testing complete, ready for review"',
      actions: [
        '✓ Github issue #234 → "Ready for Review"',
        "✓ Slack #engineering → Posted update",
        "✓ Notion roadmap → Status changed",
        "✓ XRPL logged → 0x7B3F...A92E",
      ],
      borderColor: "border-l-success",
    },
    {
      type: "inbound",
      icon: Phone,
      avatar: "/placeholder.svg?height=40&width=40",
      avatarFallback: "MR",
      title: "Inbound Call",
      time: "15m ago",
      description: "Mike Rodriguez called to report:",
      update: '✅ "Completed API integration with Stripe"',
      actions: ["✓ Closed Github issue #189", "✓ Updated project timeline in Notion", "✓ Notified team in Slack"],
      borderColor: "border-l-primary",
    },
    {
      type: "meeting",
      icon: Mic,
      avatar: "/placeholder.svg?height=40&width=40",
      avatarFallback: "MT",
      title: "Meeting Processed",
      time: "1h ago",
      description: '"Sprint Planning - Oct 26"',
      update: null,
      actions: [
        "• 8 Github issues across 3 repos",
        "• 4 calendar events scheduled",
        "• Updated 2 Notion docs",
        "• Posted summary to #general",
        "• 12 blockchain transactions",
      ],
      borderColor: "border-l-warning",
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-destructive animate-pulse-dot" />
          <h2 className="text-xl font-semibold">Live Activity</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Filter ▾
          </Button>
          <Button variant="outline" size="sm">
            Refresh ↻
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {activities.map((activity, index) => {
          const Icon = activity.icon
          return (
            <Card key={index} className={`border-l-4 ${activity.borderColor} animate-slide-in`}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={activity.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{activity.avatarFallback}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="font-semibold">{activity.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                    <p className="text-sm">{activity.description}</p>
                    {activity.update && <p className="text-sm font-medium">{activity.update}</p>}
                    <div className="space-y-1">
                      {activity.actions.map((action, i) => (
                        <div key={i} className="text-xs text-muted-foreground">
                          {action}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                        <Headphones className="h-3 w-3" />
                        Listen to Call
                      </Button>
                      <Button variant="ghost" size="sm">
                        View Details →
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
