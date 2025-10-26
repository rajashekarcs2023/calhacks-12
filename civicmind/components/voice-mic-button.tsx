"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Loader2, Volume2 } from "lucide-react"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { useAudioPlayer } from "@/hooks/use-audio-player"
import type { QueryResponse } from "@/lib/types"

interface VoiceMicButtonProps {
  onTranscript: (text: string) => void
  onResult: (result: QueryResponse) => void
  disabled?: boolean
}

export function VoiceMicButton({ onTranscript, onResult, disabled }: VoiceMicButtonProps) {
  const { isRecording, audioBlob, startRecording, stopRecording, clearRecording, error } = useAudioRecorder()
  const { isPlaying, play } = useAudioPlayer()
  const [isProcessing, setIsProcessing] = useState(false)

  // Process audio when recording stops
  useEffect(() => {
    if (audioBlob && !isRecording) {
      processVoiceQuery()
    }
  }, [audioBlob, isRecording])

  const processVoiceQuery = async () => {
    if (!audioBlob) return

    setIsProcessing(true)

    try {
      // Step 1: Transcribe audio (STT)
      const formData = new FormData()
      formData.append("audio", audioBlob, "recording.webm")

      const sttResponse = await fetch("/api/stt", {
        method: "POST",
        body: formData,
      })

      const { text: transcript } = await sttResponse.json()
      onTranscript(transcript)

      // Step 2: Query the data
      const queryResponse = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: transcript }),
      })

      const result: QueryResponse = await queryResponse.json()
      onResult(result)

      // Step 3: Generate TTS for the explanation
      const explanation = result.cards[0]?.explanation || "I processed your request."
      const ttsResponse = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: explanation }),
      })

      const { audioUrl } = await ttsResponse.json()

      // Step 4: Play the audio
      if (audioUrl) {
        await play(audioUrl)
      }
    } catch (error) {
      console.error("[v0] Voice query processing error:", error)
    } finally {
      setIsProcessing(false)
      clearRecording()
    }
  }

  const handleClick = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const getButtonContent = () => {
    if (isProcessing) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="sr-only">Processing voice query</span>
        </>
      )
    }

    if (isPlaying) {
      return (
        <>
          <Volume2 className="h-4 w-4 animate-pulse" />
          <span className="sr-only">Playing response</span>
        </>
      )
    }

    if (isRecording) {
      return (
        <>
          <Square className="h-4 w-4 fill-current" />
          <span className="sr-only">Stop recording</span>
        </>
      )
    }

    return (
      <>
        <Mic className="h-4 w-4" />
        <span className="sr-only">Start voice recording</span>
      </>
    )
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant={isRecording ? "destructive" : "outline"}
        size="icon"
        onClick={handleClick}
        disabled={disabled || isProcessing || isPlaying}
        className={isRecording ? "animate-pulse" : ""}
      >
        {getButtonContent()}
      </Button>

      {error && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-destructive text-destructive-foreground text-xs rounded-md">
          {error}
        </div>
      )}
    </div>
  )
}
