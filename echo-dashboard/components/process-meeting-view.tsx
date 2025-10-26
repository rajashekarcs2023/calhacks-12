"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileAudio, CheckCircle2, Github } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function ProcessMeetingView() {
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "complete">("idle")
  const [progress, setProgress] = useState(0)

  const handleUpload = () => {
    setUploadState("uploading")
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setUploadState("complete")
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  if (uploadState === "idle") {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Process a Meeting</h1>
          <p className="text-muted-foreground">Upload a recording or paste a transcript. Echo will handle the rest.</p>
        </div>

        <Card className="border-dashed border-2">
          <CardContent className="p-12">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Drag & Drop Audio File Here</h3>
                <p className="text-sm text-muted-foreground">Supported: MP3, M4A, WAV, MP4 • Max size: 500MB</p>
              </div>
              <Button onClick={handleUpload}>Browse Files</Button>
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              <Button variant="outline">📝 Paste Transcript Instead</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (uploadState === "uploading") {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Processing Meeting</h1>
          <p className="text-muted-foreground">Echo is analyzing your meeting...</p>
        </div>

        <Card>
          <CardContent className="p-8 space-y-4">
            <div className="flex items-center gap-3">
              <FileAudio className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <div className="font-medium">sprint-planning-oct26.mp3</div>
                <div className="text-sm text-muted-foreground">23.4 MB</div>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-sm text-muted-foreground">Current step: Extracting action items...</div>
            <div className="text-sm text-muted-foreground">
              ⏱️ Estimated time: {Math.ceil((100 - progress) / 10)} seconds
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Meeting Processed</h1>
        <p className="text-muted-foreground">Echo has completed processing your meeting</p>
      </div>

      <Card className="border-success bg-success/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="h-8 w-8 text-success flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-1">Meeting Processed Successfully!</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>"Sprint Planning - Oct 26, 2025"</div>
                <div>Duration: 45 minutes • Participants: 6 people detected</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tasks">📋 Tasks Created</TabsTrigger>
          <TabsTrigger value="calls">📞 Calls Scheduled</TabsTrigger>
          <TabsTrigger value="summary">📝 Summary</TabsTrigger>
          <TabsTrigger value="blockchain">🔗 Blockchain</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                number: 234,
                title: "Fix login bug on Safari",
                assignee: "Sarah Chen",
                due: "Oct 28",
                priority: "High",
              },
              {
                number: 235,
                title: "Update API rate limiting",
                assignee: "Mike Rodriguez",
                due: "Nov 2",
                priority: "Medium",
              },
              {
                number: 236,
                title: "Review design mockups",
                assignee: "Alex Kumar",
                due: "Oct 30",
                priority: "Medium",
              },
              {
                number: 237,
                title: "Write API documentation",
                assignee: "Maria Garcia",
                due: "Nov 5",
                priority: "Low",
              },
            ].map((task) => (
              <Card key={task.number}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <Github className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">Github Issue #{task.number}</div>
                      <div className="text-sm text-muted-foreground">{task.title}</div>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">👤 Assigned:</span>
                      <span>{task.assignee}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">📅 Due:</span>
                      <span>{task.due}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">🏷️ Priority:</span>
                      <Badge variant={task.priority === "High" ? "destructive" : "secondary"}>{task.priority}</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    View on Github →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calls" className="space-y-3">
          {[
            { name: "Sarah Chen", topic: "Fix login bug on Safari", date: "Oct 28, 2:00 PM", days: "in 2 days" },
            { name: "Mike Rodriguez", topic: "Update API rate limiting", date: "Nov 2, 10:00 AM", days: "in 7 days" },
            { name: "Alex Kumar", topic: "Review design mockups", date: "Oct 30, 3:00 PM", days: "in 4 days" },
          ].map((call, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="font-medium">📞 Follow-up with {call.name}</div>
                    <div className="text-sm text-muted-foreground">About: "{call.topic}"</div>
                    <div className="text-sm">
                      Scheduled: {call.date} <span className="text-muted-foreground">({call.days})</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="summary">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Meeting Summary</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="font-medium mb-2">Key Decisions:</div>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Launching v2.0 on Nov 15</li>
                    <li>Prioritizing mobile app bug fixes</li>
                    <li>Hiring 2 more engineers</li>
                  </ul>
                </div>
                <div>
                  <div className="font-medium mb-2">Action Items:</div>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Sarah: Fix Safari login bug</li>
                    <li>Mike: Update API rate limiting</li>
                    <li>Alex: Review design mockups</li>
                    <li>Maria: Write API documentation</li>
                  </ul>
                </div>
                <div>
                  <div className="font-medium">Next Meeting:</div>
                  <div className="text-muted-foreground">Nov 2, 10:00 AM</div>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" size="sm">
                  📥 Download PDF
                </Button>
                <Button variant="outline" size="sm">
                  📋 Copy to Clipboard
                </Button>
                <Button variant="outline" size="sm">
                  ✉️ Email to Team
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blockchain" className="space-y-3">
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="text-2xl font-bold mb-1">12 Transactions Logged to XRPL</div>
                <div className="text-sm text-muted-foreground">All meeting actions recorded on blockchain</div>
              </div>
              <div className="space-y-3">
                {[
                  { action: "Task creation logged", hash: "0x7B3F...A92E" },
                  { action: "Sarah assigned to issue #234", hash: "0x9C4A...B73F" },
                  { action: "Mike assigned to issue #235", hash: "0x2E8D...C91A" },
                  { action: "Calendar events created", hash: "0x5F1B...D42E" },
                ].map((tx, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="text-sm font-medium">{tx.action}</div>
                      <div className="text-xs text-muted-foreground font-mono">Hash: {tx.hash}</div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View on Explorer →
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center">
        <Button size="lg">Done - Return to Dashboard</Button>
      </div>
    </div>
  )
}
