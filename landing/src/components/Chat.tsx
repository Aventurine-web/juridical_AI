import { useEffect, useRef, useState } from "react"
import { ArrowUp } from "lucide-react"
import { askAgent, probeAdk, mockReplyFor } from "@/lib/adk"
import { cn } from "@/lib/utils"

interface Msg { who: "user" | "bot"; text: string; thinking?: boolean }

// The three high-fidelity test cases the agent is graded on. Order matches the
// demo answers in adk.ts (hembud → karensavdrag → VAT).
const SUGGESTIONS = [
  "Explain the requirements for a hembudsförbehåll (first-right-of-refusal) in a Swedish AB shareholders' agreement.",
  "How do I calculate karensavdrag for a part-time employee under current Swedish rules?",
  "VAT for a Swedish company selling SaaS B2B in Norway vs B2C in Germany?",
]
const SHORT_LABELS = ["Hembudsförbehåll", "Karensavdrag", "SaaS VAT abroad"]

/** Render the agent's Markdown-ish answer (## headings, **bold**, bullets) nicely. */
function inline(line: string) {
  return line.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="font-semibold text-foreground">{p.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  )
}

function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => {
        if (line.startsWith("## "))
          return (
            <div key={i} className="mb-1 mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-burnt first:mt-0">
              {line.slice(3)}
            </div>
          )
        if (!line.trim()) return <div key={i} className="h-2" />
        return <div key={i} className="text-[14px] leading-relaxed">{inline(line)}</div>
      })}
    </>
  )
}

export function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      who: "bot",
      text: "Hej! Ask me a Swedish compliance question — tax, VAT, labour law or company law — and I'll give a structured, source-cited answer. Try one of the high-fidelity test cases below.",
    },
  ])
  const [input, setInput] = useState("")
  const [live, setLive] = useState(false)
  const [busy, setBusy] = useState(false)
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
        reply = mockReplyFor(q)
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

  const empty = msgs.length === 1

  return (
    <div className="flex h-[560px] flex-col overflow-hidden rounded-2xl border border-border bg-popover shadow-[0_1px_2px_rgba(26,26,26,0.04),0_24px_48px_-24px_rgba(26,26,26,0.18)] md:h-[640px]">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3.5 text-[13px] text-muted-foreground">
        <span className={cn("h-1.5 w-1.5 rounded-full", live ? "bg-primary" : "bg-muted-foreground/40")} />
        {live ? "Live · connected to your agent" : "Demo mode · run “adk api_server” to go live"}
      </div>

      <div ref={logRef} className="flex flex-1 flex-col gap-3.5 overflow-y-auto px-5 py-5">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={cn(
              "whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[14.5px] leading-relaxed",
              m.who === "user"
                ? "max-w-[85%] self-end rounded-br-md bg-primary text-primary-foreground"
                : "max-w-[94%] self-start rounded-bl-md bg-card text-card-foreground",
              m.thinking && "text-muted-foreground",
            )}
          >
            {m.who === "bot" && !m.thinking ? <RichText text={m.text} /> : m.text}
          </div>
        ))}
      </div>

      {/* Example questions — prominent in the empty state, compact chips afterwards */}
      {empty ? (
        <div className="px-5 pb-3">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-burnt">
            Try a real test case
          </div>
          <div className="flex flex-col gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-xl border border-border bg-background px-4 py-2.5 text-left text-[13.5px] leading-snug text-foreground/90 transition hover:border-primary hover:bg-secondary"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 px-5 pb-3">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-border bg-background px-3.5 py-1.5 text-[12.5px] text-muted-foreground transition hover:border-primary hover:text-foreground"
            >
              {SHORT_LABELS[i]}
            </button>
          ))}
        </div>
      )}

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
          placeholder="Ask about Swedish tax, VAT, labour law or company law…"
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
