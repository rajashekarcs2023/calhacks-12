import { NextResponse } from "next/server"
import { AccessToken } from "livekit-server-sdk"

export const runtime = "edge"

export async function POST(req: Request) {
  try {
    const { identity } = await req.json()

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET
    const livekitUrl = process.env.LIVEKIT_URL

    if (!apiKey || !apiSecret || !livekitUrl) {
      return NextResponse.json({ error: "LiveKit not configured" }, { status: 503 })
    }

    const roomName = "civicmind"
    const participantIdentity = identity || `citizen-${Date.now()}`

    const token = new AccessToken(apiKey, apiSecret, {
      identity: participantIdentity,
    })

    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    })

    const jwt = await token.toJwt()

    return NextResponse.json({
      token: jwt,
      url: livekitUrl,
    })
  } catch (error) {
    console.error("[v0] LiveKit token error:", error)
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 })
  }
}
