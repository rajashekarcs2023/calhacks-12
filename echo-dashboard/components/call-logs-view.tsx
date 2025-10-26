"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Headphones, FileText, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function CallLogsView() {
  const [expandedRow, setExpandedRow] = useState<number | null>(null)

  const calls = [
    {
      time: "2:34 PM",
      type: "outbound",
      person: "Sarah Chen",
      topic: "Login Bug Fix",
      duration: "2:15",
      outcome: "Update",
      outcomeType: "success",
    },
    {
      time: "1:15 PM",
      type: "inbound",
      person: "Mike Rodriguez",
      topic: "API Integration",
      duration: "1:43",
      outcome: "Done",
      outcomeType: "success",
    },
    {
      time: "11:20 AM",
      type: "outbound",
      person: "Alex Kumar",
      topic: "Design Review",
      duration: "0:52",
      outcome: "Pending",
      outcomeType: "warning",
    },
    {
      time: "Yesterday",
      type: "outbound",
      person: "Maria Garcia",
      topic: "Timeline Check",
      duration: "3:21",
      outcome: "Update",
      outcomeType: "success",
    },
    {
      time: "Oct 24",
      type: "inbound",
      person: "David Lee",
      topic: "Bug Report",
      duration: "1:05",
      outcome: "Logged",
      outcomeType: "success",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Call Logs</h1>
        <p className="text-muted-foreground">View all inbound and outbound calls with Echo</p>
      </div>

      <div className="flex gap-2">
        <Button variant="default" size="sm">
          All
        </Button>
        <Button variant="outline" size="sm">
          Outbound ↗
        </Button>
        <Button variant="outline" size="sm">
          Inbound ↙
        </Button>
        <Button variant="outline" size="sm">
          Today
        </Button>
        <Button variant="outline" size="sm">
          This Week
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Person</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calls.map((call, index) => (
                <>
                  <TableRow key={index} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{call.time}</TableCell>
                    <TableCell>
                      {call.type === "outbound" ? (
                        <div className="flex items-center gap-1">
                          <ArrowUpRight className="h-4 w-4" />
                          <span>Out</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <ArrowDownLeft className="h-4 w-4" />
                          <span>In</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{call.person}</TableCell>
                    <TableCell>{call.topic}</TableCell>
                    <TableCell>{call.duration}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          call.outcomeType === "success"
                            ? "default"
                            : call.outcomeType === "warning"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {call.outcome}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Headphones className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedRow === index && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-muted/30">
                        <Card className="border-0 shadow-none">
                          <CardContent className="p-4 space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">
                                📞 Call with {call.person} - {call.time}
                              </h4>
                            </div>
                            <div>
                              <div className="text-sm font-medium mb-2">🎧 Audio Recording:</div>
                              <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
                                <Button size="sm" variant="outline">
                                  ▶️ Play
                                </Button>
                                <div className="flex-1 h-1 bg-muted rounded-full">
                                  <div className="h-full w-0 bg-primary rounded-full" />
                                </div>
                                <span className="text-xs text-muted-foreground">{call.duration}</span>
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium mb-2">📝 Transcript:</div>
                              <div className="space-y-2 text-sm bg-background p-3 rounded-lg">
                                <p>
                                  <span className="font-medium">Echo:</span> "Hi {call.person.split(" ")[0]}, it's Echo.
                                  Checking on the {call.topic.toLowerCase()} from Monday's meeting."
                                </p>
                                <p>
                                  <span className="font-medium">{call.person.split(" ")[0]}:</span> "Hey! Yeah, testing
                                  is complete. Found one edge case but fixed it."
                                </p>
                                <p>
                                  <span className="font-medium">Echo:</span> "Great! Is it ready for code review?"
                                </p>
                                <p>
                                  <span className="font-medium">{call.person.split(" ")[0]}:</span> "Yes, PR is up.
                                  Should be merged by tomorrow."
                                </p>
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium mb-2">🤖 Echo's Actions:</div>
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <div>✓ Updated Github issue #234 → "Ready for Review"</div>
                                <div>✓ Posted to Slack #engineering</div>
                                <div>✓ Updated Notion roadmap</div>
                                <div>✓ Logged to XRPL: 0x7B3F...A92E</div>
                              </div>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">📅 Next Follow-up:</span>{" "}
                              <span className="text-muted-foreground">Oct 29 (if not merged)</span>
                            </div>
                          </CardContent>
                        </Card>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
