import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const workflowId = searchParams.get("id")

    if (!workflowId) {
      return NextResponse.json({ error: "Workflow ID is required" }, { status: 400 })
    }

    const supabase = await createServerClient()
    const { data: workflow, error } = await supabase.from("workflow_log").select("*").eq("id", workflowId).single()

    if (error || !workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
    }

    return NextResponse.json({ workflow })
  } catch (error) {
    console.error("[v0] Workflow status error:", error)
    return NextResponse.json({ error: "Failed to fetch workflow status" }, { status: 500 })
  }
}
