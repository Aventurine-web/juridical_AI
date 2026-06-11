"""Vorker Sprint Agent — Google ADK.

Built on the Google Agent Development Kit (ADK). This file defines `root_agent`,
which `adk run` / `adk web` discover automatically.

=== HOW TO USE THIS AT 16:00 ===
When the assignment PDF is revealed, you only need to touch THREE things:
  1. NAME + DESCRIPTION below  -> what the agent is
  2. INSTRUCTION (system prompt) -> how the agent behaves (the real work)
  3. tools=[...]               -> wire in the tools the task needs (see tools.py)
Everything else already runs.
"""
from google.adk.agents import Agent
from google.genai import types

# Tools live in tools.py. `web_search` is ready to use out of the box.
# Add your own stubs in tools.py and import them here.
from .tools import web_search

# Force the model to always return a final plain-text answer after a tool call.
# (Copied from the AgentFoundry production pattern — prevents empty responses.)
TOOL_RESPONSE_PROTOCOL = (
    "\n\nIMPORTANT: After using any tool, always produce a final plain-text "
    "answer to the user based on the tool results. Do not stop after a tool "
    "call. Do not return an empty response. Synthesize tool results into "
    "clear, plain text for the user."
)

# ============================================================
# TODO @16:00 — replace this with the real system prompt once
# the assignment is revealed. Be specific about: role, goal,
# inputs, the step-by-step workflow, and the output format.
# ============================================================
INSTRUCTION = (
    "You are the Vorker Sprint Agent, a helpful AI coworker. "
    "Your specific mission will be defined when the assignment is revealed. "
    "Until then: understand the user's request, use your tools when they help, "
    "and always reply with a clear, useful, plain-text answer."
) + TOOL_RESPONSE_PROTOCOL

root_agent = Agent(
    name="vorker_agent",
    model="gemini-2.5-flash",  # fast + cheap; swap to gemini-2.5-pro if you need deeper reasoning
    description="An AI coworker built for the Vorker Phase 1 sprint.",  # TODO @16:00
    instruction=INSTRUCTION,
    generate_content_config=types.GenerateContentConfig(temperature=0.2),
    tools=[
        web_search,
        # add more tools from tools.py here as the task requires
    ],
)
