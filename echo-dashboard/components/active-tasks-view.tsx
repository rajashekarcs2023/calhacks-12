import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ActiveTasksView() {
  const columns = [
    {
      title: "TO DO",
      count: 12,
      color: "text-destructive",
      tasks: [
        {
          id: 234,
          title: "Login bug",
          assignee: "Sarah",
          initials: "SC",
          due: "Oct 28",
          priority: "High",
          callIn: "2d",
        },
        {
          id: 235,
          title: "Rate limit",
          assignee: "Mike",
          initials: "MR",
          due: "Oct 30",
          priority: "Medium",
          callIn: "4d",
        },
        {
          id: 236,
          title: "Mobile crash",
          assignee: "Alex",
          initials: "AK",
          due: "Nov 2",
          priority: "High",
          callIn: "7d",
        },
      ],
    },
    {
      title: "IN PROGRESS",
      count: 8,
      color: "text-warning",
      tasks: [
        {
          id: 189,
          title: "API docs",
          assignee: "Mike",
          initials: "MR",
          due: "Oct 30",
          priority: "Medium",
          called: "1h",
        },
        {
          id: 198,
          title: "Mobile crash",
          assignee: "David",
          initials: "DL",
          due: "Nov 1",
          priority: "High",
          called: "3h",
        },
        { id: 201, title: "UI polish", assignee: "Maria", initials: "MG", due: "Nov 3", priority: "Low", called: "1d" },
      ],
    },
    {
      title: "REVIEW",
      count: 14,
      color: "text-success",
      tasks: [
        {
          id: 156,
          title: "New dashboard",
          assignee: "Alex",
          initials: "AK",
          due: "Done",
          priority: "Low",
          status: "Complete",
        },
        {
          id: 167,
          title: "Auth timeout",
          assignee: "Sarah",
          initials: "SC",
          due: "Done",
          priority: "Medium",
          status: "Complete",
        },
        {
          id: 178,
          title: "Payment flow",
          assignee: "Mike",
          initials: "MR",
          due: "Done",
          priority: "High",
          status: "Complete",
        },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Active Tasks</h1>
          <p className="text-muted-foreground">Track all tasks across your team</p>
        </div>
        <div className="flex gap-2">
          <Button variant="default" size="sm">
            All
          </Button>
          <Button variant="outline" size="sm">
            High Priority
          </Button>
          <Button variant="outline" size="sm">
            Due Today
          </Button>
          <Button variant="outline" size="sm">
            Overdue
          </Button>
          <Button variant="outline" size="sm">
            By Person ▾
          </Button>
          <Button variant="outline" size="sm">
            By Project ▾
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((column, colIndex) => (
          <div key={colIndex} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${column.color.replace("text-", "bg-")}`} />
              <h3 className="font-semibold">
                {column.title} ({column.count})
              </h3>
            </div>
            <div className="space-y-3">
              {column.tasks.map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">🐛 #{task.id}</div>
                        <div className="text-sm text-muted-foreground">{task.title}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="/placeholder.svg?height=24&width=24" />
                        <AvatarFallback className="text-xs">{task.initials}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{task.assignee}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">📅 {task.due}</span>
                      <Badge
                        variant={
                          task.priority === "High"
                            ? "destructive"
                            : task.priority === "Medium"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-xs"
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    {task.callIn && <div className="text-xs text-muted-foreground">📞 Call in {task.callIn}</div>}
                    {task.called && <div className="text-xs text-success">✅ Called {task.called} ago</div>}
                    {task.status && <div className="text-xs text-success">✅ {task.status}</div>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
