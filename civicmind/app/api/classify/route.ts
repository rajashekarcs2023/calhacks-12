import { type NextRequest, NextResponse } from "next/server"
import { classifyIntentByKeywords, buildIntent } from "@/lib/intent-taxonomy"

const CLASSIFICATION_PROMPT = `You are an intent classifier for a civic assistant.
Return a single JSON object with fields:
{ "category": "<one of: legal|tickets|benefits|community|voting|dmv|council|legislation>",
  "service": "<one of the predefined services for that category>" }

Category → Services mapping:
- legal: eviction_defense, housing_rights, court_dates, legal_aid_referral, document_review
- tickets: ticket_appeal, payment_plan, fine_reduction
- benefits: snap_benefits, medicaid, housing_assistance, utility_help, eligibility_check
- community: street_maintenance, graffiti_removal, streetlight_repair, pothole_repair
- voting: voter_info, ballot_lookup, polling_location
- dmv: registration_renewal, license_renewal, vehicle_records
- council: district_lookup, message_officials, legislative_alerts
- legislation: restaurant_regulations, zoning_changes, business_compliance

Prefer the most specific service. If unclear, return category=null, service=null.`

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()

    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 })
    }

    // Try LLM classification if available
    const llmProvider = process.env.LLM_PROVIDER
    const llmApiKey = process.env.LLM_API_KEY

    if (llmProvider && llmApiKey) {
      try {
        const classified = await classifyWithLLM(text, llmProvider, llmApiKey)
        if (classified) {
          return NextResponse.json({
            intent: classified,
            confidence: 0.9,
          })
        }
      } catch (error) {
        console.error("[v0] LLM classification failed:", error)
      }
    }

    // Fallback to keyword-based classification
    const intent = classifyIntentByKeywords(text)

    if (intent) {
      return NextResponse.json({
        intent,
        confidence: 0.7,
      })
    }

    // No classification found
    return NextResponse.json({
      intent: null,
      confidence: 0,
    })
  } catch (error) {
    console.error("[v0] Classification error:", error)
    return NextResponse.json({ error: "Classification failed" }, { status: 500 })
  }
}

async function classifyWithLLM(text: string, provider: string, apiKey: string): Promise<any> {
  let endpoint = ""
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  let body: any = {}

  if (provider === "openai") {
    endpoint = "https://api.openai.com/v1/chat/completions"
    headers["Authorization"] = `Bearer ${apiKey}`
    body = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: CLASSIFICATION_PROMPT },
        { role: "user", content: text },
      ],
      response_format: { type: "json_object" },
    }
  } else if (provider === "anthropic") {
    endpoint = "https://api.anthropic.com/v1/messages"
    headers["x-api-key"] = apiKey
    headers["anthropic-version"] = "2023-06-01"
    body = {
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [{ role: "user", content: `${CLASSIFICATION_PROMPT}\n\nClassify: ${text}` }],
    }
  } else if (provider === "gemini") {
    endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
    body = {
      contents: [
        {
          parts: [
            {
              text: `${CLASSIFICATION_PROMPT}\n\nClassify: ${text}`,
            },
          ],
        },
      ],
    }
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`LLM API error: ${response.statusText}`)
  }

  const data = await response.json()

  // Parse response based on provider
  let resultText = ""
  if (provider === "openai") {
    resultText = data.choices[0].message.content
  } else if (provider === "anthropic") {
    resultText = data.content[0].text
  } else if (provider === "gemini") {
    resultText = data.candidates[0].content.parts[0].text
  }

  // Extract JSON from response
  const jsonMatch = resultText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null

  const parsed = JSON.parse(jsonMatch[0])
  if (!parsed.category || !parsed.service) return null

  return buildIntent(parsed.category, parsed.service)
}
