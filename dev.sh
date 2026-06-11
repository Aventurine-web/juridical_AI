#!/usr/bin/env bash
# ============================================================
# One command to run the whole demo:
#   ./dev.sh
# Starts the Google ADK agent API (:8000) AND the landing
# dev server (:5173), and shuts both down on Ctrl+C.
# ============================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

green() { printf "\033[32m%s\033[0m\n" "$1"; }
yellow() { printf "\033[33m%s\033[0m\n" "$1"; }
red() { printf "\033[31m%s\033[0m\n" "$1"; }

# --- 1. Python venv + ADK ----------------------------------
if [ ! -d ".venv" ]; then
  yellow "No .venv found — creating one and installing requirements…"
  python3 -m venv .venv
  # shellcheck disable=SC1091
  source .venv/bin/activate
  pip install -q -r requirements.txt
else
  # shellcheck disable=SC1091
  source .venv/bin/activate
fi

if ! command -v adk >/dev/null 2>&1; then
  red "✗ 'adk' not found in the venv. Run: pip install -r requirements.txt"
  exit 1
fi

if [ ! -f ".env" ]; then
  yellow "⚠  No .env found. The agent needs GOOGLE_API_KEY to answer for real."
  yellow "   cp .env.example .env  then paste a key from https://aistudio.google.com/app/apikey"
  yellow "   (The landing page still runs in offline demo mode without it.)"
fi

# --- 2. Landing deps ---------------------------------------
if [ ! -d "landing/node_modules" ]; then
  yellow "Installing landing dependencies (first run only)…"
  ( cd landing && npm install )
fi

# --- 3. Launch both, clean up on exit ----------------------
PIDS=()
cleanup() {
  echo
  yellow "Shutting down…"
  for pid in "${PIDS[@]:-}"; do
    kill "$pid" 2>/dev/null || true
  done
  exit 0
}
trap cleanup INT TERM

green "▶ Starting ADK agent API on http://localhost:8000"
adk api_server &
PIDS+=($!)

green "▶ Starting landing page on http://localhost:5173"
( cd landing && npm run dev ) &
PIDS+=($!)

echo
green "✅ Demo is up:"
echo "   • Landing page → http://localhost:5173   (open this)"
echo "   • Agent API    → http://localhost:8000"
echo "   Press Ctrl+C to stop both."
echo

# Wait on the child processes; if either dies, keep the window alive until Ctrl+C.
wait
