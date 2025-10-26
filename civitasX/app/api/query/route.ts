import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { parseIntent, buildSqlQuery } from "@/lib/nl2sql"
import { classifyIntentByKeywords } from "@/lib/intent-taxonomy"
import { executeWorkflowWithAI } from "@/lib/ai-workflow-engine"
import type { QueryResponse, Intent } from "@/lib/types"

export const runtime = "edge"

function getMockResponse(question: string, intent: Intent | null): QueryResponse {
  const lower = question.toLowerCase()

  if (lower.includes("pothole")) {
    return {
      intent,
      cards: [
        {
          rows: [
            {
              id: 1,
              created_at: new Date().toISOString(),
              status: "open",
              type: "pothole",
              district: "Downtown",
              lat: 37.7749,
              lng: -122.4194,
            },
            {
              id: 2,
              created_at: new Date().toISOString(),
              status: "open",
              type: "pothole",
              district: "Downtown",
              lat: 37.775,
              lng: -122.4195,
            },
          ],
          viz: "map",
          columns: ["id", "created_at", "status", "type", "district", "lat", "lng"],
          explanation: "Found 2 open pothole reports this week in Downtown. A work order has been queued for repair.",
        },
      ],
      workflow: { id: 1, status: "done", details: { type: "pothole", district: "Downtown" } },
      mock: true,
    }
  }

  if (lower.includes("food stamp") || lower.includes("snap")) {
    return {
      intent,
      cards: [
        {
          rows: [
            { item: "Household income below 130% of poverty line", status: "✓" },
            { item: "U.S. citizen or eligible non-citizen", status: "✓" },
            { item: "Work requirements (if applicable)", status: "?" },
          ],
          viz: "table",
          columns: ["item", "status"],
          explanation:
            "SNAP eligibility checklist. You may qualify based on income. Apply online or visit your local office.",
        },
      ],
      workflow: { id: 2, status: "done", details: { service: "snap_benefits" } },
      mock: true,
    }
  }

  if (lower.includes("ticket") || lower.includes("parking")) {
    return {
      intent,
      cards: [
        {
          rows: [
            { step: 1, action: "Review citation details", status: "Start here" },
            { step: 2, action: "Upload photo evidence", status: "Required" },
            { step: 3, action: "Submit written statement", status: "Required" },
            { step: 4, action: "Await hearing date", status: "14-21 days" },
          ],
          viz: "table",
          columns: ["step", "action", "status"],
          explanation: "Ticket appeal process. Upload evidence within 30 days of citation date.",
        },
      ],
      workflow: { id: 3, status: "running", details: { ticketAppeal: true } },
      mock: true,
    }
  }

  if (lower.includes("budget")) {
    return {
      intent,
      cards: [
        {
          rows: [
            { department: "Education", amount_usd: 450000000 },
            { department: "Public Safety", amount_usd: 380000000 },
          ],
          viz: "bar",
          columns: ["department", "amount_usd"],
          explanation: "Budget comparison for 2024. Education receives $450M, Public Safety $380M.",
        },
      ],
      mock: true,
    }
  }

  return {
    intent,
    cards: [
      {
        rows: [
          { type: "pothole", count: 12 },
          { type: "waste", count: 8 },
          { type: "streetlight", count: 5 },
        ],
        viz: "bar",
        columns: ["type", "count"],
        explanation: "Top complaint types this week.",
      },
    ],
    mock: true,
  }
}

export async function POST(req: Request) {
  try {
    const { question, intent: providedIntent } = await req.json()

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Question is required" }, { status: 400 })
    }

    let intent: Intent | null = providedIntent || null

    if (!intent) {
      // Try to classify via API
      try {
        const classifyResponse = await fetch(new URL("/api/classify", req.url).toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: question }),
        })
        const classifyResult = await classifyResponse.json()
        intent = classifyResult.intent
      } catch (error) {
        console.error("[v0] Classification failed:", error)
        intent = classifyIntentByKeywords(question)
      }
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(getMockResponse(question, intent))
    }

    const workflowIntents = ["pothole_repair", "snap_benefits", "ticket_appeal", "voter_registration"]
    const shouldTriggerWorkflow = intent && workflowIntents.includes(intent.service)

    let workflowResponse = null
    if (shouldTriggerWorkflow && intent) {
      // Execute AI-powered workflow
      try {
        workflowResponse = await executeWorkflowWithAI(intent, question)

        // Store in database
        const supabase = await createServerClient()
        await supabase.from("workflow_log").insert({
          intent_category: intent.category,
          intent_service: intent.service,
          status: "running",
          details: workflowResponse,
        })
      } catch (error) {
        console.error("[v0] Workflow execution failed:", error)
      }
    }

    const cards = await executeWorkflow(question, intent)

    return NextResponse.json({
      intent,
      cards,
      workflow: workflowResponse,
    })
  } catch (error) {
    console.error("[v0] Query API error:", error)
    return NextResponse.json({ error: "Failed to process query" }, { status: 500 })
  }
}

async function executeWorkflow(question: string, intent: Intent | null): Promise<any[]> {
  const supabase = await createServerClient()

  // Public Works → Pothole Repair
  if (intent?.category === "Public Works" && intent?.service === "pothole_repair") {
    const { data, error } = await supabase.rpc("q_open_potholes", {
      start_ts: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      end_ts: new Date().toISOString(),
      d: null,
    })

    if (!error && data) {
      return [
        {
          viz: "map",
          rows: data,
          columns: ["id", "created_at", "status", "type", "district", "lat", "lng"],
          explanation: `Found ${data.length} open pothole reports this week. Work orders have been queued for repair.`,
        },
      ]
    }
  }

  // Social Services → SNAP Benefits
  if (intent?.category === "Social Services" && intent?.service === "snap_benefits") {
    // Log feedback
    await supabase.from("citizen_feedback").insert({
      text: question,
      district: "Unknown",
      sentiment: "neutral",
      score: 0,
    })

    return [
      {
        viz: "table",
        rows: [
          { item: "Household income below 130% of poverty line", status: "✓" },
          { item: "U.S. citizen or eligible non-citizen", status: "✓" },
          { item: "Work requirements (if applicable)", status: "?" },
        ],
        columns: ["item", "status"],
        explanation:
          "SNAP eligibility checklist. You may qualify based on income. Apply online or visit your local office.",
      },
    ]
  }

  // Parking & Fines → Ticket Appeal
  if (intent?.category === "Parking" && intent?.service === "ticket_appeal") {
    return [
      {
        viz: "table",
        rows: [
          { step: 1, action: "Review citation details", status: "Start here" },
          { step: 2, action: "Upload photo evidence", status: "Required" },
          { step: 3, action: "Submit written statement", status: "Required" },
          { step: 4, action: "Await hearing date", status: "14-21 days" },
        ],
        columns: ["step", "action", "status"],
        explanation: "Ticket appeal process. Upload evidence within 30 days of citation date.",
      },
    ]
  }

  // Elections → Voter Info
  if (intent?.category === "Elections") {
    return [
      {
        viz: "text",
        rows: [],
        columns: [],
        explanation:
          "Voter information: Check your registration status at vote.gov. Find your polling location and view your sample ballot online.",
      },
    ]
  }

  // Fallback: use original NL2SQL logic
  const parsedIntent = parseIntent(question)
  const sqlQuery = buildSqlQuery(parsedIntent)

  if (!sqlQuery.functionName) {
    return [
      {
        viz: "text",
        rows: [],
        columns: [],
        explanation: sqlQuery.explanation,
      },
    ]
  }

  const { data, error } = await supabase.rpc(sqlQuery.functionName, {
    start_ts: sqlQuery.params[0],
    end_ts: sqlQuery.params[1],
    d: sqlQuery.params[2] || null,
    year: sqlQuery.params[0],
    req_type: sqlQuery.params[0] || null,
    req_status: sqlQuery.params[1] || null,
  })

  if (error) {
    console.error("[v0] Supabase RPC error:", error)
    return [
      {
        viz: "text",
        rows: [],
        columns: [],
        explanation: "Unable to fetch data at this time.",
      },
    ]
  }

  return [
    {
      viz: sqlQuery.viz,
      rows: data || [],
      columns: sqlQuery.columns,
      explanation: sqlQuery.explanation,
    },
  ]
}
