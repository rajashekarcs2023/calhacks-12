import { ChatWindow } from "@/components/chat-window"
import { Header } from "@/components/header"

export default function Home() {
  return (
    <div className="flex h-screen flex-col">
      <Header currentPage="chat" />
      <main className="flex-1 overflow-hidden">
        <ChatWindow />
      </main>
    </div>
  )
}
