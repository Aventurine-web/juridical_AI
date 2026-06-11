import { IridescentOrb } from "@/components/IridescentOrb"
import { Chat } from "@/components/Chat"

function goTo(id: string, focusChat = false) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  if (focusChat) setTimeout(() => document.getElementById("chat-input")?.focus(), 550)
}

const NAV = [
  { id: "agent", label: "The Agent" },
  { id: "framework", label: "Framework" },
  { id: "capabilities", label: "Capabilities" },
  { id: "outcomes", label: "Outcomes" },
]

const FRAMEWORK = [
  { n: "01", t: "Positioning", d: "Define the one thing you're best at, for the customer who needs it most." },
  { n: "02", t: "Segmentation", d: "Find the beachhead — the segment you can win first and expand from." },
  { n: "03", t: "Messaging", d: "Turn positioning into words that land, per persona and channel." },
  { n: "04", t: "Channels", d: "Choose the two or three routes to market that actually reach them." },
  { n: "05", t: "Launch", d: "Sequence the launch: assets, timing, and the first hundred users." },
  { n: "06", t: "Measure", d: "Instrument activation and retention, then iterate on what moves them." },
]

const CAPABILITIES = [
  { t: "Strategic planning", d: "Turns a goal into a sequenced, defensible go-to-market plan." },
  { t: "Positioning & narrative", d: "Sharp positioning statements and clear category framing." },
  { t: "Market segmentation", d: "Identifies and ranks beachhead segments, with the reasoning." },
  { t: "Messaging & copy", d: "Persona-specific value props, headlines, and launch copy." },
  { t: "Launch execution", d: "Concrete checklists, timelines, and channel plays — not theory." },
  { t: "Live research", d: "Pulls current market signal with built-in web search." },
]

// TODO @16:00: replace with real numbers / a real quote once the mission is set.
const OUTCOMES = [
  { stat: "1 session", label: "From blank page to a structured GTM plan." },
  { stat: "6 steps", label: "Positioning through launch, sequenced and explained." },
  { stat: "Always-on", label: "A strategist your whole team can think with." },
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
              <button
                key={n.id}
                onClick={() => goTo(n.id)}
                className="text-sm text-muted-foreground transition hover:text-foreground"
              >
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
            <Eyebrow>AI Go-To-Market Strategist</Eyebrow>
          </div>
          <h1 className="fade-up-2 font-display mt-6 text-[clamp(2.75rem,7vw,4.75rem)] leading-[1.05]">
            Turn Strategy <br className="hidden sm:block" />
            Into Execution
          </h1>
          <p className="fade-up-3 mt-7 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Build, test, and launch your go-to-market plan with an AI agent that thinks
            alongside your team.
          </p>
          <div className="fade-up-3 mt-9 flex flex-wrap items-center gap-3">
            <button
              onClick={() => goTo("agent", true)}
              className="rounded-full bg-primary px-6 py-3 text-[15px] font-medium text-primary-foreground transition hover:opacity-90"
            >
              Try the AI Agent
            </button>
            <button
              onClick={() => goTo("framework")}
              className="rounded-full border border-border px-6 py-3 text-[15px] font-medium text-foreground transition hover:bg-secondary"
            >
              View GTM Framework
            </button>
          </div>
        </div>
        <div className="h-[clamp(22rem,54vh,36rem)] w-full">
          <IridescentOrb onActivate={() => goTo("agent", true)} />
        </div>
      </header>

      {/* THE AGENT — interactive experience */}
      <section id="agent" className="border-t border-border/70 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <Eyebrow>The experience</Eyebrow>
            <h2 className="font-display mt-5 text-[clamp(2rem,4vw,3rem)] leading-[1.1]">
              Think alongside an AI strategist
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              This isn't a screenshot. Ask the agent a real go-to-market question and watch it
              reason — positioning, segmentation, messaging, and launch execution.
            </p>
          </div>

          <div className="mt-12 grid items-start gap-10 md:grid-cols-[1.1fr_0.9fr]">
            <Chat />
            <div className="md:pt-2">
              <h3 className="font-display text-xl">A live demo, not a mock-up</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                The agent is a standard Google ADK <span className="text-foreground">root_agent</span>.
                Connect it and this panel streams real answers from Gemini.
              </p>
              <ol className="mt-6 space-y-4">
                {[
                  ["Start the agent", "From the repo root: adk api_server"],
                  ["Open the page", "npm run dev — the status dot turns rose when connected"],
                  ["Ask anything", "If it's offline, you'll see a scripted preview instead"],
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

      {/* GTM FRAMEWORK */}
      <section id="framework" className="border-t border-border/70 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <Eyebrow>The framework</Eyebrow>
            <h2 className="font-display mt-5 text-[clamp(2rem,4vw,3rem)] leading-[1.1]">
              A clear path from idea to launch
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Every plan the agent builds follows the same disciplined sequence — the way a
              top strategy team would work.
            </p>
          </div>
          <div className="mt-14 grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {FRAMEWORK.map((s) => (
              <div key={s.n} className="border-t border-border pt-5">
                <div className="font-display text-2xl text-primary">{s.n}</div>
                <h3 className="font-display mt-3 text-xl">{s.t}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section id="capabilities" className="border-t border-border/70 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <Eyebrow>What it does</Eyebrow>
            <h2 className="font-display mt-5 text-[clamp(2rem,4vw,3rem)] leading-[1.1]">
              Capabilities of the agent
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
              Strategy that turns into momentum
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

          {/* TODO @16:00: swap for a real customer quote / example */}
          <figure className="mt-16 max-w-3xl">
            <blockquote className="font-display text-[clamp(1.5rem,3vw,2.1rem)] leading-snug">
              “It felt like adding a strategy partner to the team — one that drafts the plan,
              questions our assumptions, and never runs out of patience.”
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
            Turn strategy into execution.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Meet the AI agent that helps your team plan, position, and launch — together.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => goTo("agent", true)}
              className="rounded-full bg-primary px-7 py-3.5 text-[15px] font-medium text-primary-foreground transition hover:opacity-90"
            >
              Try the AI Agent
            </button>
            <button
              onClick={() => goTo("framework")}
              className="rounded-full border border-border bg-background px-7 py-3.5 text-[15px] font-medium transition hover:bg-secondary"
            >
              View GTM Framework
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/70 py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 text-sm text-muted-foreground">
          <div className="font-display text-base text-foreground">Vorker</div>
          <div>Built on Google ADK + Gemini · Phase 1 · 2026</div>
        </div>
      </footer>
    </div>
  )
}
