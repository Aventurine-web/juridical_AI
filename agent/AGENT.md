# Agent Spec Sheet — Vorker Compliance Copilot

> Evidence-first AI advisor for Swedish SMEs. Reads uploaded documents, quotes the
> exact clause + page, and grounds answers in official Swedish sources.

## Name
`vorker_compliance_copilot`

## One-line purpose
Prove compliance answers: extract the clause from the user's document, quote it with
a page number, and compare it against Skatteverket / Bolagsverket / verksamt.se.

## Model
`gemini-2.5-flash` · temperature `0.1` (accuracy over creativity)

## Evidence layers
1. **User documents** — files in `documents/` (PDF / txt / md)
2. **Official sources** — skatteverket.se, bolagsverket.se, verksamt.se
3. **Broader web** — fallback only, labelled unofficial

## Tools
| Tool | What it does |
|------|--------------|
| `list_documents` | List available documents + page counts |
| `search_documents` | Find a clause/term → exact quote + page number |
| `read_document_page` | Full text of one page for precise quoting |
| `search_official_sources` | Search restricted to the 3 authoritative `.se` domains |
| `web_search_broad` | General web fallback (unofficial, must be flagged) |

## Required response format
```
## Answer
## Evidence from Documents   (quote + document + page + section)
## Official Sources          (URLs)
## Recommendation
## Disclaimer                (general info, not legal/tax advice)
```

## Guardrails
- Quote documents verbatim with page numbers; never invent a clause.
- Cite official URLs or decline; flag rules that change yearly (rates, avdrag).
- Answer in the user's language (SV/EN).

## How to run
```bash
# from repo root, with GOOGLE_API_KEY in .env
adk run agent          # terminal
adk web                # browser UI (supports file upload as artifacts)
```
Documents are read from `documents/` (override with `DOCUMENTS_DIR`).
