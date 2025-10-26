"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Phone, Camera, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Intent } from "@/lib/types"

interface ChatHeaderProps {
  intent: Intent | null
  onCallback?: () => void
  onUpload?: () => void
  onVoice?: () => void
}

export function ChatHeader({ intent, onCallback, onUpload, onVoice }: ChatHeaderProps) {
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between p-4">
        {/* Dynamic routing pill */}
        <AnimatePresence mode="wait">
          {intent ? (
            <motion.div
              key={`${intent.category}-${intent.service}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{
                backgroundColor: `${intent.color}20`,
                color: intent.color,
                border: `1px solid ${intent.color}40`,
              }}
            >
              <span className="text-lg">{intent.icon}</span>
              <span>{intent.department}</span>
              <span className="opacity-60">→</span>
              <span className="capitalize">{intent.service.replace(/_/g, " ")}</span>
            </motion.div>
          ) : (
            <motion.div
              key="general"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm font-medium"
            >
              <span>💬</span>
              <span>General Chat</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onCallback} title="Request Callback">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onUpload} title="Upload Document">
            <Camera className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onVoice} title="Voice Message">
            <Mic className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
