import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { KPICard } from "@/components/kpi-card"
import { SentimentGauge } from "@/components/sentiment-gauge"
import { FeedbackForm } from "@/components/feedback-form"
import { CityChart } from "@/components/city-chart"
import { TrendingUp, AlertCircle, Calendar, Users } from "lucide-react"
import type { MoodSummary } from "@/lib/types"

async function getMoodData(): Promise<MoodSummary> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/mood`, {
      cache: "no-store",
    })
    return await response.json()
  } catch (error) {
    console.error("[v0] Failed to fetch mood data:", error)
    // Return mock data as fallback
    return {
      summary: { positive: 34, neutral: 71, negative: 49 },
      trend: [
        { date: "2025-10-19", avg: -0.1 },
        { date: "2025-10-20", avg: 0.05 },
        { date: "2025-10-21", avg: 0.15 },
        { date: "2025-10-22", avg: -0.05 },
        { date: "2025-10-23", avg: 0.1 },
        { date: "2025-10-24", avg: 0.2 },
        { date: "2025-10-25", avg: 0.15 },
      ],
      top_topics: [
        { type: "transit_delay", count: 28 },
        { type: "waste", count: 19 },
        { type: "pothole", count: 15 },
      ],
    }
  }
}

export default async function PulsePage() {
  const moodData = await getMoodData()
  const total = moodData.summary.positive + moodData.summary.neutral + moodData.summary.negative

  // Calculate average sentiment
  const avgSentiment =
    total > 0
      ? (
          (moodData.summary.positive * 1 + moodData.summary.neutral * 0 + moodData.summary.negative * -1) /
          total
        ).toFixed(2)
      : "0.00"

  // Calculate trend direction
  const recentTrend = moodData.trend.slice(-3)
  const trendDirection =
    recentTrend.length >= 2 ? ((recentTrend[recentTrend.length - 1].avg - recentTrend[0].avg) * 100).toFixed(1) : "0"

  return (
    <div className="flex min-h-screen flex-col">
      <Header currentPage="pulse" />

      {/* Main content */}
      <main className="flex-1 container py-8">
        <div className="space-y-8">
          {/* Page header */}
          <div>
            <h2 className="text-3xl font-bold text-balance">City Pulse</h2>
            <p className="text-muted-foreground mt-2">Real-time insights into citizen sentiment and city services</p>
          </div>

          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Avg Sentiment"
              value={avgSentiment}
              icon={TrendingUp}
              trend={{ value: Number.parseFloat(trendDirection), label: "from last week" }}
            />
            <KPICard title="Total Feedback" value={total} icon={Users} description="Last 14 days" />
            <KPICard
              title="Top Issue"
              value={moodData.top_topics[0]?.type.replace("_", " ") || "N/A"}
              icon={AlertCircle}
              description={`${moodData.top_topics[0]?.count || 0} reports`}
            />
            <KPICard
              title="Active Reports"
              value={moodData.top_topics.reduce((sum, t) => sum + t.count, 0)}
              icon={Calendar}
              description="Last 14 days"
            />
          </div>

          {/* Main content grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Sentiment gauge */}
            <SentimentGauge
              positive={moodData.summary.positive}
              neutral={moodData.summary.neutral}
              negative={moodData.summary.negative}
            />

            {/* Feedback form */}
            <FeedbackForm />
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Sentiment trend */}
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <CityChart data={moodData.trend.map((t) => ({ date: t.date, sentiment: t.avg }))} type="line" />
              </CardContent>
            </Card>

            {/* Top topics */}
            <Card>
              <CardHeader>
                <CardTitle>Top Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <CityChart
                  data={moodData.top_topics.map((t) => ({ type: t.type.replace("_", " "), count: t.count }))}
                  type="bar"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
