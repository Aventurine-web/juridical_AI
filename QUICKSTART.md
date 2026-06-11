# ⚡ Quickstart — get the agent running BEFORE 16:00

Do this *now* so that when the assignment drops you're only writing the prompt,
not fighting setup. Target: green `adk run` before the briefing ends.

## 1. One-time setup (do before 16:00)

```bash
cd Vorker-ai-phase-one

# Create + activate a virtual env
python3 -m venv .venv
source .venv/bin/activate

# Install Google ADK + deps
pip install -r requirements.txt

# Add your Gemini key (free): https://aistudio.google.com/app/apikey
cp .env.example .env
# then open .env and paste your key after GOOGLE_API_KEY=
```

## 2. Smoke-test the scaffold (do before 16:00)

```bash
# Interactive CLI chat with the placeholder agent
adk run agent

# OR the built-in web UI (nice for the demo recording)
adk web
```

If you can chat with the placeholder agent, you are ready. ✅

## 3. At 16:00 — when the assignment is revealed

The "fill in the blanks" checklist:

1. **`agent/agent.py`** → rewrite `INSTRUCTION` (system prompt), `name`, `description`.
2. **`agent/tools.py`** → copy `example_tool` for any custom capability the task needs.
   - Wire each new tool into `tools=[...]` in `agent.py`.
3. **`agent/AGENT.md`** → fill the spec sheet (keep it in sync — reviewers read it).
4. `adk run agent` → test. Add 4–5 prompts to `test_prompts.md`.
5. Non-coder teammate fills `docs/` (pitch, GTM, monetization, partnerships).
6. `git add -A && git commit -m "..." && git push` **before 18:00**.

## Handy ADK commands

| Command | What it does |
|---------|--------------|
| `adk run agent` | Chat with the agent in the terminal |
| `adk web` | Launch the local web UI (great for a screen-recorded demo) |
| `adk run agent --help` | All run options |

## If something breaks

- **`adk: command not found`** → your venv isn't active. `source .venv/bin/activate`.
- **Auth / 401 / "API key not valid"** → check `.env` has `GOOGLE_API_KEY=` set and you're in the project root.
- **Agent returns nothing after a tool call** → the `TOOL_RESPONSE_PROTOCOL` in `agent.py` already guards this; make sure it's still appended to `INSTRUCTION`.
