import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "edge"

// Simple sentiment analysis fallback (lexicon-based)
function analyzeSentiment(text: string): { sentiment: "positive" | "neutral" | "negative"; score: number } {
  const lower = text.toLowerCase()

  const positiveWords = [
    "great",
    "love",
    "excellent",
    "fantastic",
    "good",
    "amazing",
    "wonderful",
    "perfect",
    "appreciate",
    "thank",
  ]
  const negativeWords = [
    "bad",
    "terrible",
    "awful",
    "hate",
    "poor",
    "worst",
    "horrible",
    "disappointing",
    "problem",
    "issue",
    "late",
    "missed",
    "broken",
  ]

  let score = 0
  positiveWords.forEach((word) => {
    if (lower.includes(word)) score += 0.3
  })
  negativeWords.forEach((word) => {
    if (lower.includes(word)) score -= 0.3
  })

  // Clamp score between -1 and 1
  score = Math.max(-1, Math.min(1, score))

  let sentiment: "positive" | "neutral" | "negative" = "neutral"
  if (score > 0.2) sentiment = "positive"
  else if (score < -0.2) sentiment = "negative"

  return { sentiment, score }
}

export async function POST(req: Request) {
  try {
    const { text, district } = await req.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // Analyze sentiment
    const { sentiment, score } = analyzeSentiment(text)

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ sentiment, score, mock: true })
    }

    // Insert feedback into database
    const supabase = await createClient()
    const { error } = await supabase.from("citizen_feedback").insert({
      text,
      district: district || null,
      sentiment,
      score,
    })

    if (error) {
      console.error("[v0] Feedback insert error:", error)
      return NextResponse.json({ sentiment, score, mock: true })
    }

    return NextResponse.json({ sentiment, score })
  } catch (error) {
    console.error("[v0] Feedback API error:", error)
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 })
  }
}
