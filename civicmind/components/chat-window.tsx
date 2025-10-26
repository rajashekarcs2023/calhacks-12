"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Send, Loader2 } from "lucide-react"
import { AnswerCard } from "./answer-card"
import { VoiceMicButton } from "./voice-mic-button"
import { ChatHeader } from "./chat-header"
import { CallbackModal } from "./callback-modal"
import { UploadModal } from "./upload-modal"
import type { QueryResponse, Intent } from "@/lib/types"

interface Message {
  id: string
  type: "user" | "assistant"
  text: string
  response?: QueryResponse
  timestamp: Date
  isVoice?: boolean
}

const SUGGESTED_QUERIES = [
  "Show unresolved potholes this week in Downtown",
  "I need help with food stamps",
  "I want to appeal my parking ticket",
  "Compare 2024 budget: Education vs Public Safety",
]

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentIntent, setCurrentIntent] = useState<Intent | null>(null)
  const [showCallbackModal, setShowCallbackModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)

  const handleSubmit = async (question: string) => {
    if (!question.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      text: question,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      })

      const result: QueryResponse = await response.json()

      if (result.intent) {
        setCurrentIntent(result.intent)
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        text: result.cards[0]?.explanation || "I processed your request.",
        response: result,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("[v0] Query error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        text: "Sorry, I encountered an error processing your question.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleChipClick = (query: string) => {
    handleSubmit(query)
  }

  const handleVoiceTranscript = (transcript: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      text: transcript,
      timestamp: new Date(),
      isVoice: true,
    }
    setMessages((prev) => [...prev, userMessage])
  }

  const handleVoiceResult = (result: QueryResponse) => {
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "assistant",
      text: result.cards[0]?.explanation || "I processed your request.",
      response: result,
      timestamp: new Date(),
      isVoice: true,
    }
    setMessages((prev) => [...prev, assistantMessage])
  }

  const handleWorkflowSubmit = async (message: string, imageBase64?: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/workflow/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, imageBase64 }),
      })

      const result = await response.json()

      if (result.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          text: result.workflow.message,
          response: {
            intent: result.intent,
            cards: [
              {
                viz: "text",
                rows: [],
                columns: [],
                explanation: result.workflow.message,
              },
            ],
            workflow: result.workflow,
            workflowId: result.workflowId,
          },
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error("[v0] Workflow submission error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <ChatHeader
        intent={currentIntent}
        onCallback={() => setShowCallbackModal(true)}
        onUpload={() => setShowUploadModal(true)}
        onVoice={() => console.log("Voice requested")}
      />

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-balance">Talk to your city</h2>
              <p className="text-muted-foreground text-lg">
                Ask questions about 311 requests, budgets, events, and more
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
              {SUGGESTED_QUERIES.map((query) => (
                <Button
                  key={query}
                  variant="outline"
                  size="sm"
                  onClick={() => handleChipClick(query)}
                  className="text-sm"
                >
                  {query}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] ${message.type === "user" ? "ml-auto" : "mr-auto"}`}>
              {message.type === "user" ? (
                <Card className="p-3 bg-primary text-primary-foreground">
                  <p className="text-sm">{message.text}</p>
                  {message.isVoice && <p className="text-xs opacity-70 mt-1">Voice input</p>}
                </Card>
              ) : (
                <div className="space-y-3">
                  <Card className="p-3 bg-card">
                    <p className="text-sm">{message.text}</p>
                    {message.response?.workflowId && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Workflow ID: {message.response.workflowId}
                      </div>
                    )}
                    {message.response?.mock && <p className="text-xs text-muted-foreground mt-2">Mock Mode Active</p>}
                  </Card>
                  {message.response?.cards.map((card, idx) => (
                    <AnswerCard key={idx} result={card} workflow={idx === 0 ? message.response?.workflow : undefined} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <Card className="p-3 bg-card">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm text-muted-foreground">Analyzing your question...</p>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit(input)
          }}
          className="flex gap-2"
        >
          <VoiceMicButton
            onTranscript={(transcript) => {
              const userMessage: Message = {
                id: Date.now().toString(),
                type: "user",
                text: transcript,
                timestamp: new Date(),
                isVoice: true,
              }
              setMessages((prev) => [...prev, userMessage])
            }}
            onResult={(result) => {
              const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: "assistant",
                text: result.cards[0]?.explanation || "I processed your request.",
                response: result,
                timestamp: new Date(),
                isVoice: true,
              }
              setMessages((prev) => [...prev, assistantMessage])
            }}
            disabled={isLoading}
          />
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your city..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Modals */}
      <CallbackModal
        open={showCallbackModal}
        onClose={() => setShowCallbackModal(false)}
        onSubmit={(data) => {
          console.log("Callback requested:", data)
          setShowCallbackModal(false)
        }}
      />

      <UploadModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSubmit={(message, imageBase64) => {
          handleWorkflowSubmit(message, imageBase64)
          setShowUploadModal(false)
        }}
      />
    </div>
  )
}
