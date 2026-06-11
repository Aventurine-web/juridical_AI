/**
 * Tiny client for the Google ADK `adk api_server`.
 *
 * In dev, Vite proxies "/adk/*" → http://localhost:8000 (see vite.config.ts),
 * so we avoid CORS entirely. Start the backend with `adk api_server` from the
 * repo root. If it's not running, the UI falls back to a scripted demo reply.
 */
const BASE = "/adk"
const APP = "agent" // matches the agent/ package name in the repo
const USER = "demo-user"
const SESSION = "demo-session"

/** Returns true if the ADK server is reachable. */
export async function probeAdk(): Promise<boolean> {
  try {
    const r = await fetch(`${BASE}/list-apps`, { method: "GET" })
    return r.ok
  } catch {
    return false
  }
}

async function ensureSession(): Promise<void> {
  await fetch(`${BASE}/apps/${APP}/users/${USER}/sessions/${SESSION}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  }).catch(() => {})
}

interface AdkPart { text?: string }
interface AdkEvent { content?: { parts?: AdkPart[] } }

function extractText(events: unknown): string {
  if (!Array.isArray(events)) return ""
  const out: string[] = []
  for (const ev of events as AdkEvent[]) {
    for (const p of ev?.content?.parts ?? []) {
      if (typeof p.text === "string" && p.text.trim()) out.push(p.text)
    }
  }
  return out.join("\n").trim()
}

/** Send a message to the live agent and return its text answer. */
export async function askAgent(text: string): Promise<string> {
  await ensureSession()
  const r = await fetch(`${BASE}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      appName: APP,
      userId: USER,
      sessionId: SESSION,
      newMessage: { role: "user", parts: [{ text }] },
    }),
  })
  if (!r.ok) throw new Error(`agent run failed (${r.status})`)
  return extractText(await r.json()) || "(the agent returned no text)"
}

/** Scripted fallback so the page demos well even with no backend running. */
export const MOCK_REPLIES = [
  "Here's how I'd approach it: start from the customer's job-to-be-done, define a sharp positioning statement, then pick one beachhead segment to win first. (This is a preview — run `adk api_server` and I'll work it through live with you.)",
  "A strong GTM plan moves in order: positioning → segmentation → messaging → channels → launch → measure. Connect me to the live agent (`adk api_server`) and I'll build each step around your product.",
]
