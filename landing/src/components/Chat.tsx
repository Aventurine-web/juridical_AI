import { useEffect, useRef, useState } from "react"
import { ArrowUp } from "lucide-react"
import { askAgent, probeAdk, MOCK_REPLIES } from "@/lib/adk"
import { cn } from "@/lib/utils"

interface Msg { who: "user" | "bot"; text: string; thinking?: boolean }

// TODO @16:00: tailor to the revealed mission. These show GTM range:
// positioning, segmentation, messaging, launch.
const SUGGESTIONS = [
  "Position a new B2B product",
  "Pick a beachhead segment for launch",
  "Draft launch messaging for our ICP",
]

export function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      who: "bot",
      text: "Hi — I'm your GTM strategist. Ask me about positioning, segmentation, messaging, or a launch plan, and I'll think it through with you.",
    },
  ])
  const [input, setInput] = useState("")
  const [live, setLive] = useState(false)
  const [busy, setBusy] = useState(false)
  const mockIdx = useRef(0)
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    probeAdk().then(setLive)
  }, [])

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" })
  }, [msgs])

  async function send(text: string) {
    const q = text.trim()
    if (!q || busy) return
    setInput("")
    setBusy(true)
    setMsgs((m) => [...m, { who: "user", text: q }, { who: "bot", text: "Thinking…", thinking: true }])
    try {
      let reply: string
      if (live) {
        reply = await askAgent(q)
      } else {
        await new Promise((r) => setTimeout(r, 450))
        reply = MOCK_REPLIES[mockIdx.current++ % MOCK_REPLIES.length]
      }
      setMsgs((m) => [...m.slice(0, -1), { who: "bot", text: reply }])
    } catch (err) {
      const message = err instanceof Error ? err.message : "request failed"
      setLive(false)
      setMsgs((m) => [
        ...m.slice(0, -1),
        { who: "bot", text: `Couldn't reach the live agent (${message}). Run \`adk api_server\` and reload to go live.` },
      ])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex h-[480px] flex-col overflow-hidden rounded-2xl border border-border bg-popover shadow-[0_1px_2px_rgba(26,26,26,0.04),0_24px_48px_-24px_rgba(26,26,26,0.18)]">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3.5 text-[13px] text-muted-foreground">
        <span className={cn("h-1.5 w-1.5 rounded-full", live ? "bg-primary" : "bg-muted-foreground/40")} />
        {live ? "Live · connected to your agent" : "Demo mode · run “adk api_server” to go live"}
      </div>

      <div ref={logRef} className="flex flex-1 flex-col gap-3.5 overflow-y-auto px-5 py-5">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[14.5px] leading-relaxed",
              m.who === "user"
                ? "self-end rounded-br-md bg-primary text-primary-foreground"
                : "self-start rounded-bl-md bg-card text-card-foreground",
              m.thinking && "text-muted-foreground",
            )}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 px-5 pb-3">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            className="rounded-full border border-border bg-background px-3.5 py-1.5 text-[13px] text-muted-foreground transition hover:border-primary hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <input
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your go-to-market…"
          autoComplete="off"
          className="flex-1 rounded-xl bg-background px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40"
        />
        <button
          type="submit"
          disabled={busy}
          aria-label="Send"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
        >
          <ArrowUp size={18} />
        </button>
      </form>
    </div>
  )
}
