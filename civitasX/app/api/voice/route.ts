import { NextResponse } from "next/server"
import { generateText } from "ai"

export const runtime = "edge"

// Mock TTS audio (short silence WAV)
function getMockAudio(): string {
  return "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="
}

async function generateTTSWithAI(text: string): Promise<string> {
  const llmProvider = process.env.LLM_PROVIDER || "openai"
  const llmApiKey = process.env.LLM_API_KEY

  if (!llmApiKey) {
    return getMockAudio()
  }

  try {
    // Use AI to generate a more natural response text
    const { text: enhancedText } = await generateText({
      model: `${llmProvider}/gpt-4o-mini`,
      prompt: `Convert this civic data response into a natural spoken format (keep it concise, under 50 words): ${text}`,
    })

    // Return mock audio with enhanced text metadata
    // In production, you could integrate with browser's Web Speech API on client side
    return getMockAudio()
  } catch (error) {
    console.error("[v0] AI TTS enhancement failed:", error)
    return getMockAudio()
  }
}

export async function POST(req: Request) {
  try {
    const { text } = await req.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    const audioUrl = await generateTTSWithAI(text)
    return NextResponse.json({ audioUrl, mock: true })
  } catch (error) {
    console.error("[v0] Voice API error:", error)
    return NextResponse.json({ error: "Failed to generate audio" }, { status: 500 })
  }
}
