---
name: run-app
description: Launch VaultMind's FastAPI backend and Next.js frontend for local dev, and verify both are healthy. Use this whenever asked to run, start, test, or screenshot the app instead of guessing commands from scratch.
---

# Running VaultMind locally

VaultMind has two processes: the FastAPI backend (`rag_backend/`) and the
Next.js frontend (repo root). Both must be running for the app to work
end-to-end. Postgres/Chroma/Redis from `rag_backend/docker-compose.yml` are
**not required** for local dev — `rag_backend/.env` defaults `DATABASE_URL`
to a local SQLite file, since no model in `app/models/db_models.py` uses a
Postgres-only column type.

## 0. One-time setup (skip if already done)

- `rag_backend/.env` should exist (copy from `rag_backend/.env.example` if not).
- Backend Python deps: `google_drive_knowledge.py` (imported transitively via
  `routers/ingest.py` → `services/ingest_chunks.py`, so it IS on the startup
  path despite living behind a config-gated feature) only needs `pypdf` from
  its otherwise-heavy import list — torch/whisper/transformers/pytesseract/
  ffmpeg/youtube-transcript-api are not imported at module scope there and
  can be skipped for local dev:
  ```bash
  cd rag_backend
  python -m pip install sqlalchemy psycopg2-binary "python-jose[cryptography]" \
    "passlib[bcrypt]" pymupdf pypdf python-docx fastapi uvicorn pydantic pydantic-settings \
    python-dotenv openai httpx python-multipart \
    langchain langchain-core langchain-openai langchain-chroma \
    langchain-text-splitters langchain-community chromadb \
    google-api-python-client google-auth
  ```
- Frontend deps: `npm install` at repo root (skip if `node_modules/` exists).

## 0.5 Check for already-running processes first

Before launching anything, check whether the backend/frontend are already up
— this repo's dev servers tend to stay running across sessions, and
re-launching a second `next dev` just wastes a round trip (Next.js will
auto-fail over to port 3001+ and you'll end up debugging the wrong tab):

```bash
curl -s -o /dev/null -w "backend:%{http_code}\n" http://localhost:8000/health
curl -s -o /dev/null -w "frontend:%{http_code}\n" http://localhost:3000
```

Two `200`s means both are already up — skip straight to step 3. Only start
what's actually down.

## 1. Start the backend

`rag_backend/app/db.py` reads `DATABASE_URL` straight from `os.environ` (it
does not call `load_dotenv()` itself), so export `rag_backend/.env` into the
shell before launching uvicorn. **Launch via `nohup ... &` + `disown`, not
the harness's own `run_in_background`** — in this environment the harness's
background-task manager has been observed to kill bare `run_in_background`
uvicorn processes unpredictably (no crash in the log, just an external
SIGTERM), which previously cost 2-3 wasted restart-and-reverify round trips
in a single session. Detaching it from the harness's process tree avoids
that class of failure entirely:

```bash
cd rag_backend
set -a && source .env && set +a
nohup python -m uvicorn app.main:app --reload --port 8000 > /tmp/backend.log 2>&1 &
disown
```

DB tables are created automatically on startup (`Base.metadata.create_all`
in `app/main.py`'s lifespan). Give it ~3s to boot before verifying.

Verify: `curl -s http://localhost:8000/health` should return 200. If it
doesn't, `tail -30 /tmp/backend.log` — don't re-run the launch command
speculatively; read the actual traceback first.

Gotcha: don't add list-valued vars (e.g. a JSON-array `CORS_ORIGINS`) to
`.env` if you're loading it with `source .env` in bash — bash strips the
quotes/brackets while exporting, so pydantic-settings then fails to
JSON-decode the mangled value at import time. `CORS_ORIGINS` isn't actually
read anywhere (`app/main.py` hardcodes CORS origins), so it's simply omitted
from `.env.example`.

Gotcha: after editing a router/service file, `--reload`'s file-watcher is
not always reliable in this environment (observed: edits silently not
picked up, stale code kept serving). If a fix you just made doesn't show up
in a live curl test, don't assume the fix is wrong — `tasklist //FI
"IMAGENAME eq python.exe"`, kill the reloader + worker PIDs, and relaunch
fresh before re-testing. Cheaper to relaunch once than to debug a "bug" that
is actually just a stale process.

## 2. Start the frontend

From the repo root, same detached pattern:

```bash
nohup npm run dev > /tmp/frontend.log 2>&1 &
disown
```

It serves `http://localhost:3000` and calls the backend via
`NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000` in
`app/api/backend.ts`).

Verify: `curl -s http://localhost:3000` should return HTML.

## 2.5 Combine checks instead of round-tripping

When verifying after a change that touches both frontend and backend, run
health checks and a type check in **one** Bash call rather than several
separate tool calls — each round trip costs a full turn:

```bash
curl -s -o /dev/null -w "backend:%{http_code}\n" http://localhost:8000/health
curl -s -o /dev/null -w "frontend:%{http_code}\n" http://localhost:3000
./node_modules/.bin/tsc --noEmit -p .
```

(Use the local `./node_modules/.bin/tsc`, not `npx tsc` — `npx` will try to
fetch an unrelated `tsc` package from npm if TypeScript isn't hoisted to a
path npx checks first, wasting a call on a network fetch + warning wall.)

## 2.6 Prefer text over screenshots for non-visual checks

`mcp__claude-in-chrome__get_page_text` or `read_page` cost far fewer tokens
than `computer` screenshots (no image tokens). Reserve screenshots for
things you're actually judging *visually* — layout, spacing, color
contrast, whether something rendered at all. For "does this text/data show
up correctly" checks (e.g. confirming department names loaded, confirming
an auth badge shows a username), read the page text instead of screenshotting.

## 3. Known limitations, not bugs

- Chat responses need a live LLM endpoint: either `NVIDIA_API_KEY` set in
  `.env`, or an LM Studio server running locally at `LM_STUDIO_BASE_URL`
  (default `http://localhost:1234`). Without either, `/health` and the UI
  still work, but chat requests will error at generation time — that's an
  external dependency, not something this skill can fix.
- `chat.py`, `trainer.py`, and `departments.py` are three independent chat
  surfaces, each building its own prompt/retriever (see CLAUDE.md). A prompt
  or behavior change in one does not propagate to the others — check all
  three when asked to change "the system prompt."

## 4. Stopping

Since both processes are launched via `nohup ... & disown`, they won't show
up in the harness's own job manager — find and kill them directly:

```bash
tasklist //FI "IMAGENAME eq python.exe"
tasklist //FI "IMAGENAME eq node.exe"
taskkill //F //PID <pid>
```

For uvicorn, kill both the reloader and worker PID (uvicorn `--reload`
spawns two processes).
