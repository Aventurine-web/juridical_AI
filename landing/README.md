# Landing page (Vite + React + Tailwind v4 + Three.js)

Same stack as AgentFoundry's frontend. The page is the pitch (hero, GTM,
pricing) **plus** a live chat box wired to the Google ADK agent in this repo.
Clicking the 3D orb jumps to the live agent.

## Run it

```bash
cd landing
npm install
npm run dev          # → http://localhost:5173
```

## Make the chat box talk to the REAL agent

In a second terminal, from the **repo root** (venv active):

```bash
adk api_server       # serves the agent on :8000
```

Vite proxies `/adk/*` → `localhost:8000` (see `vite.config.ts`), so there's **no
CORS setup needed**. Reload the page — the status dot turns 🟢 green and the chat
streams real answers from Gemini. If the agent isn't running, the box uses
scripted fallback replies so the demo always works.

## Stack

| | |
|---|---|
| Build | Vite 8 |
| UI | React 19 + TypeScript |
| Styling | Tailwind v4 (`@tailwindcss/vite`) + design tokens in `src/index.css` |
| 3D | `@react-three/fiber` + `three` (the recolored `IridescentOrb`) |
| Icons | `lucide-react` |

## Files

```
landing/
  index.html
  vite.config.ts            # /adk proxy → adk api_server
  src/
    main.tsx
    App.tsx                 # all landing sections (TODO @16:00 markers)
    index.css               # emerald/teal theme tokens
    components/
      IridescentOrb.tsx     # recolored shader orb; onActivate → chat
      Chat.tsx              # live ADK chat + scripted fallback
    lib/
      adk.ts                # ADK api_server client
      utils.ts              # cn() helper
```

## What to edit at 16:00

Search for `TODO @16:00`:
- `App.tsx` — hero headline, problem/solution, GTM cards, pricing numbers
- `Chat.tsx` — `SUGGESTIONS` (demo prompts that show off the mission)
- Re-skin colors via the `.dark { --primary / --accent / --warning }` tokens in `index.css`

## Build / deploy

```bash
npm run build        # type-check + production build → dist/
vercel deploy        # static deploy (or drag dist/ to vercel.com)
```
