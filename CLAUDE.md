# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

VaultMind is a RAG-based onboarding/knowledge assistant with a Next.js frontend and a FastAPI backend (`rag_backend/`). See `README.md` for the product pitch and business case.

**Important divergence from the README's "fully local/Ollama" pitch**: the code as written does *not* run purely on Ollama. `rag_backend/app/services/rag_service.py` and `rag_backend/app/services/rag_chain.py` talk to an **OpenAI-compatible HTTP endpoint** for both chat and embeddings, with this priority:
1. **NVIDIA NIM** (cloud or DGX Spark container) — used when `NVIDIA_API_KEY` is set, model configured via `NVIDIA_CHAT_MODEL` / `NVIDIA_EMBED_MODEL`.
2. **LM Studio** (`LM_STUDIO_BASE_URL`, default `http://localhost:1234`) — local fallback, no API key required.

Ollama config (`OLLAMA_BASE_URL`, `OLLAMA_MODEL`) exists in `app/core/config.py` and `docker-compose.yml` but is not currently wired into `RAGService` or `rag_chain.py` — treat it as legacy/aspirational unless you find new call sites. When debugging "why did the LLM answer this way" or "why is retrieval off," check which of NVIDIA NIM / LM Studio actually served the request (see the fallback logic in `RAGService._generate_via_openai_compat`), not just the README's Ollama claim.

The one constraint that **is** actively enforced in code: ingest and query embeddings always go through the same `NvidiaEmbeddings` instance/model (see the docstring in `rag_service.py`), so embedding-model consistency holds even though the model isn't `nomic-embed-text`.

## Commands

Frontend commands are the scripts in `package.json`; backend test commands follow standard `pytest` invocation (`testpaths = tests`, `asyncio_mode = auto` per `pytest.ini`). Notable non-obvious details:
- Jest config lives inline in `package.json` (not a separate `jest.config.js`); `@/*` resolves to the repo root.
- `docker-compose.yml` (`rag_backend/`) maps postgres to host port `5433` (container `5432`) and expects `LLM_API_KEY` / `NVIDIA_API_KEY` in the environment; it mounts `../help` into the container for the local-folder knowledge source.

## Architecture

### Request flow
`Next.js UI (app/)` → `app/api/backend.ts` (typed fetch wrapper, base URL from `NEXT_PUBLIC_API_URL`, default `http://localhost:8000`) → FastAPI routers (`rag_backend/app/routers/`) → services (`rag_backend/app/services/`) → ChromaDB (`./chroma_db`, local persist dir) + LLM endpoint (NVIDIA NIM / LM Studio).

### Backend layout
- `app/main.py` — FastAPI app assembly; registers all routers, CORS for `localhost:3000/3001`, creates DB tables on startup via SQLAlchemy `Base.metadata.create_all`.
- `app/core/config.py` — single `Settings` (pydantic-settings) object reading `rag_backend/.env`; all provider URLs/keys/model names live here.
- `app/core/security.py` — JWT issuance/verification (`python-jose`), `get_current_user` / `check_admin_role` dependencies. Every endpoint except `/auth/token` and `/health` requires auth via `get_current_user` (or `check_admin_role` for `ingest.py`) — `departments.py` and `trainer.py` are gated too, not just `chat.py`.
- `app/routers/auth.py` — login/register against an **in-memory `USERS_DB` dict** (not persisted, resets on restart); seeded demo accounts include `EUZadmin/admin`, `admin@vaultmind.local/admin123`, `user@vaultmind.local/user123`. `/auth/register` is also exposed to the frontend as a real self-service signup (always creates a `USER`, never `ADMIN`, from the client).
- `app/routers/chat.py`, `trainer.py`, `departments.py` — three different chat surfaces:
  - `chat.py`: full RAG chain (ChromaDB retrieval filtered by `current_user["dept"]` → LCEL chain in `services/rag_chain.py`).
  - `trainer.py`: `services/trainer_agent.py` sub-agent, tuned for training-style answers. Still a valid API surface, but the frontend no longer has a UI for it (see Frontend layout below).
  - `departments.py`: department-scoped chat/trainer using canned department context (`services/departments_service.py`, `DEPARTMENTS` list) rather than a vector retriever.
- `app/services/rag_service.py` — owns the Chroma vector store, `NvidiaEmbeddings` (OpenAI-compatible `/embeddings` with NIM's `input_type: passage|query` asymmetric embedding), PDF ingestion via PyMuPDF (`fitz`), and the NIM→LM Studio chat fallback (`generate`).
- `app/services/rag_chain.py` — LangChain LCEL version of the chat pipeline (`ChatOpenAI` pointed at NIM or LM Studio depending on which key is set); builds the same retriever pattern as `chat.py` directly.
- `app/services/ingest_chunks.py`, `chunk_documents.py` — document chunking/ingestion helpers used by `routers/ingest.py` and `routers/documents.py`.
- `app/services/google_drive_knowledge.py`, `youtube_knowledge.py`, `local_folder_knowledge.py` — alternate ingestion sources (Google Drive folder, YouTube channel transcripts, local EUZ docs folder), each config-gated in `Settings`.
- `app/services/integration_connectors.py` + `app/routers/integrations.py` — CRUD + connectivity test for third-party integrations (Slack, Jira, GitHub, Notion, email, Google Calendar, custom); see `app/api/backend.ts` `IntegrationType` for the full list.
- `prompts/` — prompt assembly is decomposed: `system.py` (base persona), `cot.py` (chain-of-thought instruction), `few_shot.py` (example turns), `builder.py` (composes `build_simple_prompt()` vs `build_vaultmind_prompt()`), `postprocess.py` (`strip_scratchpad` removes CoT scratchpad before the answer reaches the client — always call this before returning LLM output to the frontend).
- `app/models/db_models.py` — SQLAlchemy ORM models (Postgres). `app/alembic/` holds migration scaffolding.
- `mcp_server.py` — a separate MCP stdio server (FastMCP) that wraps the running backend's HTTP API (`chat`, `trainer`, `health`) for LM Studio's MCP tool integration; requires the FastAPI backend already running on `localhost:8000`.

### Frontend layout
- `app/api/backend.ts` — the single source of truth for backend calls; every fetch helper attaches `Authorization: Bearer <token>` when a token is passed and normalizes error bodies into thrown `Error`s. Add new backend calls here rather than calling `fetch` from components.
- `app/components/` — `ChatBox.tsx` (general-purpose chat, used standalone), `DepartmentWorkspace.tsx` / `DepartmentMenu.tsx` (department-scoped workspace + sidebar nav), `DepartmentChatDemo.tsx` + `departmentDemoData.ts` (department chat is a **scripted, no-network demo**, not a live backend call — see below), `DocumentUploadPanel.tsx` (admin ingestion UI), `Pagination.tsx` (reusable, mobile-responsive), `ThemeToggle.tsx` (light/dark, persisted to `localStorage`, applied pre-paint by an inline script in `layout.tsx` to avoid a flash), `icons.tsx` (shared inline-SVG icon set — no emoji anywhere in the UI), `HomeClient.tsx` (landing page).
- **Department chat is a dummy preview, not a live LLM call.** `DepartmentWorkspace.tsx` renders `DepartmentChatDemo`, which answers from a small hardcoded Q&A set per department (`departmentDemoData.ts`) with a short simulated "thinking" delay — it never calls `sendDepartmentChat`/the backend. This was a deliberate product decision (a live NVIDIA NIM/LM Studio endpoint isn't guaranteed to be configured), not an oversight — don't "fix" it back to a real network call without checking with the user first. The trainer sub-agent UI (`TrainerChatBox.tsx`) was removed from the department workspace for the same reason; the backend trainer endpoints/tests are untouched.
- `app/departments/[departmentId]/page.tsx`, `app/documents/page.tsx`, `app/integrations/page.tsx`, `app/login/page.tsx`, `app/docs/page.tsx` — route pages (Next.js App Router).
- Auth token/role/dept state flows from `loginUser`/`getMe`/`registerEmployee` in `backend.ts`; there is no cookie-based session — the frontend is responsible for storing and attaching the JWT. `app/login/page.tsx` has both a sign-in and a real self-service "create account" flow (`/auth/register` → auto sign-in).
- Design tokens live in `app/globals.css` as CSS custom properties (`--background`, `--foreground`, `--primary`, `--accent`, `--card`, `--border`, `--text-muted`, etc.), redefined under `:root[data-theme="dark"]`. Components should use the Tailwind utilities backed by these tokens (`bg-background`, `text-foreground`, `border-border`, …) rather than literal colors like `border-black/[.06]` or `bg-white` — literal colors don't respond to the dark-mode toggle. Any custom (non-Tailwind) CSS added to `globals.css` that should yield to Tailwind utility classes **must** go inside `@layer base`— a bare top-level rule silently beats every Tailwind utility regardless of specificity, because Tailwind's own output lives inside `@layer theme, base, components, utilities` and unlayered rules always win over layered ones.

### Unrelated content in this repo
`rag_backend/Project/` contains a **separate, unrelated Scrapy project** (spiders/pages for `cseconstruction_de` and `e-u-z_de`, with large fixture trees). It is not part of the VaultMind RAG pipeline — don't assume it's wired into `app/`. `help/` contains source onboarding documents (`.docx`) plus a pre-chunked `chunks.json`, used as ingestion input, not app code.

## Working in this repo
- Prefer `Read`/`Grep` over broad `Glob` inside `rag_backend/Project/` — it's a large, unrelated fixture tree and will dominate search results if not filtered out.
- Don't hand-edit files under `rag_backend/chroma_db/` (if present) — that's ChromaDB's on-disk index; go through `RAGService` instead.
- When changing chat behavior, remember there are three independent call paths (`chat.py`, `trainer.py`, `departments.py`) that each build their own prompt/retriever — a fix in one does not propagate to the others (though only `chat.py` is wired to a real UI right now — see Frontend layout).
- Use the `run-app` skill to launch the app locally and the `test` skill to run the Jest + pytest suites — both document environment gotchas (missing `pytest-asyncio`, `DATABASE_URL` not exported, Windows process cleanup) that otherwise look like real bugs.
