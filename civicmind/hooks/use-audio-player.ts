"use client"

import { useState, useRef, useCallback } from "react"

interface UseAudioPlayerReturn {
  isPlaying: boolean
  play: (audioUrl: string) => Promise<void>
  stop: () => void
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const play = useCallback(async (audioUrl: string) => {
    try {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }

      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onended = () => {
        setIsPlaying(false)
        audioRef.current = null
      }

      audio.onerror = () => {
        console.error("[v0] Audio playback error")
        setIsPlaying(false)
        audioRef.current = null
      }

      setIsPlaying(true)
      await audio.play()
    } catch (error) {
      console.error("[v0] Audio play error:", error)
      setIsPlaying(false)
    }
  }, [])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
      setIsPlaying(false)
    }
  }, [])

  return {
    isPlaying,
    play,
    stop,
  }
}
