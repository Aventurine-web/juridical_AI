"""Vorker Sprint Agent — Google ADK.

Built on the Google Agent Development Kit (ADK). This file defines `root_agent`,
which `adk run` / `adk web` discover automatically.

Two evidence layers (see tools.py):
  1. Document intelligence — read the user's uploaded documents and quote the
     exact passage + page number.
  2. Official Swedish sources — Tavily search restricted to authoritative domains,
     plus a full-text reader for the resulting URLs/PDFs.
"""

from __future__ import annotations

import json
import os
from typing import Any

from google.adk.agents import Agent
from google.genai import types
from tavily import TavilyClient

from .tools import (
    list_documents,
    read_document_page,
    read_url,
    search_documents,
    web_search_broad,
)


TOOL_RESPONSE_PROTOCOL = (
    "\n\nIMPORTANT: After using any tool, always produce a final plain-text "
    "answer to the user based on the tool results. Do not stop after a tool "
    "call. Do not return an empty response. Synthesize tool results into "
    "clear, plain text for the user."
)

INSTRUCTION = (
    """You are Vorker, an evidence-first compliance copilot for Swedish SMEs.
Your defining trait: you PROVE every claim — you quote the exact clause and page
from the user's documents, and you ground legal/fiscal claims in official sources.

Evidence layers and when to use them:
1. The user's documents. When the question refers to "this document", "the
   agreement", "the contract", a clause, or anything that could live in an
   uploaded file, FIRST call list_documents, then search_documents to find the
   passage, and read_document_page if you need surrounding context. Quote the
   passage verbatim and cite the document name + page number.
2. Official Swedish sources. For any legal/fiscal claim — moms/VAT, company law,
   employment, payroll, registration, deadlines, thresholds — call tavily_search
   (restricted to Skatteverket, Bolagsverket, verksamt.se, Riksdagen,
   Arbetsmiljöverket, Försäkringskassan). Then call read_url on the most relevant
   official URL to read the full page or PDF before quoting — snippets are often
   incomplete. Always cite the URL.
3. Broader web (web_search_broad) — ONLY as a fallback when official sources have
   nothing. Label these results UNOFFICIAL and tell the user to verify.

Always answer in this exact format (omit a section only if it has no content):

## Answer
A direct, plain-language answer.

## Evidence from Documents
Verbatim quote(s) with document name + page. Omit if no document is relevant.

## Official Sources
The official URL(s) you grounded the answer in.

## Recommendation
A short, practical next step or checklist.

## Disclaimer
General information, not legal or tax advice.

Constraints:
- Quote documents verbatim; never invent a clause, citation, threshold, or deadline.
- Cite an official URL or say you cannot confirm — do not present stale info as current.
- Flag rules that change yearly (rates, avdrag).
- Do not claim to be a lawyer. For calculations, show the formula and mark assumptions.
- Answer in the user's language (Swedish or English).
- If the question spans multiple jurisdictions, separate Sweden-specific rules from foreign rules.

For examples like these, search and ground your answer:
- aktieägaravtal / hembudsförbehåll
- karensavdrag
- VAT for SaaS sales to B2B/B2C in EU or Norway
""".strip()
) + TOOL_RESPONSE_PROTOCOL


OFFICIAL_DOMAINS = [
    "skatteverket.se",
    "bolagsverket.se",
    "verksamt.se",
    "riksdagen.se",
    "arbetsmiljoverket.se",
    "forsakringskassan.se",
]

def _tavily_client() -> TavilyClient:
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        raise RuntimeError(
            "Missing TAVILY_API_KEY. Add it to your environment or .env file."
        )
    return TavilyClient(api_key=api_key)


def _search_with_tavily(query: str) -> str:
    """Run a domain-focused Tavily search and return compact results."""
    client = _tavily_client()

    response: dict[str, Any] = client.search(
        query=query,
        max_results=5,
        search_depth="advanced",
        include_answer=True,
        include_raw_content=True,
        include_domains=OFFICIAL_DOMAINS,
    )

    lines: list[str] = []
    answer = response.get("answer")
    if answer:
        lines.append(f"Answer: {answer}")

    results = response.get("results", []) or []
    if results:
        lines.append("Sources:")
        for i, result in enumerate(results, start=1):
            title = result.get("title", "Untitled")
            url = result.get("url", "")
            content = result.get("content", "")
            lines.append(f"{i}. {title}")
            if url:
                lines.append(f"   URL: {url}")
            if content:
                lines.append(f"   Snippet: {content[:500]}")

    return "\n".join(lines).strip() or json.dumps(response, ensure_ascii=False)


def tavily_search(query: str) -> str:
    """Search the official Swedish sources for a legal or fiscal claim.

    Restricted to authoritative domains (Skatteverket, Bolagsverket, verksamt.se,
    Riksdagen, Arbetsmiljöverket, Försäkringskassan). Use this to ground any claim
    about VAT/moms, company law, employment, payroll, deadlines, or thresholds.
    Cite the returned URLs, and call `read_url` on the best one for full context.
    """
    try:
        return _search_with_tavily(query)
    except Exception as exc:  # missing key / quota / network — never raise into the agent
        return (
            f"NOTE: Official-source search is unavailable ({type(exc).__name__}). "
            "Answer from the documents and your own knowledge, but clearly flag "
            "that official sources could not be checked and tell the user to verify."
        )


root_agent = Agent(
    name="vorker_agent",
    model="gemini-2.5-flash",  # fast + cheap; swap to gemini-2.5-pro if you need deeper reasoning
    description="Helps Swedish SME owners with company law, tax, VAT, payroll, and compliance questions.",
    instruction=INSTRUCTION,
    generate_content_config=types.GenerateContentConfig(temperature=0.1),
    tools=[
        # Layer 1 — the user's documents (the differentiator: quote + page)
        list_documents,
        search_documents,
        read_document_page,
        # Layer 2 — official Swedish sources + full-text reader
        tavily_search,
        read_url,
        # Layer 3 — unofficial web fallback (must be labelled as such)
        web_search_broad,
    ],
)
