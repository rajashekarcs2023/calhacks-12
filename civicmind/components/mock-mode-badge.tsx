"use client"

import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"

export function MockModeBadge() {
  const [isMockMode, setIsMockMode] = useState(false)

  useEffect(() => {
    // Check if essential environment variables are missing
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    setIsMockMode(!hasSupabase)
  }, [])

  if (!isMockMode) return null

  return (
    <Badge variant="outline" className="gap-1 border-yellow-500/50 text-yellow-500">
      <AlertCircle className="h-3 w-3" />
      Mock Mode
    </Badge>
  )
}
