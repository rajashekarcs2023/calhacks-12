import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Database, Table, FileText } from "lucide-react"

const datasets = [
  {
    name: "requests_311",
    description: "Citizen service requests and complaints",
    icon: Table,
    rowCount: "~50 rows",
    columns: ["id", "created_at", "status", "type", "district", "lat", "lng"],
  },
  {
    name: "budget",
    description: "City budget allocations by department",
    icon: FileText,
    rowCount: "~20 rows",
    columns: ["id", "fiscal_year", "department", "amount_usd"],
  },
  {
    name: "events",
    description: "Public meetings, hearings, and city events",
    icon: Table,
    rowCount: "~30 rows",
    columns: ["id", "date", "title", "category", "district"],
  },
  {
    name: "citizen_feedback",
    description: "Citizen feedback with sentiment analysis",
    icon: FileText,
    rowCount: "~40 rows",
    columns: ["id", "created_at", "text", "district", "sentiment", "score"],
  },
]

export default function DatasetsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header currentPage="datasets" />

      {/* Main content */}
      <main className="flex-1 container py-8">
        <div className="space-y-8">
          {/* Page header */}
          <div>
            <h2 className="text-3xl font-bold text-balance">Datasets</h2>
            <p className="text-muted-foreground mt-2">Explore the civic data powering CivicMind</p>
          </div>

          {/* Dataset cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {datasets.map((dataset) => {
              const Icon = dataset.icon
              return (
                <Card key={dataset.name}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <CardTitle>{dataset.name}</CardTitle>
                    </div>
                    <CardDescription>{dataset.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Rows</span>
                      <span className="font-medium">{dataset.rowCount}</span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Columns</p>
                      <div className="flex flex-wrap gap-1">
                        {dataset.columns.map((col) => (
                          <span
                            key={col}
                            className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium"
                          >
                            {col}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Info card */}
          <Card className="border-primary/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <CardTitle>Data Access</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>All datasets are stored in Supabase (PostgreSQL) with Row Level Security enabled.</p>
              <p>
                Query data through the chat interface using natural language, or access via the Supabase API with proper
                authentication.
              </p>
              <p className="text-xs mt-4">
                Note: This is demo data. In production, data would be updated in real-time from city systems.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
