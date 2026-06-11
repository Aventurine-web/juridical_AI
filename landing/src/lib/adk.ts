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
  // 1 — hembudsförbehåll i ett svenskt AB
  `## Svar
Ett hembudsförbehåll binder bolaget och nya ägare först när det är infört i **bolagsordningen** — enligt aktiebolagslagen (2005:551), 4 kap. 27–36 §§. Ett aktieägaravtal kan lägga till eller förstärka det, men ett villkor som bara står i avtalet binder parterna avtalsrättsligt — inte tredje man eller aktieboken.

## Underlag från dokument
Inget dokument behövs för den här frågan. (Fråga om ett uppladdat avtal så citerar jag exakt klausul + sida.)

## Officiella källor
- Aktiebolagslagen (2005:551) 4 kap. 27–36 §§ — hembudsförbehåll · riksdagen.se
- Bolagsverket — förbehåll i bolagsordningen (hembud, förköp, samtycke) · bolagsverket.se

## Rekommendation
Ett giltigt hembud i bolagsordningen bör ange: (1) vilka överlåtelser som utlöser det, (2) vem som får lösa in och i vilken ordning, (3) hur priset bestäms, och (4) tidsfristen för att begära och betala. Lägg det i bolagsordningen för verkan mot tredje man, och spegla villkoren i aktieägaravtalet så att de inte krockar.

## Friskrivning
Allmän information, inte juridisk eller skatterådgivning. (Förhandsvisning — kör \`adk api_server\` för ett live-svar med källkontroll.)`,

  // 2 — karensavdrag för en deltidsanställd
  `## Svar
Sedan 2019 ersattes karensdagen av ett **karensavdrag**: ett fast avdrag på **20 % av den sjuklön den anställde skulle tjäna under en genomsnittlig vecka**. Eftersom det är en procentandel av en hel vecka får en deltidsanställd automatiskt ett proportionellt mindre avdrag — samma 20 %, fast på de lägre veckotimmarna.

## Underlag från dokument
Inget dokument behövs för den här frågan.

## Officiella källor
- Lagen om sjuklön (1991:1047) — karensavdrag · riksdagen.se
- Försäkringskassan / verksamt.se — sjuklön och karensavdrag · forsakringskassan.se

## Rekommendation
Formel: **karensavdrag = 20 % × veckosjuklönen**, där sjuklön = 80 % av lönen för de schemalagda timmarna.
Räkneexempel — 20 tim/vecka à 150 kr/tim:
• Veckosjuklön = 0,80 × (20 × 150) = 2 400 kr
• Karensavdrag = 0,20 × 2 400 = **480 kr** (dras från den första sjukperioden).
Ange dina antaganden (timmar, timlön) och kontrollera ev. kollektivavtal, som kan ändra metoden.

## Friskrivning
Allmän information, inte juridisk eller skatterådgivning. (Förhandsvisning — kör \`adk api_server\` för ett live-svar med källkontroll.)`,

  // 3 — moms på SaaS: B2B Norge vs B2C Tyskland
  `## Svar
SaaS är en elektroniskt tillhandahållen tjänst, så reglerna om beskattningsland avgör var momsen ska redovisas:
• **B2B-kund i Norge (utanför EU):** utanför svensk moms. Du fakturerar utan svensk moms; det norska företaget redovisar norsk moms (MVA) själv genom omvänd skattskyldighet.
• **B2C-kund i Tyskland (inom EU):** tysk moms gäller med tysk skattesats. Du tar ut den och redovisar via EU:s **OSS (One Stop Shop)** hos Skatteverket.

## Underlag från dokument
Inget dokument behövs för den här frågan.

## Officiella källor
- Skatteverket — moms på digitala tjänster / försäljning till utlandet · skatteverket.se
- Skatteverket — One Stop Shop (OSS) för tjänster till privatpersoner i EU · skatteverket.se

## Rekommendation
• Norge B2B: spara underlag på att kunden är ett företag (org.nr) utanför EU; redovisa som export av tjänster i momsdeklarationen.
• Tyskland B2C: registrera dig för OSS och ta ut tysk moms. Observera EU:s tröskel på 10 000 € för digital B2C-försäljning — under den kan du ta ut svensk moms i stället.
Bekräfta aktuella skattesatser och trösklar — de ändras årligen.

## Friskrivning
Allmän information, inte juridisk eller skatterådgivning. (Förhandsvisning — kör \`adk api_server\` för ett live-svar med källkontroll.)`,
]

const MOCK_FALLBACK = `## Svar
Det här är en förhandsvisning av Vorkers källbaserade format. Anslut agenten så söker jag live hos Skatteverket, Bolagsverket och verksamt.se, läser hela källan och svarar på din exakta fråga med hänvisningar.

## Kom igång live
1. \`cp .env.example .env\` och lägg in din GOOGLE_API_KEY (+ TAVILY_API_KEY)
2. \`./dev.sh\` — statusprickan blir rosa när det är anslutet

## Prova ett exempel
Tryck på en av exempelfrågorna nedan för ett fullständigt, källbelagt svar.

## Friskrivning
Allmän information, inte juridisk eller skatterådgivning.`

/** Välj det demosvar som bäst matchar en fråga (används offline). */
export function mockReplyFor(text: string): string {
  const q = text.toLowerCase()
  if (q.includes("hembud") || q.includes("aktieägaravtal") || q.includes("shareholder")) return MOCK_REPLIES[0]
  if (q.includes("karensavdrag") || q.includes("deltid") || q.includes("part-time") || q.includes("sjuk")) return MOCK_REPLIES[1]
  if (q.includes("vat") || q.includes("moms") || q.includes("saas")) return MOCK_REPLIES[2]
  return MOCK_FALLBACK
}
