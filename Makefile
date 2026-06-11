# Vorker sprint — handy commands.
.PHONY: demo agent landing install

# Run the full demo (agent API + landing page) with one command.
demo:
	./dev.sh

# Just the agent (terminal chat).
agent:
	. .venv/bin/activate && adk run agent

# Just the landing page.
landing:
	cd landing && npm run dev

# First-time setup: Python venv + ADK, then landing deps.
install:
	python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt
	cd landing && npm install
