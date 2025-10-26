"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, FileText } from "lucide-react"

interface PolicyExplanation {
  tldr: string
  key_points: string[]
  faq: Array<{ q: string; a: string }>
  mock?: boolean
}

export function PolicyExplainer() {
  const [text, setText] = useState("")
  const [explanation, setExplanation] = useState<PolicyExplanation | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleExplain = async () => {
    if (!text.trim()) return

    setIsLoading(true)

    try {
      const response = await fetch("/api/policy-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      const result = await response.json()
      setExplanation(result)
    } catch (error) {
      console.error("[v0] Policy explain error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Policy Explainer</h3>
          </div>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste policy text or legislation here..."
            rows={6}
            className="resize-none"
          />

          <Button onClick={handleExplain} disabled={isLoading || !text.trim()} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Analyzing...
              </>
            ) : (
              "Explain Policy"
            )}
          </Button>
        </div>
      </Card>

      {explanation && (
        <Card className="p-4 space-y-4">
          {explanation.mock && (
            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md inline-block">
              Mock Mode Active
            </div>
          )}

          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">TL;DR</h4>
            <p className="text-sm">{explanation.tldr}</p>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Key Points</h4>
            <ul className="space-y-1">
              {explanation.key_points.map((point, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">FAQ</h4>
            <div className="space-y-3">
              {explanation.faq.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="text-sm font-medium">{item.q}</p>
                  <p className="text-sm text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
