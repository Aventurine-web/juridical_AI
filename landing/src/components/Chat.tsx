import { useEffect, useRef, useState } from "react"
import { Send } from "lucide-react"
import { askAgent, probeAdk, MOCK_REPLIES } from "@/lib/adk"
import { cn } from "@/lib/utils"

interface Msg { who: "user" | "bot"; text: string; thinking?: boolean }

// TODO @16:00: tailor these to the revealed mission so reviewers see it shine.
const SUGGESTIONS = [
  "What can you do?",
  "Search the web for the latest on Google ADK",
  "Summarize why this matters for a busy team",
]

export function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { who: "bot", text: "👋 Hi! I'm the Vorker agent. Ask me anything, or tap a suggestion below." },
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
    setMsgs((m) => [...m, { who: "user", text: q }, { who: "bot", text: "thinking…", thinking: true }])
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
        { who: "bot", text: `⚠️ ${message}\n(Falling back to offline mode — run \`adk api_server\` and reload.)` },
      ])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex h-[460px] flex-col overflow-hidden rounded-xl border border-border bg-gradient-to-b from-white/5 to-white/[0.02]">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3 text-sm">
        <span
          className={cn(
            "h-2.5 w-2.5 rounded-full",
            live ? "bg-primary shadow-[0_0_10px_var(--color-primary)]" : "bg-warning shadow-[0_0_10px_var(--color-warning)]",
          )}
        />
        {live ? "live · connected to ADK agent" : "offline demo mode · run `adk api_server` to go live"}
      </div>

      <div ref={logRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[86%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[14.5px]",
              m.who === "user"
                ? "self-end rounded-br-sm bg-primary text-primary-foreground"
                : "self-start rounded-bl-sm border border-border bg-white/[0.06]",
              m.thinking && "italic text-muted-foreground",
            )}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 px-4 pb-3">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            className="rounded-full border border-border bg-white/[0.04] px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary hover:text-foreground"
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
        className="flex gap-2 border-t border-border p-3"
      >
        <input
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the agent something…"
          autoComplete="off"
          className="flex-1 rounded-xl border border-border bg-black/30 px-3.5 py-3 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          <Send size={16} /> Send
        </button>
      </form>
    </div>
  )
}
