# Landing page

A single self-contained `index.html` — the pitch, GTM, and pricing **plus** a
live chat box wired to the Google ADK agent in this repo. No build step.

## Just want to look at it?

Open `landing/index.html` in a browser (double-click). The 3D orb and all
content render instantly. The chat box runs in **offline demo mode** (scripted
replies) until you connect the real agent below.

## Make the chat box talk to the REAL agent (the impressive demo)

Two terminals:

```bash
# Terminal 1 — serve the agent over HTTP (from repo root, venv active)
# --allow_origins lets the browser page call it (CORS).
adk api_server --allow_origins="*"
```

```bash
# Terminal 2 — serve the landing page over http:// (not file://, so CORS works)
cd landing
python3 -m http.server 5500
```

Then open **http://localhost:5500** . The status dot turns 🟢 green and the chat
box now streams answers from the live Gemini-powered agent.

> If the dot stays amber, the page just uses scripted fallback replies — the
> demo still works, it's just not hitting the real model.

## What to edit at 16:00

Everything mission-specific is marked `TODO @16:00` in `index.html`:
- Hero headline + value prop
- Problem / solution cards
- GTM highlights (mirror `docs/GTM.md`)
- Pricing numbers (mirror `docs/MONETIZATION.md`)
- `SUGGESTIONS` array (JS, near the bottom) — set demo prompts that show off the mission

Re-skin colors via the `:root` CSS variables at the top (`--accent`, etc.).

## Deploy to Vercel later (optional, 1 min)

It's a static file, so:
```bash
cd landing && vercel deploy   # or drag the folder into vercel.com
```
