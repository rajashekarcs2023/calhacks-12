import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { executeWorkflowWithAI, analyzeImageWithVision } from "@/lib/ai-workflow-engine"
import { classifyIntent } from "@/lib/intent-taxonomy"

export async function POST(req: Request) {
  try {
    const { message, imageBase64 } = await req.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Classify the intent
    const intent = await classifyIntent(message)

    // Analyze image if provided
    let imageAnalysis: string | undefined
    if (imageBase64) {
      imageAnalysis = await analyzeImageWithVision(imageBase64, `${intent.category} - ${intent.service}: ${message}`)
    }

    // Execute workflow with AI
    const workflowResponse = await executeWorkflowWithAI(intent, message, imageAnalysis)

    // Store in database
    const supabase = await createServerClient()
    const { data: workflow, error } = await supabase
      .from("workflow_log")
      .insert({
        intent_category: intent.category,
        intent_service: intent.service,
        status: "running",
        details: {
          ...workflowResponse,
          userMessage: message,
          imageAnalysis,
        },
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Failed to store workflow:", error)
    }

    return NextResponse.json({
      success: true,
      workflow: workflowResponse,
      workflowId: workflow?.id,
      intent,
    })
  } catch (error) {
    console.error("[v0] Workflow execution error:", error)
    return NextResponse.json({ error: "Failed to execute workflow" }, { status: 500 })
  }
}
