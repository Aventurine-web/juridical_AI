# Vorker Phase 1 — Agent Sprint

> An AI coworker built on **Google ADK** for the Vorker Intern Tryouts, Phase 1
> (June 11, 2026). Built in ~1.5h by a 2-person team.

<!-- TODO @16:00: replace this line with a one-sentence pitch of what the agent does. -->
**What it does:** _Mission revealed at 16:00 — see [`agent/AGENT.md`](agent/AGENT.md)._

## The problem & our solution

<!-- TODO: 2–3 sentences. What pain does this remove? Who feels it? -->

## How it works

```
User ──▶ root_agent (Google ADK, gemini-2.5-flash)
              │
              ├─ system prompt  ......... agent/agent.py  (INSTRUCTION)
              └─ tools .................. agent/tools.py   (web_search + custom)
```

- Framework: **Google ADK** (`google-adk`) — the required stack for this sprint.
- Model: `gemini-2.5-flash` (fast, cheap; `gemini-2.5-pro` available for harder reasoning).
- The agent discovers `root_agent` via `agent/__init__.py`, runnable with `adk run agent` or `adk web`.

## Run it

See **[QUICKSTART.md](QUICKSTART.md)** for the full setup. Short version:

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # paste a free Gemini key from aistudio.google.com/app/apikey
adk run agent
```

## Project structure

```
Vorker-ai-phase-one/
├── README.md            ← you are here
├── QUICKSTART.md        ← setup + the 16:00 fill-in checklist
├── requirements.txt     ← google-adk + deps
├── .env.example         ← GOOGLE_API_KEY
├── agent/
│   ├── __init__.py      ← exposes root_agent for ADK discovery
│   ├── agent.py         ← the agent: system prompt + tool wiring
│   ├── tools.py         ← web_search (working) + custom tool template
│   └── AGENT.md         ← spec sheet (source of truth)
├── test_prompts.md      ← prompts to demo the agent
├── landing/             ← single-file landing page: pitch + GTM + LIVE agent chat
│   └── index.html       ← open in a browser; talks to `adk api_server` when live
└── docs/                ← business side (pitch, GTM, monetization, partnerships)
```

## Landing page & live demo

`landing/index.html` is a zero-build landing page (animated 3D orb, pitch, GTM,
pricing) with a chat box that talks to the **real agent** when `adk api_server`
is running — and falls back to a scripted demo otherwise. See
[`landing/README.md`](landing/README.md) to run it.

## Team

- **Coder (💚):** <!-- name -->
- **Non-coder (💙):** <!-- name -->

## The business case

See [`docs/`](docs/) — pitch, go-to-market, monetization, and partnerships.
