import { MockModeBadge } from "./mock-mode-badge"

interface HeaderProps {
  currentPage?: "chat" | "pulse" | "datasets" | "about"
}

export function Header({ currentPage = "chat" }: HeaderProps) {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CM</span>
            </div>
            <h1 className="text-xl font-bold">CivicMind</h1>
          </a>
          <MockModeBadge />
        </div>
        <nav className="flex items-center gap-4">
          <a
            href="/"
            className={`text-sm font-medium transition-colors hover:text-foreground ${
              currentPage === "chat" ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Chat
          </a>
          <a
            href="/pulse"
            className={`text-sm font-medium transition-colors hover:text-foreground ${
              currentPage === "pulse" ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Pulse
          </a>
          <a
            href="/datasets"
            className={`text-sm font-medium transition-colors hover:text-foreground ${
              currentPage === "datasets" ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Datasets
          </a>
          <a
            href="/about"
            className={`text-sm font-medium transition-colors hover:text-foreground ${
              currentPage === "about" ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            About
          </a>
        </nav>
      </div>
    </header>
  )
}
