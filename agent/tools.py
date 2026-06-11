"""Tools for the Vorker Compliance Copilot.

Two evidence layers:
  1. Document intelligence — read the user's uploaded documents and return the
     EXACT passage + page number (the differentiator: we prove answers).
  2. Official Swedish sources — search restricted to Skatteverket, Bolagsverket
     and verksamt.se so legal/fiscal claims are grounded and citable.

Google ADK exposes a plain function as a tool when it has type hints, a clear
docstring (the model reads it to decide when to call), and a JSON-serializable
return. All tools below return dicts.
"""
from __future__ import annotations

import os
import re
from pathlib import Path
from typing import Any

# ------------------------------------------------------------------ documents

# Where uploaded documents live. Defaults to ./documents next to the repo root.
DOCUMENTS_DIR = Path(os.environ.get("DOCUMENTS_DIR", Path(__file__).resolve().parent.parent / "documents"))

# Cache of extracted text: {filename: [page1_text, page2_text, ...]}
_PAGE_CACHE: dict[str, list[str]] = {}

_SUPPORTED = {".pdf", ".txt", ".md"}


def _extract_pages(path: Path) -> list[str]:
    """Return the text of each page of a document (1 logical page for .txt/.md)."""
    if path.name in _PAGE_CACHE:
        return _PAGE_CACHE[path.name]
    pages: list[str] = []
    if path.suffix.lower() == ".pdf":
        from pypdf import PdfReader

        reader = PdfReader(str(path))
        for page in reader.pages:
            pages.append(page.extract_text() or "")
    else:
        pages = [path.read_text(encoding="utf-8", errors="ignore")]
    _PAGE_CACHE[path.name] = pages
    return pages


def _available() -> list[Path]:
    if not DOCUMENTS_DIR.exists():
        return []
    return sorted(
        p for p in DOCUMENTS_DIR.iterdir()
        if p.suffix.lower() in _SUPPORTED and not p.name.startswith("_")
    )


def list_documents() -> dict:
    """List the documents currently available to analyse.

    Call this first when the user refers to "this document", "the agreement",
    "the contract", etc., so you know which files you can search.

    Returns:
        A dict with `documents`: a list of {name, pages} for each available file.
    """
    docs = []
    for p in _available():
        docs.append({"name": p.name, "pages": len(_extract_pages(p))})
    return {"documents": docs, "count": len(docs)}


def search_documents(query: str, max_results: int = 5) -> dict:
    """Search the uploaded documents for a clause, term or topic.

    Use this to find evidence INSIDE the user's documents — e.g. to check whether
    a shareholder agreement contains a 'hembudsforbehall', or to locate risk
    clauses in a consulting agreement. Always quote the returned passage verbatim
    and cite the document name and page number in your answer.

    Args:
        query: What to look for (a clause name, keyword, or short phrase).
        max_results: Max number of matching passages to return (1-10). Defaults to 5.

    Returns:
        A dict with `query` and `matches`: a list of
        {document, page, quote} where `quote` is the exact text found.
    """
    n = max(1, min(int(max_results), 10))
    terms = [t for t in re.findall(r"\w+", query.lower()) if len(t) > 2]
    if not terms:
        return {"query": query, "matches": [], "found": False}

    scored: list[dict[str, Any]] = []
    for path in _available():
        for i, text in enumerate(_extract_pages(path), start=1):
            # Split a page into sentences, then score sliding windows of 1-3
            # sentences so the quote centres on the actual clause, not the page.
            sentences = [s.strip() for s in re.split(r"(?<=[.:])\s+|\n+", text) if s.strip()]
            for j in range(len(sentences)):
                for size in (3, 2, 1):
                    if j + size > len(sentences):
                        continue
                    window = " ".join(sentences[j : j + size])
                    w_low = window.lower()
                    hits = sum(1 for t in terms if t in w_low)
                    if not hits:
                        continue
                    all_bonus = 6 if all(t in w_low for t in terms) else 0
                    # Reward more context (size) so the quote includes the clause
                    # body, not just its heading; light length penalty as tiebreak.
                    score = hits * 10 + all_bonus + size * 0.8 - len(window) / 1200
                    scored.append({"document": path.name, "page": i, "quote": window, "_score": score})

    scored.sort(key=lambda m: m["_score"], reverse=True)
    # De-duplicate overlapping windows (keep the highest-scoring of each cluster).
    matches: list[dict[str, Any]] = []
    for cand in scored:
        if any(
            cand["document"] == k["document"]
            and cand["page"] == k["page"]
            and (cand["quote"] in k["quote"] or k["quote"] in cand["quote"])
            for k in matches
        ):
            continue
        matches.append({"document": cand["document"], "page": cand["page"], "quote": cand["quote"][:600]})
        if len(matches) >= n:
            break
    return {"query": query, "matches": matches, "found": bool(matches)}


def read_document_page(document: str, page: int) -> dict:
    """Read the full text of a single page of a document, for precise quoting.

    Use after `search_documents` when you need the surrounding context of a
    passage before quoting it.

    Args:
        document: The document file name (as returned by `list_documents`).
        page: The 1-based page number.

    Returns:
        A dict with `document`, `page`, and `text` (the full page text), or an
        `error` if the document or page does not exist.
    """
    for path in _available():
        if path.name == document:
            pages = _extract_pages(path)
            if 1 <= page <= len(pages):
                return {"document": document, "page": page, "text": pages[page - 1]}
            return {"error": f"{document} has {len(pages)} pages; page {page} is out of range."}
    return {"error": f"Document '{document}' not found. Call list_documents to see available files."}


# ------------------------------------------------------------- official sources

_OFFICIAL_SITES = ["skatteverket.se", "bolagsverket.se", "verksamt.se"]


def search_official_sources(query: str, max_results: int = 6) -> dict:
    """Search the authoritative Swedish sources (Skatteverket, Bolagsverket, verksamt.se).

    Use this to ground any legal or fiscal claim — VAT/moms, company law,
    employment rules, registration. Cite the returned URLs in your answer. Prefer
    these official results over general knowledge.

    Args:
        query: The search query (Swedish or English).
        max_results: Max number of results to return (1-10). Defaults to 6.

    Returns:
        A dict with `query` and `results`: a list of {title, url, snippet, source}.
    """
    from ddgs import DDGS

    n = max(1, min(int(max_results), 10))
    site_filter = " OR ".join(f"site:{s}" for s in _OFFICIAL_SITES)
    raw = DDGS().text(f"({site_filter}) {query}", max_results=n)
    results = []
    for r in raw:
        url = r.get("href", "")
        source = next((s for s in _OFFICIAL_SITES if s in url), "")
        results.append({
            "title": r.get("title", ""),
            "url": url,
            "snippet": r.get("body", ""),
            "source": source,
        })
    return {"query": query, "results": results, "official_only": True}


def web_search_broad(query: str, max_results: int = 5) -> dict:
    """General web search fallback when the official sources have no answer.

    Use ONLY if `search_official_sources` returns nothing relevant. Treat these
    results as UNOFFICIAL — label them as such and recommend the user verify with
    an official source or an authorised advisor.

    Args:
        query: The search query.
        max_results: Max number of results to return (1-10). Defaults to 5.

    Returns:
        A dict with `query` and `results` (list of {title, url, snippet}), flagged unofficial.
    """
    from ddgs import DDGS

    n = max(1, min(int(max_results), 10))
    raw = DDGS().text(query, max_results=n)
    return {
        "query": query,
        "results": [
            {"title": r.get("title", ""), "url": r.get("href", ""), "snippet": r.get("body", "")}
            for r in raw
        ],
        "official_only": False,
        "warning": "Unofficial results — verify against an official source.",
    }
