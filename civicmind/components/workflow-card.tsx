"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, AlertCircle, Circle } from "lucide-react"
import type { WorkflowResponse } from "@/lib/ai-workflow-engine"

interface WorkflowCardProps {
  workflow: WorkflowResponse
}

export function WorkflowCard({ workflow }: WorkflowCardProps) {
  const priorityColors = {
    low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    urgent: "bg-red-500/10 text-red-500 border-red-500/20",
  }

  const statusIcons = {
    completed: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    in_progress: <Clock className="w-4 h-4 text-blue-500 animate-pulse" />,
    pending: <Circle className="w-4 h-4 text-gray-400" />,
    failed: <AlertCircle className="w-4 h-4 text-red-500" />,
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-background/50 to-background border-border/50 backdrop-blur-sm">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold">Case #{workflow.caseNumber}</h3>
              <Badge className={priorityColors[workflow.priority]}>{workflow.priority.toUpperCase()}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{workflow.assignedDepartment}</p>
          </div>
          <Badge variant="outline" className="bg-primary/10">
            {workflow.status}
          </Badge>
        </div>

        {/* Message */}
        <p className="text-sm leading-relaxed">{workflow.message}</p>

        {/* Steps */}
        <div className="space-y-3 pt-2">
          <h4 className="text-sm font-medium text-muted-foreground">Progress</h4>
          {workflow.steps.map((step) => (
            <div key={step.step} className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">{statusIcons[step.status]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{step.title}</p>
                  {step.assignedTo && <span className="text-xs text-muted-foreground">{step.assignedTo}</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                {step.estimatedCompletion && (
                  <p className="text-xs text-blue-500 mt-1">ETA: {step.estimatedCompletion}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <span>Est. Resolution: {workflow.estimatedResolution}</span>
          {workflow.contactInfo && <span>{workflow.contactInfo}</span>}
        </div>
      </div>
    </Card>
  )
}
