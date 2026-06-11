"""Tools for the Vorker Sprint Agent.

Google ADK exposes a plain Python function to the LLM as a tool when it has:
  - type hints on every argument
  - a clear docstring (the LLM reads this to decide when/how to call it)
  - a JSON-serializable return value (dict is ideal)

`web_search` below is fully working and self-contained (DuckDuckGo, no API key).
The stubs after it show the shape to copy when you need a custom tool at 16:00 —
return a mock dict first so the agent runs end-to-end, then fill in real logic.
"""
from __future__ import annotations

from typing import Any


def web_search(query: str, max_results: int = 5) -> dict:
    """Search the web and return a list of results.

    Use this whenever you need fresh, real-world information you don't already know.

    Args:
        query: The search query.
        max_results: Max number of results to return (1-10). Defaults to 5.

    Returns:
        A dict with keys `query` (str) and `results` (list of dicts with
        `title`, `url`, `snippet`).
    """
    from ddgs import DDGS

    n = max(1, min(int(max_results), 10))
    raw = DDGS().text(query, max_results=n)
    return {
        "query": query,
        "results": [
            {
                "title": r.get("title", ""),
                "url": r.get("href", ""),
                "snippet": r.get("body", ""),
            }
            for r in raw
        ],
    }


# ============================================================
# CUSTOM TOOL TEMPLATE — copy this block at 16:00 for any
# capability the assignment needs. Keep the type hints + docstring.
# Return a mock dict first so the whole agent runs, then wire real logic.
# ============================================================
def example_tool(input_text: str) -> dict[str, Any]:
    """One-line description of what this tool does and when to use it.

    Args:
        input_text: Describe each argument — the LLM reads this.

    Returns:
        A dict describing the result.
    """
    # TODO: replace with real logic.
    return {"status": "ok", "echo": input_text}
