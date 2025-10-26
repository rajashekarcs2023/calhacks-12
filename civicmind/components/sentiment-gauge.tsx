"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Smile, Meh, Frown } from "lucide-react"

interface SentimentGaugeProps {
  positive: number
  neutral: number
  negative: number
}

export function SentimentGauge({ positive, neutral, negative }: SentimentGaugeProps) {
  const total = positive + neutral + negative
  const positivePercent = total > 0 ? (positive / total) * 100 : 0
  const neutralPercent = total > 0 ? (neutral / total) * 100 : 0
  const negativePercent = total > 0 ? (negative / total) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Public Sentiment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sentiment bar */}
        <div className="h-8 flex rounded-lg overflow-hidden">
          <div
            className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
            style={{ width: `${positivePercent}%` }}
          >
            {positivePercent > 10 && `${Math.round(positivePercent)}%`}
          </div>
          <div
            className="bg-yellow-500 flex items-center justify-center text-white text-xs font-medium"
            style={{ width: `${neutralPercent}%` }}
          >
            {neutralPercent > 10 && `${Math.round(neutralPercent)}%`}
          </div>
          <div
            className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
            style={{ width: `${negativePercent}%` }}
          >
            {negativePercent > 10 && `${Math.round(negativePercent)}%`}
          </div>
        </div>

        {/* Sentiment breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Smile className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{positive}</p>
              <p className="text-xs text-muted-foreground">Positive</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Meh className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{neutral}</p>
              <p className="text-xs text-muted-foreground">Neutral</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Frown className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{negative}</p>
              <p className="text-xs text-muted-foreground">Negative</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
