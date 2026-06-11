"""Vorker Sprint Agent — Google ADK.

Built on the Google Agent Development Kit (ADK). This file defines `root_agent`,
which `adk run` / `adk web` discover automatically.

This version uses Tavily for search + retrieval, which is a good fit for
source-grounded agent workflows.
"""

from __future__ import annotations

import json
import os
from typing import Any

from google.adk.agents import Agent
from google.genai import types
from tavily import TavilyClient


TOOL_RESPONSE_PROTOCOL = (
    "\n\nIMPORTANT: After using any tool, always produce a final plain-text "
    "answer to the user based on the tool results. Do not stop after a tool "
    "call. Do not return an empty response. Synthesize tool results into "
    "clear, plain text for the user."
)

INSTRUCTION = (
    """You are Vorker, a Swedish SME compliance assistant.

Your job:
- Give precise, practical guidance for Swedish business, tax, payroll, and company-law questions.
- Prefer current, authoritative Swedish sources such as Skatteverket, Bolagsverket, verksamt.se, Riksdagen, Arbetsmiljöverket, and Försäkringskassan.
- Use Tavily whenever the answer depends on current rules, thresholds, filing procedures, forms, deadlines, or agency guidance.
- If the question spans multiple jurisdictions or countries, separate Sweden-specific rules from foreign rules.

How to answer:
1. Start with a direct answer.
2. State the relevant Swedish authority or source basis.
3. Give a short step-by-step practical checklist.
4. Add caveats when the answer depends on company form, turnover, employee status, contract type, or tax residency.
5. If the evidence is incomplete or conflicting, say so clearly and ask one focused follow-up question.

Important constraints:
- Do not invent legal citations, thresholds, or deadlines.
- Do not present stale information as current.
- Do not claim to be a lawyer.
- When the user asks for a calculation, show the formula or logic and clearly mark any assumptions.
- Be concise by default, but be complete when the topic is legally sensitive.

For examples like these, search and ground your answer:
- aktieägaravtal / hembudsförbehåll
- karensavdrag
- VAT for SaaS sales to B2B/B2C in EU or Norway
""".strip()
) + TOOL_RESPONSE_PROTOCOL


OFFICIAL_DOMAINS = [
    "bolagsverket.se",
    "verksamt.se",
    "riksdagen.se",
    "arbetsmiljoverket.se",
    "forsakringskassan.se",
]

SPECIAL_QUERIES = {
    "vat": "site:skatteverket.se SaaS moms Norge B2B",
    "karensavdrag": "site:skatteverket.se karensavdrag deltidsanställd",
    "hembud": "site:bolagsverket.se hembudsförbehåll aktiebolag",
    "aktieagare": "site:verksamt.se aktieägaravtal aktiebolag",
}


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
    """General Swedish compliance search.

    This function automatically boosts official Swedish domains.
    """
    return _search_with_tavily(query)


def search_skatteverket_saas_moms_norge_b2b() -> str:
    return _search_with_tavily(SPECIAL_QUERIES["vat"])


def search_skatteverket_karensavdrag_deltidsanstalld() -> str:
    return _search_with_tavily(SPECIAL_QUERIES["karensavdrag"])


def search_bolagsverket_hembudsforsbehall_aktiebolag() -> str:
    return _search_with_tavily(SPECIAL_QUERIES["hembud"])


def search_verksamt_aktieagaravtal_aktiebolag() -> str:
    return _search_with_tavily(SPECIAL_QUERIES["aktieagare"])

root_agent = Agent(
    name="vorker_agent",
    model="gemini-2.5-flash",  # fast + cheap; swap to gemini-2.5-pro if you need deeper reasoning
    description="Helps Swedish SME owners with company law, tax, VAT, payroll, and compliance questions.",  # TODO @16:00
    instruction=INSTRUCTION,
    generate_content_config=types.GenerateContentConfig(temperature=0.2),
    tools=[
        search_skatteverket_saas_moms_norge_b2b,
        search_skatteverket_karensavdrag_deltidsanstalld,
        search_bolagsverket_hembudsforsbehall_aktiebolag,
        search_verksamt_aktieagaravtal_aktiebolag, tavily_search
        # add more tools from tools.py here as the task requires
    ],
)
