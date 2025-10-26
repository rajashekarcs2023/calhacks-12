import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Shield, Zap, Users, Database } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header currentPage="about" />

      {/* Main content */}
      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-balance">Talk to Your City</h2>
            <p className="text-xl text-muted-foreground text-balance">
              CivicMind makes civic data accessible through natural language conversations
            </p>
          </div>

          {/* Features */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <CardTitle>Natural Language Queries</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Ask questions in plain English about 311 requests, budgets, events, and more. No SQL knowledge
                  required.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>Secure & Safe</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  All queries are validated and parameterized. Row Level Security ensures data access is controlled and
                  auditable.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle>Citizen Engagement</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Submit feedback, track sentiment trends, and see how your city is responding to citizen concerns in
                  real-time.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  <CardTitle>Open Data</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Built on open civic data standards. All datasets are documented and accessible through standard APIs.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Vision */}
          <Card>
            <CardHeader>
              <CardTitle>Our Vision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                CivicMind reimagines how citizens interact with their local government. By making civic data accessible
                through natural conversation, we empower residents to understand city operations, track service
                delivery, and participate meaningfully in local governance.
              </p>
              <p>
                Traditional civic data portals require technical expertise and domain knowledge. CivicMind removes these
                barriers, allowing anyone to ask questions and get instant, visual answers backed by real data.
              </p>
              <p>
                This platform demonstrates the potential of combining modern AI with open government data to create more
                transparent, responsive, and participatory cities.
              </p>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle>Privacy & Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>Public Data:</strong> All civic data (311 requests, budgets, events) is public information.
              </p>
              <p>
                <strong>Feedback:</strong> Citizen feedback is stored with optional district information. No personally
                identifiable information is collected.
              </p>
              <p>
                <strong>Mock Mode:</strong> When external APIs are not configured, the system uses realistic mock data
                to demonstrate functionality.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
