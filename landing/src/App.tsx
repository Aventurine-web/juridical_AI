import { IridescentOrb } from "@/components/IridescentOrb"
import { Chat } from "@/components/Chat"

function goTo(id: string, focusChat = false) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  if (focusChat) setTimeout(() => document.getElementById("chat-input")?.focus(), 550)
}

const NAV = [
  { id: "agent", label: "The Copilot" },
  { id: "how", label: "How it works" },
  { id: "capabilities", label: "Capabilities" },
  { id: "outcomes", label: "Outcomes" },
]

const LAYERS = [
  { n: "01", t: "Your documents", d: "Contracts, agreements, tax papers — read page by page, with the exact clause and page number quoted back." },
  { n: "02", t: "Official sources", d: "Every legal or fiscal claim is grounded in Skatteverket, Bolagsverket and verksamt.se — and cited." },
  { n: "03", t: "Swedish legislation", d: "Relevant company law and authoritative legal sources, brought in where they matter." },
]

const CAPABILITIES = [
  { t: "Clause extraction", d: "Finds the relevant clause in your document — e.g. a hembudsförbehåll — and quotes it verbatim." },
  { t: "Exact citations", d: "Every document claim carries the file name and page number. No vague paraphrase." },
  { t: "Source comparison", d: "Checks your document against current official Swedish guidance and flags discrepancies." },
  { t: "Risk highlighting", d: "Surfaces obligations, liability caps, penalties and missing protections." },
  { t: "Swedish or English", d: "Ask in either language; it answers in yours, with Swedish legal terms intact." },
  { t: "Refuses to guess", d: "If a clause isn't found or a rule may have changed, it says so — never invents." },
]

const OUTCOMES = [
  { stat: "Page-cited", label: "Every answer points to the exact clause and page — defensible, not hand-wavy." },
  { stat: "3 sources", label: "Grounded in Skatteverket, Bolagsverket and verksamt.se." },
  { stat: "Minutes", label: "From a 20-page contract to the clause you actually needed." },
]

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-semibold uppercase tracking-[0.2em] text-burnt">{children}</div>
}

export default function App() {
  return (
    <div className="page-bg min-h-full">
      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="font-display text-xl tracking-tight">Vorker</div>
          <div className="hidden gap-9 md:flex">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => goTo(n.id)} className="text-sm text-muted-foreground transition hover:text-foreground">
                {n.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => goTo("agent", true)}
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Try the AI Agent
          </button>
        </div>
      </nav>

      {/* HERO */}
      <header className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-16 md:min-h-[calc(100vh-4rem)] md:grid-cols-[1.05fr_0.95fr] md:gap-10 md:pb-10">
        <div>
          <div className="fade-up">
            <Eyebrow>AI Compliance Copilot · Sweden</Eyebrow>
          </div>
          <h1 className="fade-up-2 font-display mt-6 text-[clamp(2.5rem,6.5vw,4.5rem)] leading-[1.05]">
            Upload Documents.<br className="hidden sm:block" /> Get Answers With Evidence.
          </h1>
          <p className="fade-up-3 mt-7 max-w-lg text-lg leading-relaxed text-muted-foreground">
            An AI copilot for Swedish businesses that combines official compliance sources
            with document intelligence.
          </p>
          <div className="fade-up-3 mt-9 flex flex-wrap items-center gap-3">
            <button
              onClick={() => goTo("agent", true)}
              className="rounded-full bg-primary px-6 py-3 text-[15px] font-medium text-primary-foreground transition hover:opacity-90"
            >
              Try the AI Agent
            </button>
            <button
              onClick={() => goTo("how")}
              className="rounded-full border border-border px-6 py-3 text-[15px] font-medium text-foreground transition hover:bg-secondary"
            >
              How it works
            </button>
          </div>
          <p className="fade-up-3 mt-7 font-display text-lg italic text-foreground/80">
            Most AI tools generate answers — this one proves them.
          </p>
          <div className="fade-up-3 mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
            <span className="uppercase tracking-wider">Grounded in</span>
            <span className="font-medium text-foreground">Skatteverket</span>·
            <span className="font-medium text-foreground">Bolagsverket</span>·
            <span className="font-medium text-foreground">verksamt.se</span>
          </div>
        </div>
        <div className="h-[clamp(22rem,54vh,36rem)] w-full">
          <IridescentOrb onActivate={() => goTo("agent", true)} />
        </div>
      </header>

      {/* THE COPILOT — interactive */}
      <section id="agent" className="border-t border-border/70 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <Eyebrow>The copilot</Eyebrow>
            <h2 className="font-display mt-5 text-[clamp(2rem,4vw,3rem)] leading-[1.1]">
              Ask about contracts, agreements and regulations
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              This isn't a screenshot. Ask a real question about the sample contracts and watch the
              copilot quote the exact clause, with its page, and check it against official guidance.
            </p>
          </div>

          <div className="mt-12 grid items-start gap-10 md:grid-cols-[1.1fr_0.9fr]">
            <Chat />
            <div className="md:pt-2">
              <h3 className="font-display text-xl">A live demo, not a mock-up</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                The copilot is a Google ADK <span className="text-foreground">root_agent</span> with
                document-reading tools. Connect it and this panel streams real, cited answers.
              </p>
              <ol className="mt-6 space-y-4">
                {[
                  ["Start the agent", "From the repo root: adk api_server"],
                  ["Open the page", "npm run dev — the status dot turns rose when connected"],
                  ["Ask about a clause", "It quotes the document + page, then cites official sources"],
                ].map(([t, d], i) => (
                  <li key={i} className="flex gap-4">
                    <span className="font-display mt-0.5 text-lg text-primary">{i + 1}</span>
                    <span>
                      <span className="font-medium">{t}</span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">{d}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — 3 evidence layers + format showcase */}
      <section id="how" className="border-t border-border/70 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="font-display mt-5 text-[clamp(2rem,4vw,3rem)] leading-[1.1]">
              Three layers of evidence
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              The copilot reasons across your documents and the authoritative Swedish sources —
              then shows its working.
            </p>
          </div>
          <div className="mt-14 grid gap-x-12 gap-y-12 sm:grid-cols-3">
            {LAYERS.map((s) => (
              <div key={s.n} className="border-t border-border pt-5">
                <div className="font-display text-2xl text-primary">{s.n}</div>
                <h3 className="font-display mt-3 text-xl">{s.t}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>

          {/* Evidence-format showcase */}
          <div className="mt-16 overflow-hidden rounded-2xl border border-border bg-popover">
            <div className="border-b border-border bg-card px-6 py-3 text-sm text-muted-foreground">
              Every answer follows the same structure
            </div>
            <div className="grid gap-px bg-border sm:grid-cols-2">
              {[
                ["Answer", "Yes — the agreement contains a hembudsförbehåll (first-right-of-refusal)."],
                ["Evidence from Documents", "“§4 Hembudsförbehåll … aktierna ska först hembjudas till övriga Aktieägare …”  — sample_aktieagaravtal.pdf, p.1"],
                ["Official Sources", "Bolagsverket — hembud in the bolagsordning · bolagsverket.se/…"],
                ["Recommendation", "Confirm the 30-day window matches your bolagsordning so it's enforceable."],
              ].map(([h, b]) => (
                <div key={h} className="bg-popover p-6">
                  <div className="font-display text-sm text-primary">## {h}</div>
                  <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">{b}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-border px-6 py-3 text-[13px] text-muted-foreground">
              Disclaimer · General information, not legal or tax advice.
            </div>
          </div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section id="capabilities" className="border-t border-border/70 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <Eyebrow>What it does</Eyebrow>
            <h2 className="font-display mt-5 text-[clamp(2rem,4vw,3rem)] leading-[1.1]">
              Capabilities of the copilot
            </h2>
          </div>
          <div className="mt-14 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((c) => (
              <div key={c.t}>
                <div className="h-px w-10 bg-primary" />
                <h3 className="font-display mt-4 text-xl">{c.t}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OUTCOMES */}
      <section id="outcomes" className="border-t border-border/70 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <Eyebrow>Outcomes</Eyebrow>
            <h2 className="font-display mt-5 text-[clamp(2rem,4vw,3rem)] leading-[1.1]">
              Decisions you can defend
            </h2>
          </div>
          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            {OUTCOMES.map((o) => (
              <div key={o.stat} className="border-t border-border pt-6">
                <div className="font-display text-4xl">{o.stat}</div>
                <p className="mt-3 leading-relaxed text-muted-foreground">{o.label}</p>
              </div>
            ))}
          </div>

          {/* TODO: swap for a real customer quote / example */}
          <figure className="mt-16 max-w-3xl">
            <blockquote className="font-display text-[clamp(1.5rem,3vw,2.1rem)] leading-snug">
              “For a business owner, a wrong answer about VAT or labour law is a liability.
              This is the first AI I'd actually trust with a contract — because it shows me the clause.”
            </blockquote>
            <figcaption className="mt-5 text-sm text-muted-foreground">
              Illustrative · replace with a real example after launch
            </figcaption>
          </figure>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-6xl rounded-3xl bg-card px-8 py-20 text-center md:py-28">
          <h2 className="font-display mx-auto max-w-2xl text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.08]">
            Stop guessing. Start proving.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            The compliance copilot that reads your documents and cites Sweden's official sources.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => goTo("agent", true)}
              className="rounded-full bg-primary px-7 py-3.5 text-[15px] font-medium text-primary-foreground transition hover:opacity-90"
            >
              Try the AI Agent
            </button>
            <button
              onClick={() => goTo("how")}
              className="rounded-full border border-border bg-background px-7 py-3.5 text-[15px] font-medium transition hover:bg-secondary"
            >
              How it works
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/70 py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 text-sm text-muted-foreground">
          <div className="font-display text-base text-foreground">Vorker</div>
          <div>Built on Google ADK + Gemini · Compliance Copilot · 2026</div>
        </div>
      </footer>
    </div>
  )
}
