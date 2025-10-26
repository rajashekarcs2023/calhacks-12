import { NextResponse } from "next/server"

export const runtime = "edge"

// Mock policy explanation (deterministic fallback)
function getMockExplanation(text: string) {
  return {
    tldr: "This policy proposes changes to city services with a 3-month pilot program.",
    key_points: [
      "Pilot program in select districts",
      "Budget reallocated from underused services",
      "Monthly performance metrics will be published",
    ],
    faq: [
      { q: "When does it start?", a: "Pending city council vote next month." },
      { q: "Which areas are included?", a: "Downtown and North districts initially." },
      { q: "How will success be measured?", a: "Through citizen feedback and usage metrics." },
    ],
    mock: true,
  }
}

async function explainWithLLM(text: string, provider: string, apiKey: string) {
  const prompt = `You are a civic policy explainer. Summarize the following policy or legislation in plain language.

Return a JSON object with:
{
  "tldr": "One sentence summary",
  "key_points": ["Point 1", "Point 2", "Point 3"],
  "faq": [{"q": "Question?", "a": "Answer"}]
}

Policy text:
${text}`

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
        { role: "system", content: "You are a civic policy explainer. Return valid JSON only." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }
  } else if (provider === "anthropic") {
    endpoint = "https://api.anthropic.com/v1/messages"
    headers["x-api-key"] = apiKey
    headers["anthropic-version"] = "2023-06-01"
    body = {
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    }
  } else if (provider === "gemini") {
    endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
    body = {
      contents: [
        {
          parts: [{ text: prompt }],
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

  let resultText = ""
  if (provider === "openai") {
    resultText = data.choices[0].message.content
  } else if (provider === "anthropic") {
    resultText = data.content[0].text
  } else if (provider === "gemini") {
    resultText = data.candidates[0].content.parts[0].text
  }

  const jsonMatch = resultText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error("No JSON found in response")

  return JSON.parse(jsonMatch[0])
}

export async function POST(req: Request) {
  try {
    const { text, url } = await req.json()

    if (!text && !url) {
      return NextResponse.json({ error: "Text or URL is required" }, { status: 400 })
    }

    const contentToExplain = text || `Policy document from: ${url}`

    const llmProvider = process.env.LLM_PROVIDER
    const llmApiKey = process.env.LLM_API_KEY

    if (llmProvider && llmApiKey) {
      try {
        const explanation = await explainWithLLM(contentToExplain, llmProvider, llmApiKey)
        return NextResponse.json(explanation)
      } catch (error) {
        console.error("[v0] LLM policy explanation failed:", error)
      }
    }

    return NextResponse.json(getMockExplanation(contentToExplain))
  } catch (error) {
    console.error("[v0] Policy explain API error:", error)
    return NextResponse.json({ error: "Failed to explain policy" }, { status: 500 })
  }
}
