import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { MoodSummary } from "@/lib/types"

export const runtime = "edge"

// Mock mood data
function getMockMood(): MoodSummary {
  return {
    summary: {
      positive: 34,
      neutral: 71,
      negative: 49,
    },
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

export async function GET() {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(getMockMood())
    }

    const supabase = await createClient()

    // Get sentiment summary
    const { data: feedbackData } = await supabase.from("citizen_feedback").select("sentiment")

    const summary = {
      positive: feedbackData?.filter((f) => f.sentiment === "positive").length || 0,
      neutral: feedbackData?.filter((f) => f.sentiment === "neutral").length || 0,
      negative: feedbackData?.filter((f) => f.sentiment === "negative").length || 0,
    }

    // Get sentiment trend (last 14 days)
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    const { data: trendData } = await supabase
      .from("citizen_feedback")
      .select("created_at, score")
      .gte("created_at", fourteenDaysAgo.toISOString())
      .order("created_at", { ascending: true })

    // Group by date and calculate average
    const trendMap = new Map<string, { sum: number; count: number }>()
    trendData?.forEach((item) => {
      const date = item.created_at.split("T")[0]
      const existing = trendMap.get(date) || { sum: 0, count: 0 }
      trendMap.set(date, {
        sum: existing.sum + item.score,
        count: existing.count + 1,
      })
    })

    const trend = Array.from(trendMap.entries()).map(([date, { sum, count }]) => ({
      date,
      avg: sum / count,
    }))

    // Get top complaint topics
    const { data: topicsData } = await supabase
      .from("requests_311")
      .select("type")
      .gte("created_at", fourteenDaysAgo.toISOString())

    const topicsMap = new Map<string, number>()
    topicsData?.forEach((item) => {
      topicsMap.set(item.type, (topicsMap.get(item.type) || 0) + 1)
    })

    const top_topics = Array.from(topicsMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return NextResponse.json({ summary, trend, top_topics })
  } catch (error) {
    console.error("[v0] Mood API error:", error)
    return NextResponse.json(getMockMood())
  }
}
