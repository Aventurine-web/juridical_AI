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

/** Scripted fallback so the page demos well even with no backend running.
 *  Mirrors the agent's evidence-first 5-section format. */
export const MOCK_REPLIES = [
  `## Answer
Yes — the shareholder agreement contains a hembudsförbehåll (first-right-of-refusal).

## Evidence from Documents
"§4 Hembudsförbehåll (förköpsrätt): Önskar en Aktieägare överlåta sina aktier till tredje man ska aktierna först hembjudas till övriga Aktieägare…"
— sample_aktieagaravtal.pdf, page 1

## Official Sources
Bolagsverket — hembudsförbehåll in the bolagsordning: bolagsverket.se …

## Recommendation
Confirm the 30-day window matches your bolagsordning so the clause is enforceable.

## Disclaimer
General information, not legal advice. (Preview — run \`adk api_server\` for a live answer.)`,
  `## Answer
The consulting agreement caps the client's liability and assigns all IP to the client.

## Evidence from Documents
"§3 Ansvarsbegränsning … begränsat till … de senaste tre (3) månaderna." — sample_konsultavtal.pdf, page 1

## Recommendation
Review §8's penalty (vite, 100 000 kr) against the capped liability — they conflict.

## Disclaimer
General information, not legal advice. (Preview — run \`adk api_server\` for a live answer.)`,
]
