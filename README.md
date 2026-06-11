# Vorker — AI Compliance Copilot for Swedish Businesses

> **Upload documents. Get answers with evidence.**
> An evidence-first AI coworker that reads your contracts, quotes the **exact clause
> and page**, and grounds every legal/tax claim in **official Swedish sources**
> (Skatteverket, Bolagsverket, verksamt.se).
>
> *Most AI tools generate answers — this one proves them.*

Built for **Vorker Intern Tryouts · Phase 1** (June 11, 2026) on **Google ADK**.

---

## The problem — the "Compliance Gap"

General-purpose LLMs give Swedish SME owners generic or outdated advice on company
law and tax. A wrong answer about VAT (moms), labour law, or a shareholder agreement
is a real liability. Owners can't tell when the model is guessing.

## Our answer — prove every claim

Most teams will build a Q&A chatbot over the official sources. We go one layer deeper:
a **document-intelligence copilot** that combines two evidence layers and *shows its working*.

```
Question
   │
   ├─ Layer 1 · YOUR DOCUMENTS   → search_documents → exact quote + page number
   ├─ Layer 2 · OFFICIAL SOURCES → search_official_sources (skatteverket/bolagsverket/verksamt)
   └─ Layer 3 · Swedish law      → brought in where it matters
   ▼
Answer in a fixed, auditable format:
   ## Answer  ## Evidence from Documents (quote + page)  ## Official Sources (URLs)
   ## Recommendation  ## Disclaimer
```

### High-fidelity examples it handles
- *"Does this shareholder agreement contain a hembudsförbehåll?"* → finds §4, quotes it,
  gives the page, explains it, checks it against company-law guidance.
- *"What risks exist in this consulting agreement?"* → liability cap, IP assignment, vite/penalty — quoted with pages.
- *"VAT for SaaS B2B to Norway vs B2C to Germany?"* → reverse charge vs OSS, cited to Skatteverket.

## Architecture (Google ADK)

- **Framework:** Google ADK — `root_agent` in [`agent/`](agent/), model `gemini-2.5-flash`, temp `0.1`.
- **Tools** ([`agent/tools.py`](agent/tools.py)): `list_documents`, `search_documents`
  (per-page PDF extraction → exact passage + page), `read_document_page`,
  `search_official_sources` (site-restricted to the 3 authoritative domains),
  `web_search_broad` (labelled-unofficial fallback).
- **Guardrails:** quote verbatim with page numbers; cite official URLs or **decline**;
  flag rules that change yearly; always append "not legal/tax advice".

## Run it

```bash
# one command runs the agent API + the landing page
cp .env.example .env        # paste a free Gemini key from aistudio.google.com/app/apikey
./dev.sh                    # → landing on :5173, agent API on :8000
```
Or piece by piece:
```bash
python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
adk run agent               # terminal chat — try documents/ + test_prompts.md
adk web                     # browser UI (supports uploading your own PDFs)
cd landing && npm install && npm run dev
```
Sample documents live in [`documents/`](documents/); see [`test_prompts.md`](test_prompts.md).

## Project structure
```
agent/        ADK copilot — agent.py (prompt), tools.py (document + source tools), AGENT.md
documents/    sample Swedish contracts (aktieagaravtal w/ hembud, konsultavtal)
landing/      Vite+React+Tailwind+r3f landing page (pitch + live evidence demo)
docs/         strategist deliverables — PITCH, GTM, MONETIZATION, PARTNERSHIPS
dev.sh        one-command launcher · test_prompts.md · requirements.txt
```

## Roadmap — "solve for the future"
1. **Real per-user upload** (ADK artifacts / file API) beyond the bundled samples.
2. **Semantic retrieval** (embeddings) over long documents.
3. **Clause library & risk scoring** — detect missing/standard clauses, redline severity.
4. **Multi-document compare** — your contract vs current Skatteverket guidance, diffed.
5. **Liability/audit layer** — per-answer source trail, "escalate to a human advisor",
   Fortnox/Visma integration, expansion to other Nordics.

## Team
- 💚 Coder (The Architect) — agent, tools, ADK integration
- 💙 Strategist — positioning, GTM, monetization, partnerships (see [`docs/`](docs/))
