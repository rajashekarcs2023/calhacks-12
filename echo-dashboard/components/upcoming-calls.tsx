import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock } from "lucide-react"

export function UpcomingCalls() {
  const calls = [
    {
      name: "Sarah Chen",
      task: "Login Bug Fix",
      status: "In Progress",
      lastUpdate: "2 days ago",
      time: "Next call in 23 minutes",
      urgent: true,
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "SC",
    },
    {
      name: "Alex Kumar",
      task: "API Documentation",
      status: "Pending",
      lastUpdate: "1 day ago",
      time: "In 2 hours",
      urgent: false,
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "AK",
    },
    {
      name: "Maria Garcia",
      task: "Design Review",
      status: "Scheduled",
      lastUpdate: "Today",
      time: "Tomorrow at 10am",
      urgent: false,
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "MG",
    },
  ]

  const teamStatus = [
    { status: "Online", count: 3, names: "Sarah, Mike, Alex", color: "bg-success" },
    { status: "Away", count: 2, names: "Maria, John", color: "bg-warning" },
    { status: "Offline", count: 1, names: "David", color: "bg-muted" },
  ]

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Calls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {calls.map((call, index) => (
            <div key={index} className="space-y-3">
              {index === 0 && (
                <div className="flex items-center gap-2 text-sm font-medium text-warning">
                  <Clock className="h-4 w-4" />
                  {call.time}
                </div>
              )}
              <div className="flex gap-3">
                <Avatar>
                  <AvatarImage src={call.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{call.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="font-medium">{call.name}</div>
                  <div className="text-sm text-muted-foreground">{call.task}</div>
                  <div className="text-xs text-muted-foreground">
                    Status: {call.status} • {call.lastUpdate}
                  </div>
                  {index === 0 ? (
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" variant="outline" className="text-xs bg-transparent">
                        Skip Call
                      </Button>
                      <Button size="sm" className="text-xs">
                        Call Now
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-1">
                      <div className="text-xs text-muted-foreground">{call.time}</div>
                      {index === 1 && (
                        <Button size="sm" variant="ghost" className="text-xs px-0">
                          Reschedule
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {index < calls.length - 1 && <div className="border-t" />}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Team Availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {teamStatus.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className={`h-2 w-2 rounded-full ${item.color} mt-1.5`} />
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {item.status} ({item.count})
                </div>
                <div className="text-xs text-muted-foreground">{item.names}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button className="w-full justify-start bg-transparent" variant="outline">
            + Process New Meeting
          </Button>
          <Button className="w-full justify-start bg-transparent" variant="outline">
            📞 Call Echo Now
          </Button>
          <Button className="w-full justify-start bg-transparent" variant="outline">
            View All Tasks
          </Button>
          <Button className="w-full justify-start bg-transparent" variant="outline">
            Blockchain Explorer
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
