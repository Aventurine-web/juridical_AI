import { IridescentOrb } from "@/components/IridescentOrb"
import { Chat } from "@/components/Chat"

function scrollToChat() {
  document.getElementById("try")?.scrollIntoView({ behavior: "smooth" })
  setTimeout(() => document.getElementById("chat-input")?.focus(), 500)
}

const NAV = [
  { href: "#try", label: "Try it live" },
  { href: "#how", label: "How it works" },
  { href: "#gtm", label: "Go-to-market" },
  { href: "#pricing", label: "Pricing" },
]

function Card({ kicker, title, body }: { kicker: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-white/[0.04] p-6 transition hover:-translate-y-0.5 hover:border-primary/50">
      <div className="mb-3 text-[13px] font-bold text-primary">{kicker}</div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  )
}

function SectionHead({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: string }) {
  return (
    <>
      <div className="mb-3 text-[13px] uppercase tracking-[0.16em] text-accent">{eyebrow}</div>
      <h2 className="max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
      {lead && <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{lead}</p>}
    </>
  )
}

export default function App() {
  return (
    <div className="page-bg min-h-full">
      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5 font-bold tracking-tight">
            <span className="h-3 w-3 rounded-full bg-gradient-to-br from-primary to-accent shadow-[0_0_16px_var(--color-primary)]" />
            Vorker<span className="font-medium text-muted-foreground">/agent</span>
          </div>
          <div className="hidden gap-7 md:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="text-sm text-muted-foreground transition hover:text-foreground">
                {n.label}
              </a>
            ))}
          </div>
          <button
            onClick={scrollToChat}
            className="rounded-full bg-gradient-to-br from-primary to-accent px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_8px_30px_var(--color-primary)] transition hover:-translate-y-0.5"
          >
            Try the agent →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <header className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 px-6 py-10 md:grid-cols-[1.05fr_0.95fr]">
        <div className="fade-up">
          {/* TODO @16:00: tagline + headline to match the revealed mission */}
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.04] px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-accent">
            Built on Google ADK · Vorker Phase 1
          </span>
          <h1 className="text-[clamp(2.4rem,6vw,4.25rem)] font-extrabold leading-[1.02] tracking-tight">
            The AI coworker that{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-warning bg-clip-text text-transparent">
              does the work
            </span>
            , not just the chat.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            {/* TODO @16:00: one-sentence value prop */}
            Point it at a task and it researches, decides, and acts — powered by Google's Agent
            Development Kit and Gemini. This page is the pitch <em>and</em> a live demo.
          </p>
          <div className="mt-7 flex flex-wrap gap-3.5">
            <button
              onClick={scrollToChat}
              className="rounded-full bg-gradient-to-br from-primary to-accent px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_8px_30px_var(--color-primary)] transition hover:-translate-y-0.5"
            >
              ▶ Try the live agent
            </button>
            <a
              href="#gtm"
              className="rounded-full border border-border bg-white/[0.04] px-5 py-3 text-sm font-semibold transition hover:bg-white/[0.07]"
            >
              See the plan
            </a>
          </div>
        </div>
        <div className="h-[clamp(22rem,52vh,35rem)] w-full">
          <IridescentOrb onActivate={scrollToChat} />
        </div>
      </header>

      {/* TRY IT LIVE */}
      <section id="try" className="border-t border-border py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHead
            eyebrow="Live demo"
            title="Talk to the agent"
            lead="Not a mockup — this box talks to the real Google ADK agent in this repo when it's running. Click the orb up top, or just type below."
          />
          <div className="mt-11 grid items-stretch gap-7 md:grid-cols-[1.1fr_0.9fr]">
            <Chat />
            <div>
              <h3 className="mb-2.5 text-xl font-semibold">How the live demo works</h3>
              <p className="mb-3.5 text-muted-foreground">
                The agent is a standard Google ADK <code className="text-accent">root_agent</code>. Serve it over
                HTTP and this page streams its answers.
              </p>
              <div className="rounded-xl border border-dashed border-border bg-white/[0.04] p-4 font-mono text-[13px] leading-relaxed text-muted-foreground">
                # 1. start the agent API (repo root, venv active)
                <br />
                adk api_server
                <br />
                <br /># 2. run this page: <span className="text-accent">npm run dev</span>
                <br /># the status dot turns <span className="text-primary">green</span> when connected.
                <br />
                <br />
                If the agent isn't running, the demo falls back to a scripted reply.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section className="border-t border-border py-24">
        <div className="mx-auto max-w-6xl px-6">
          {/* TODO @16:00 */}
          <SectionHead
            eyebrow="The problem"
            title="Knowledge work is full of repetitive, judgment-light tasks."
            lead="People spend hours on work a capable agent could own end-to-end. We give them that agent."
          />
          <div className="mt-11 grid gap-5 md:grid-cols-3">
            <Card kicker="Before" title="Manual & slow" body="The task eats hours of focus time every week." />
            <Card kicker="With Vorker" title="Autonomous" body="The agent researches, decides and produces the output for you." />
            <Card kicker="Result" title="Hours back" body="Quantify the time/cost saved — this is your headline pitch number." />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-t border-border py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHead
            eyebrow="Architecture"
            title="Built on Google ADK"
            lead="A single root_agent with tools — the framework Vorker requires, used the way it's meant to be used."
          />
          <div className="mt-10 flex flex-wrap gap-3.5">
            {[
              { n: "01 · input", h: "User request", p: "A natural-language task comes in via chat or API." },
              { n: "02 · reason", h: "Gemini plans", p: "gemini-2.5-flash decides which tools to call." },
              { n: "03 · act", h: "Tools run", p: "Live web search + custom tools do the real work." },
              { n: "04 · answer", h: "Synthesized output", p: "Results become a clear, useful response." },
            ].map((s) => (
              <div key={s.n} className="min-w-[200px] flex-1 rounded-xl border border-border bg-white/[0.04] p-5">
                <div className="font-mono text-[13px] text-accent">{s.n}</div>
                <h4 className="mb-1.5 mt-2 font-semibold">{s.h}</h4>
                <p className="text-sm text-muted-foreground">{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GTM */}
      <section id="gtm" className="border-t border-border py-24">
        <div className="mx-auto max-w-6xl px-6">
          {/* TODO @16:00: pull highlights from docs/GTM.md */}
          <SectionHead eyebrow="Go-to-market" title="How the first 100 users arrive" />
          <div className="mt-11 grid gap-5 md:grid-cols-3">
            <Card kicker="Target user" title="Who feels the pain" body="Narrow persona + the trigger moment that sends them looking." />
            <Card kicker="Channels" title="Where we reach them" body="2–3 focused channels: community, founder-led content, integrations." />
            <Card kicker="Aha moment" title="Value in < 2 min" body="First real task done for them = the activation hook." />
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="border-t border-border py-24">
        <div className="mx-auto max-w-6xl px-6">
          {/* TODO @16:00: pull from docs/MONETIZATION.md */}
          <SectionHead eyebrow="Monetization" title="Pricing" lead="Priced to the value delivered, not to tokens." />
          <div className="mt-11 grid gap-5 md:grid-cols-3">
            {[
              { name: "Free", price: "$0", feats: ["Try the core agent", "20 tasks / month", "Community support"], featured: false },
              { name: "Pro", price: "$__/mo", feats: ["1,000 tasks / month", "Custom tools & history", "Priority support"], featured: true },
              { name: "Team", price: "$__/seat", feats: ["Unlimited tasks", "Shared workspace", "Admin & SSO"], featured: false },
            ].map((t) => (
              <div
                key={t.name}
                className={`rounded-xl border bg-white/[0.04] p-6 ${
                  t.featured ? "border-primary shadow-[0_20px_60px_var(--color-primary)]" : "border-border"
                }`}
              >
                {t.featured && <div className="mb-2 text-[13px] font-bold text-primary">Most popular</div>}
                <h3 className="text-lg font-semibold">{t.name}</h3>
                <div className="my-3 text-3xl font-extrabold">{t.price}</div>
                <ul className="space-y-1.5">
                  {t.feats.map((f) => (
                    <li key={f} className="relative pl-6 text-sm text-muted-foreground">
                      <span className="absolute left-0 font-bold text-primary">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-14">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 px-6 text-sm text-muted-foreground">
          <div>
            <strong className="text-foreground">Vorker · Agent Sprint Phase 1</strong>
            <br />
            Built with Google ADK + Gemini · June 11, 2026
          </div>
          <div>
            Team: <span className="font-mono">💚 coder</span> · <span className="font-mono">💙 strategy</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
