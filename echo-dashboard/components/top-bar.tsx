import { Search, Bell, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function TopBar() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              <div className="w-1 h-6 bg-primary rounded-full animate-wave" style={{ animationDelay: "0s" }} />
              <div className="w-1 h-6 bg-primary rounded-full animate-wave" style={{ animationDelay: "0.1s" }} />
              <div className="w-1 h-6 bg-primary rounded-full animate-wave" style={{ animationDelay: "0.2s" }} />
            </div>
            <span className="text-xl font-semibold tracking-tight">Echo</span>
          </div>
          <Button variant="ghost" size="sm" className="text-sm">
            Acme Corp Team
            <span className="ml-1">▾</span>
          </Button>
        </div>

        {/* Center Section */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search meetings, tasks, calls... ⌘K"
              className="pl-10 rounded-full bg-muted/50 border-0"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Phone className="h-4 w-4" />
            Call Echo
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-[10px]">
              3
            </Badge>
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
