import { NextResponse } from "next/server"

export const runtime = "edge"

// Mock STT transcription
function getMockTranscript(): string {
  return "Show unresolved potholes this week in Downtown"
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const audio = formData.get("audio")

    if (!audio) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 })
    }

    // Return mock transcript - actual STT should be handled client-side with browser APIs
    return NextResponse.json({ text: getMockTranscript(), mock: true })
  } catch (error) {
    console.error("[v0] STT API error:", error)
    return NextResponse.json({ error: "Failed to transcribe audio" }, { status: 500 })
  }
}
