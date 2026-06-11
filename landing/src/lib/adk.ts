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

/** Scripted fallbacks so the page demos well even with no backend running.
 *  Each mirrors the live agent's evidence-first 5-section format and answers
 *  one of the three high-fidelity test cases. Order matches the Chat examples. */
export const MOCK_REPLIES = [
  // 1 — hembudsförbehåll requirements in a Swedish AB
  `## Answer
A hembudsförbehåll (right of first refusal on share transfers) only binds the company and new owners when it is written into the **bolagsordning** — under the Swedish Companies Act (Aktiebolagslagen 2005:551, 4 kap. 27–36 §§). A shareholders' agreement (aktieägaravtal) can add or strengthen it, but a clause that sits *only* in the agreement binds the parties contractually — not third parties or the share register.

## Evidence from Documents
No document needed for this question. (Ask about a specific uploaded contract and I'll quote the exact clause + page.)

## Official Sources
- Aktiebolagslagen (2005:551) 4 kap. 27–36 §§ — hembudsförbehåll · riksdagen.se
- Bolagsverket — förbehåll i bolagsordningen (hembud, förköp, samtycke) · bolagsverket.se

## Recommendation
A valid hembud in the bolagsordning should state: (1) which transfers trigger it, (2) who may buy and in what order, (3) how the price is set, and (4) the time window to claim and pay. Put it in the bolagsordning for third-party effect, and mirror the terms in the aktieägaravtal so they don't conflict.

## Disclaimer
General information, not legal advice. (Preview — run \`adk api_server\` for a live, source-checked answer.)`,

  // 2 — karensavdrag for a part-time employee
  `## Answer
Since 2019 the karensdag was replaced by a **karensavdrag**: a fixed deduction equal to **20% of the sjuklön the employee would earn in an average week**. Because it's a percentage of a whole week, a part-time employee automatically gets a proportionally smaller deduction — the same 20%, applied to their lower weekly hours.

## Evidence from Documents
No document needed for this question.

## Official Sources
- Sjuklönelagen (1991:1047) — karensavdrag · riksdagen.se
- Försäkringskassan / verksamt.se — sjuklön och karensavdrag · forsakringskassan.se

## Recommendation
Formula: **karensavdrag = 20% × weekly sjuklön**, where sjuklön = 80% of the pay for the scheduled hours.
Worked example — 20 h/week at 150 kr/h:
• Weekly sjuklön = 0.80 × (20 × 150) = 2 400 kr
• Karensavdrag = 0.20 × 2 400 = **480 kr** (taken from the first sick-pay period).
State your assumptions (hours, hourly rate) and check any kollektivavtal, which can change the method.

## Disclaimer
General information, not legal advice. (Preview — run \`adk api_server\` for a live, source-checked answer.)`,

  // 3 — VAT on SaaS: B2B Norway vs B2C Germany
  `## Answer
SaaS is an electronically supplied service, so the place-of-supply rules decide where VAT (moms) is due:
• **B2B customer in Norway (non-EU):** outside Swedish VAT. Invoice with no Swedish moms; the Norwegian business self-accounts for Norwegian VAT (MVA) under reverse charge.
• **B2C customer in Germany (EU):** German VAT applies at the German rate. You collect it and declare it through the EU **OSS (One Stop Shop)** via Skatteverket.

## Evidence from Documents
No document needed for this question.

## Official Sources
- Skatteverket — moms på digitala tjänster / försäljning till utlandet · skatteverket.se
- Skatteverket — One Stop Shop (OSS) för tjänster till privatpersoner i EU · skatteverket.se

## Recommendation
• Norway B2B: keep proof the customer is a business (org.nr) outside the EU; report it as an export of services in your VAT return.
• Germany B2C: register for OSS and charge German VAT. Note the EU-wide €10 000 threshold for digital B2C sales — below it you may charge Swedish VAT instead.
Confirm current rates and thresholds — they change yearly.

## Disclaimer
General information, not legal advice. (Preview — run \`adk api_server\` for a live, source-checked answer.)`,
]

const MOCK_FALLBACK = `## Answer
This is a preview of Vorker's evidence-first format. Connect the agent and I'll search Skatteverket, Bolagsverket and verksamt.se live, read the full source, and answer your exact question with citations.

## Go live
1. \`cp .env.example .env\` and add your GOOGLE_API_KEY (+ TAVILY_API_KEY)
2. \`./dev.sh\` — the status dot turns rose when connected

## Try a built-in example
Tap one of the example questions below for a full, sourced answer.

## Disclaimer
General information, not legal advice.`

/** Pick the demo answer that best matches a question (used when offline). */
export function mockReplyFor(text: string): string {
  const q = text.toLowerCase()
  if (q.includes("hembud") || q.includes("aktieägaravtal") || q.includes("shareholder")) return MOCK_REPLIES[0]
  if (q.includes("karensavdrag") || q.includes("part-time") || q.includes("sjuk")) return MOCK_REPLIES[1]
  if (q.includes("vat") || q.includes("moms") || q.includes("saas")) return MOCK_REPLIES[2]
  return MOCK_FALLBACK
}
