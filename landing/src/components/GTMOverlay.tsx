import { useEffect } from "react"

/* ============================================================
   Vorker Compliance AI — Go-To-Market strategy overlay.
   A product-style (Linear / Stripe / Notion) full-screen view
   of the business case. Reuses the warm editorial theme tokens.
   ============================================================ */

const HERO_KPIS = [
  { stat: "1.2M+", label: "Swedish SMEs (TAM)" },
  { stat: "300k", label: "Reachable SAM" },
  { stat: "5,000", label: "Paying users · target" },
  { stat: "15 MSEK", label: "ARR · year 3 target" },
]

// The pitch, broken into the four things a viewer needs instantly.
const PITCH = [
  { icon: "🧭", k: "What it is", v: "An AI agent for Swedish business compliance that cites Skatteverket, Bolagsverket, Verksamt and Arbetsmiljöverket on every answer." },
  { icon: "🇸🇪", k: "Who it's for", v: "Swedish SMEs — freelancers, small AB:s and startups — with no in-house tax or legal team." },
  { icon: "⚖️", k: "The problem", v: "Compliance questions are high-stakes. A wrong answer on VAT or labour law is a real, costly liability." },
  { icon: "🎯", k: "Why it's different", v: "Generic AI guesses from global data. Vorker is grounded in Swedish official sources — and refuses to invent." },
]

// Real questions Swedish SMEs ask, answered from the source.
const EXAMPLES = [
  {
    q: "How do I calculate karensavdrag for a part-time employee?",
    sources: ["Försäkringskassan", "Verksamt.se", "Sjuklönelagen (1991:1047)"],
    a: "Karensavdrag is a fixed 20% of one average week's sjuklön — not a whole day. For a part-time employee it's based on their scheduled hours, so the deduction scales down with the contract: same percentage, smaller krona amount.",
  },
  {
    q: "What are the VAT implications of selling SaaS to Germany vs Norway?",
    sources: ["Skatteverket — moms", "EU reverse charge (B2B)", "Export of services"],
    a: "B2B to Germany (EU): no Swedish VAT — reverse charge, the German buyer accounts for it. Norway is outside the EU: treated as an export of services, also no Swedish VAT. B2C is different — EU sales use OSS at the customer's local rate.",
  },
  {
    q: "What are the requirements for a shareholder agreement in a Swedish AB?",
    sources: ["Bolagsverket", "Aktiebolagslagen (2005:551)", "Verksamt.se"],
    a: "A shareholders' agreement isn't required by law and isn't filed with Bolagsverket — it binds the owners contractually. Anything that must bind the company (e.g. hembud) belongs in the bolagsordning. Agreements typically cover pre-emption, share transfers, voting and exit.",
  },
]

const OPPORTUNITY = [
  { icon: "🧑‍💼", t: "SME owners", d: "1–50 employees, no in-house legal or tax team." },
  { icon: "⚠️", t: "Compliance problems", d: "VAT, labour law, company law, bookkeeping, permits." },
  { icon: "🤖", t: "Generic AI fails", d: "ChatGPT & Gemini aren't Sweden-specific or sourced." },
  { icon: "✅", t: "Vorker AI solves", d: "Verified answers from Swedish authority sources." },
]

const SEGMENTS = [
  { icon: "👨‍💻", t: "Freelancer", tag: "Solo & consultant", items: ["VAT", "F-tax", "Invoicing", "Contracts"] },
  { icon: "🏢", t: "Small business", tag: "Limited company", items: ["HR questions", "Labour law", "Compliance", "Payroll"] },
  { icon: "🚀", t: "Startup", tag: "Newly founded", items: ["Shareholder agreements", "Company structure", "Permits", "Reporting"] },
]

const VALUE_ROWS = [
  ["Google + ChatGPT", "A Sweden-trained AI expert"],
  ["Hours of searching", "Answers in seconds"],
  ["Generic, global answers", "Sweden-specific guidance"],
  ["Uncertain, high risk", "Verified, sourced, low risk"],
  ["Thousands of kr in fees", "From 0 kr — freemium"],
]

const ROADMAP = [
  { q: "Q1", t: "MVP", d: "Launch the VAT, company-law & labour-law agents.", milestone: "100 pilot users" },
  { q: "Q2", t: "Pilot customers", d: "Validate with real SMEs and refine the sources.", milestone: "Product-market fit" },
  { q: "Q3", t: "Partner network", d: "Accounting firms, incubators, Nyföretagarcentrum.", milestone: "500 users" },
  { q: "Q4", t: "Scale", d: "Broaden coverage and reach more SMEs.", milestone: "5,000 users" },
]

const PRICING = [
  { name: "Free", price: "0 kr", cadence: "/mo", tagline: "Try it out", features: ["10 questions / month", "Core compliance answers", "Source citations"], featured: false },
  { name: "Pro", price: "299 kr", cadence: "/mo", tagline: "⭐ Most popular", features: ["Unlimited questions", "Document support", "Advanced compliance"], featured: true },
  { name: "Business", price: "999 kr", cadence: "/mo", tagline: "For teams", features: ["Multiple users", "Reports & exports", "Integrations"], featured: false },
]

// Adoption journey — user behaviour, not marketing channels.
const JOURNEY = [
  { t: "Compliance question", d: "An owner hits a real question — karensavdrag, VAT abroad, a shareholder clause." },
  { t: "Verified answer", d: "Vorker answers and shows the official source it relied on." },
  { t: "Trust established", d: "The citation is checkable, so the answer is trusted — not guessed." },
  { t: "Account creation", d: "They sign up to keep asking and to save their history." },
  { t: "Recurring usage", d: "Compliance questions recur monthly — Vorker becomes the default first stop." },
  { t: "Subscription", d: "At the free-tier ceiling, recurring value converts to a paid plan." },
]

// Positioning — Y: compliance accuracy / risk reduction, X: speed & cost efficiency. (0–100)
const COMPETITORS = [
  { name: "Vorker", x: 84, y: 86, star: true },
  { name: "Law firms", x: 14, y: 90, star: false },
  { name: "ChatGPT", x: 82, y: 28, star: false },
  { name: "Gemini", x: 72, y: 20, star: false },
]

const BMC = [
  { t: "Customer segments", items: ["SMEs (1–50)", "Entrepreneurs", "Startups"] },
  { t: "Value proposition", items: ["Verified legal answers", "Swedish expertise", "Time saved"] },
  { t: "Channels", items: ["LinkedIn", "Website / SEO", "Partners"] },
  { t: "Customer relationships", items: ["Self-service", "Onboarding", "Support"] },
  { t: "Revenue streams", items: ["Subscriptions", "Freemium → Pro", "Business tier"] },
  { t: "Key resources", items: ["AI model", "Regulatory data", "Dev team"] },
  { t: "Key partners", items: ["Skatteverket data", "Bolagsverket data", "Accounting firms"] },
]

const METRICS = [
  { stat: "5,000", label: "Registered users" },
  { stat: "500", label: "Paying customers" },
  { stat: "10%", label: "Conversion rate" },
  { stat: "<5%", label: "Monthly churn" },
  { stat: ">50", label: "NPS" },
  { stat: "<500 kr", label: "CAC" },
]

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-semibold uppercase tracking-[0.2em] text-burnt">{children}</div>
}

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="max-w-2xl">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="font-display mt-4 text-[clamp(1.75rem,3.5vw,2.6rem)] leading-[1.12]">{title}</h2>
      {sub && <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{sub}</p>}
    </div>
  )
}

export function GTMOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] overflow-y-auto bg-background"
      onClick={onClose}
    >
      {/* Warm gradient wash — fixed to viewport, sits above the solid bg, below content */}
      <div className="page-bg pointer-events-none fixed inset-0" />

      {/* Sticky bar */}
      <div className="sticky top-0 z-10 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="font-display text-lg tracking-tight">
            Vorker <span className="text-muted-foreground">· Market Strategy</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close market strategy"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-lg text-foreground transition hover:bg-secondary"
          >
            ×
          </button>
        </div>
      </div>

      {/* Body — stop propagation so clicks inside don't close */}
      <div className="relative z-[1] mx-auto max-w-5xl px-6 pb-28" onClick={(e) => e.stopPropagation()}>
        {/* 1. HERO */}
        <section className="fade-up pt-16 md:pt-20">
          <Eyebrow>Go-To-Market Strategy</Eyebrow>
          <h1 className="font-display mt-5 text-[clamp(2.5rem,6vw,4rem)] leading-[1.05]">
            Vorker Compliance AI
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Trusted, source-backed answers to Swedish tax, labour-law and company-law questions —
            for the SMEs that generic AI can't safely serve.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HERO_KPIS.map((k) => (
              <div key={k.label} className="rounded-2xl bg-card px-6 py-7">
                <div className="font-display text-3xl">{k.stat}</div>
                <p className="mt-2 text-sm leading-snug text-muted-foreground">{k.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. THE PITCH — what / who / problem / why different. The centerpiece. */}
        <section className="fade-up-2 mt-12">
          <div className="rounded-3xl bg-card p-8 ring-1 ring-border md:p-12">
            <Eyebrow>The pitch</Eyebrow>
            <h2 className="font-display mt-5 max-w-3xl text-[clamp(2.1rem,4.8vw,3.4rem)] leading-[1.06]">
              Trusted answers where generic AI <span className="text-primary">guesses.</span>
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Vorker answers Swedish tax, labour-law and company-law questions and backs every
              answer with the official source — so an SME owner can act on it with confidence.
            </p>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {PITCH.map((p) => (
                <div key={p.k} className="rounded-2xl bg-background/70 p-6 ring-1 ring-border">
                  <div className="text-2xl">{p.icon}</div>
                  <div className="mt-4 text-xs font-semibold uppercase tracking-[0.15em] text-burnt">
                    {p.k}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/90">{p.v}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. EXAMPLE COMPLIANCE QUESTIONS */}
        <section className="border-t border-border/70 pt-16 mt-20">
          <SectionHead
            eyebrow="What it actually answers"
            title="Example compliance questions"
            sub="Real questions Swedish SMEs ask — each answered from the official source, not guessed."
          />
          <div className="mt-12 space-y-5">
            {EXAMPLES.map((e) => (
              <div key={e.q} className="rounded-2xl border border-border bg-card/60 p-6 md:p-7">
                <div className="flex items-start gap-3">
                  <span className="font-display text-lg text-primary">Q</span>
                  <h3 className="font-display text-lg leading-snug">{e.q}</h3>
                </div>
                <div className="mt-6 grid gap-6 md:grid-cols-[0.8fr_1.2fr]">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.15em] text-burnt">
                      Sources consulted
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {e.sources.map((s) => (
                        <span key={s} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.15em] text-burnt">
                      Verified answer
                    </div>
                    <p className="mt-3 text-[15px] leading-relaxed text-foreground/90">{e.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[13px] text-muted-foreground">
            General information grounded in official sources — not legal or tax advice.
          </p>
        </section>

        {/* 4. MARKET OPPORTUNITY */}
        <section className="border-t border-border/70 pt-16 mt-20">
          <SectionHead eyebrow="The opportunity" title="A real, underserved market" />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {OPPORTUNITY.map((o, i) => (
              <div key={o.t} className="relative rounded-2xl border border-border bg-card/60 px-6 py-7">
                <div className="text-2xl">{o.icon}</div>
                <h3 className="font-display mt-4 text-lg">{o.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{o.d}</p>
                {i < OPPORTUNITY.length - 1 && (
                  <span className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-xl text-primary lg:block">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 5. TARGET SEGMENTS */}
        <section className="border-t border-border/70 pt-16 mt-20">
          <SectionHead eyebrow="Who we serve" title="Three core segments" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {SEGMENTS.map((s) => (
              <div key={s.t} className="rounded-2xl border border-border bg-card/60 p-7">
                <div className="text-3xl">{s.icon}</div>
                <h3 className="font-display mt-4 text-xl">{s.t}</h3>
                <div className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-burnt">
                  {s.tag}
                </div>
                <ul className="mt-5 space-y-2">
                  {s.items.map((it) => (
                    <li key={it} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="h-1 w-1 rounded-full bg-primary" />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 6. VALUE PROPOSITION */}
        <section className="border-t border-border/70 pt-16 mt-20">
          <SectionHead eyebrow="Value proposition" title="From uncertainty to verified answers" />
          <div className="mt-12 overflow-hidden rounded-2xl border border-border">
            <div className="grid grid-cols-2 border-b border-border bg-secondary/60 text-sm font-semibold">
              <div className="px-6 py-4 text-muted-foreground">Today</div>
              <div className="px-6 py-4">With Vorker</div>
            </div>
            {VALUE_ROWS.map(([before, after], i) => (
              <div
                key={i}
                className="grid grid-cols-2 border-b border-border/60 last:border-0 text-sm"
              >
                <div className="px-6 py-4 text-muted-foreground line-through decoration-border">
                  {before}
                </div>
                <div className="px-6 py-4 font-medium">{after}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. ADOPTION JOURNEY */}
        <section className="border-t border-border/70 pt-16 mt-20">
          <SectionHead
            eyebrow="Adoption journey"
            title="How trust turns into a subscription"
            sub="Growth is driven by user behaviour, not ad spend: a trusted answer is what earns the next visit."
          />
          <div className="mt-12 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card/60">
            {JOURNEY.map((s, i) => (
              <div key={s.t} className="flex items-start gap-5 px-6 py-5">
                <div className="font-display mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-base text-primary">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-display text-lg">{s.t}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. COMPETITIVE POSITIONING */}
        <section className="border-t border-border/70 pt-16 mt-20">
          <SectionHead
            eyebrow="Positioning"
            title="Accurate answers, at software speed"
            sub="Law firms are accurate but slow and costly. Generic AI is fast and cheap but guesses. Vorker is the only one that's both accurate and instant."
          />
          <div className="relative mt-12 aspect-[4/3] w-full max-w-2xl rounded-2xl border border-border bg-card/40 p-4 sm:aspect-[16/9]">
            {/* axes */}
            <div className="absolute inset-x-10 top-1/2 h-px -translate-y-1/2 bg-border" />
            <div className="absolute inset-y-10 left-1/2 w-px -translate-x-1/2 bg-border" />
            <span className="absolute left-1/2 top-3 -translate-x-1/2 text-xs text-muted-foreground">
              Compliance accuracy & risk reduction ↑
            </span>
            <span className="absolute bottom-3 right-4 text-xs text-muted-foreground">
              Speed & cost efficiency →
            </span>
            {COMPETITORS.map((c) => (
              <div
                key={c.name}
                className="absolute flex -translate-x-1/2 translate-y-1/2 flex-col items-center"
                style={{ left: `${c.x}%`, bottom: `${c.y}%` }}
              >
                <span
                  className={
                    "flex h-3 w-3 items-center justify-center rounded-full " +
                    (c.star ? "bg-primary ring-4 ring-primary/25" : "bg-muted-foreground")
                  }
                />
                <span
                  className={
                    "mt-1.5 whitespace-nowrap text-xs " +
                    (c.star ? "font-semibold text-foreground" : "text-muted-foreground")
                  }
                >
                  {c.star ? "⭐ " : ""}
                  {c.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 9. GTM ROADMAP */}
        <section className="border-t border-border/70 pt-16 mt-20">
          <SectionHead eyebrow="Execution" title="A 12-month roadmap" />
          <div className="mt-12 flex gap-5 overflow-x-auto pb-4">
            {ROADMAP.map((r) => (
              <div key={r.q} className="min-w-[15rem] flex-1 rounded-2xl border border-border bg-card/60 p-6">
                <div className="font-display text-2xl text-primary">{r.q}</div>
                <h3 className="font-display mt-2 text-xl">{r.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.d}</p>
                <div className="mt-5 inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                  {r.milestone}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 10. REVENUE MODEL */}
        <section className="border-t border-border/70 pt-16 mt-20">
          <SectionHead eyebrow="Revenue model" title="Freemium that converts" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PRICING.map((p) => (
              <div
                key={p.name}
                className={
                  "rounded-2xl p-7 " +
                  (p.featured
                    ? "bg-card ring-2 ring-primary"
                    : "border border-border bg-card/60")
                }
              >
                <div className="text-xs font-semibold uppercase tracking-[0.15em] text-burnt">
                  {p.tagline}
                </div>
                <h3 className="font-display mt-3 text-xl">{p.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-3xl">{p.price}</span>
                  <span className="text-sm text-muted-foreground">{p.cadence}</span>
                </div>
                <ul className="mt-6 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="text-primary">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 11. BUSINESS MODEL CANVAS */}
        <section className="border-t border-border/70 pt-16 mt-20">
          <SectionHead eyebrow="Business model" title="The canvas at a glance" />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BMC.map((b) => (
              <div key={b.t} className="rounded-2xl border border-border bg-card/60 p-6">
                <h3 className="font-display text-base">{b.t}</h3>
                <ul className="mt-3 space-y-1.5">
                  {b.items.map((it) => (
                    <li key={it} className="text-sm text-muted-foreground">
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 12. SUCCESS METRICS */}
        <section className="border-t border-border/70 pt-16 mt-20">
          <SectionHead eyebrow="Success metrics" title="Year-one targets" />
          <div className="mt-12 grid gap-4 grid-cols-2 lg:grid-cols-3">
            {METRICS.map((m) => (
              <div key={m.label} className="rounded-2xl bg-card px-6 py-7 text-center">
                <div className="font-display text-3xl text-primary">{m.stat}</div>
                <p className="mt-2 text-sm text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
