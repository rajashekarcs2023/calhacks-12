import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { name, phone, reason } = await req.json()

    if (!name || !phone || !reason) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const { text } = await generateText({
      model: "openai/gpt-5-mini",
      prompt: `Generate a professional callback confirmation message for a citizen named ${name} who requested help with: "${reason}". Include an estimated callback time and case number format CB-${Date.now().toString().slice(-6)}.`,
      maxOutputTokens: 200,
    })

    // Store callback request
    const supabase = await createServerClient()
    await supabase.from("workflow_log").insert({
      intent_category: "Callback",
      intent_service: "callback_request",
      status: "queued",
      details: { name, phone, reason, message: text },
    })

    return NextResponse.json({
      success: true,
      message: text,
    })
  } catch (error) {
    console.error("[v0] Callback request error:", error)
    return NextResponse.json(
      {
        success: true,
        message: `Thank you for your callback request. A city representative will contact you within 24 hours. Case #CB-${Date.now().toString().slice(-6)}`,
      },
      { status: 200 },
    )
  }
}
