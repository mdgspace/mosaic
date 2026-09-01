# Mosaic

Mosaic is an open-source foundation for AI-powered interactive learning
experiences. This repository currently contains the MVP 1 project scaffold:
a React web application, a FastAPI service, and small shared packages for
future UI, simulation, schema, and tool-registry work.

## Repository layout

```text
apps/
  web/          React + TypeScript frontend
  api/          Python + FastAPI backend
packages/
  ui/           Shared UI primitives (placeholder)
  simulation/   Simulation engine foundation (placeholder)
  schemas/      Shared TypeScript schema contracts (placeholder)
  tools/        Tool registry contracts (placeholder)
docs/           Product and architecture documentation
```

## Run locally

### Web

```bash
npm install
npm run dev --workspace @mosaic/web
```

The app is served at the URL printed by Vite (normally
`http://localhost:5173`).

### API

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API is available at `http://127.0.0.1:8000`; interactive OpenAPI docs are
at `/docs`.

## Current scope

This scaffold intentionally does not include an AI agent, retrieval, custom
HTML generation, simulation behavior, or a component library. Those belong to
future milestones.
