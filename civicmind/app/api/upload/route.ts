import { NextResponse } from "next/server"
import { analyzeImageWithVision } from "@/lib/ai-workflow-engine"

export async function POST(req: Request) {
  try {
    const { imageBase64, context } = await req.json()

    if (!imageBase64) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 })
    }

    const analysis = await analyzeImageWithVision(imageBase64, context || "General city service request")

    return NextResponse.json({
      success: true,
      analysis,
    })
  } catch (error) {
    console.error("[v0] Image upload error:", error)
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 })
  }
}
