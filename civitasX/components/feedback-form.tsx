"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

export function FeedbackForm() {
  const [text, setText] = useState("")
  const [district, setDistrict] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ sentiment: string; score: number } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return

    setIsSubmitting(true)
    setResult(null)

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, district: district || null }),
      })

      const data = await response.json()
      setResult(data)
      setText("")
      setDistrict("")
    } catch (error) {
      console.error("[v0] Feedback submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Your Feedback</CardTitle>
        <CardDescription>Tell us what you think about city services</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts about city services..."
            className="min-h-[100px]"
            disabled={isSubmitting}
          />

          <Select value={district} onValueChange={setDistrict} disabled={isSubmitting}>
            <SelectTrigger>
              <SelectValue placeholder="Select district (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Downtown">Downtown</SelectItem>
              <SelectItem value="North">North</SelectItem>
              <SelectItem value="South">South</SelectItem>
              <SelectItem value="East">East</SelectItem>
              <SelectItem value="West">West</SelectItem>
            </SelectContent>
          </Select>

          <Button type="submit" disabled={isSubmitting || !text.trim()} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Feedback"
            )}
          </Button>

          {result && (
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm font-medium">
                Sentiment:{" "}
                <span
                  className={
                    result.sentiment === "positive"
                      ? "text-green-500"
                      : result.sentiment === "negative"
                        ? "text-red-500"
                        : "text-yellow-500"
                  }
                >
                  {result.sentiment}
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">Thank you for your feedback!</p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
