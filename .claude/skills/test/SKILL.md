---
name: test
description: Run VaultMind's frontend (Jest) and backend (pytest) test suites — unit tests and full regression — and interpret failures correctly instead of guessing. Use this whenever asked to test, verify, check for regressions, or confirm "everything still works" after a change, instead of inventing test commands from scratch.
---

# Testing VaultMind

Two independent suites: Jest for the Next.js frontend (repo root) and pytest
for the FastAPI backend (`rag_backend/`). A change that touches both sides
(e.g. an API contract change) is not verified until **both** suites pass —
one green suite does not imply the other is fine.

## 0. Before you start: known environment gotchas

These two gaps cause failures that look like real bugs but are actually
missing local setup. Check them first if a fresh clone shows failures that
don't match the diff:

- **`pytest-asyncio` not installed** → every `@pytest.mark.asyncio` test
  silently misbehaves (pytest prints `PytestUnknownMarkWarning` and
  `Unknown config option: asyncio_mode`, and async test bodies don't
  actually get awaited). It's listed in `rag_backend/requirements.txt` but
  a venv can still be missing it. Fix: `python -m pip install pytest-asyncio`.
- **`DATABASE_URL` not exported** → pytest falls back to the Postgres
  default in `app/core/config.py` and every DB-touching test errors with
  `sqlalchemy.exc.OperationalError` trying to reach a Postgres server that
  isn't running. Fix: source `rag_backend/.env` before running pytest (same
  requirement as running the app — see the `run-app` skill).

## 1. Frontend — Jest (unit tests)

From the repo root:

```bash
./node_modules/.bin/tsc --noEmit -p .   # typecheck first — cheap, catches most breakage
npx jest --silent
```

Notes:
- Jest config is inline in `package.json` (no `jest.config.js`); `@/*`
  resolves to the repo root.
- Use the local `./node_modules/.bin/tsc`, not `npx tsc` — `npx` will try
  to fetch an unrelated package from npm if TypeScript isn't hoisted to a
  path npx checks first.
- Test files live under `app/**/__tests__/*.test.tsx`. When adding a new
  reusable component (anything in `app/components/`), add a matching test
  file in its `__tests__/` directory — this repo's convention, not optional.
- If a component reads `localStorage` (auth token, theme), mocks/state must
  be reset in `beforeEach` — components like `ChatBox`/`ThemeToggle` degrade
  gracefully with no stored value in jsdom, but stale state from a prior
  test in the same file can cause flaky failures if you don't clear it.

## 2. Backend — pytest (unit + integration)

From `rag_backend/`:

```bash
set -a && source .env && set +a   # required — see gotcha above
python -m pytest -q
```

Notes:
- `pytest.ini` sets `testpaths = tests` and `asyncio_mode = auto` — async
  test functions do NOT need an explicit `@pytest.mark.asyncio` marker to
  run correctly as long as pytest-asyncio is installed, but the existing
  tests use the marker anyway; keep doing that for consistency.
- Every route except `/auth/token` and `/health` requires
  `get_current_user`. The shared `client` fixture in `tests/conftest.py`
  overrides `get_current_user` via `app.dependency_overrides` for the whole
  session, so route tests don't need to construct a real JWT — don't
  re-invent per-test auth mocking, use the `client` fixture as-is.
- When a router's dependency changes (e.g. adding/removing an auth
  requirement), re-run the FULL suite, not just the file you touched — the
  `test_chat.py`/`test_departments.py` failures from adding auth in one
  session only showed up on a full run, not a single-file run.
- Route tests that exercise `RAGService`/`build_llm_chain` must mock the
  target actually imported in the router module (e.g.
  `app.routers.chat.RAGService`, `app.routers.chat.build_llm_chain`), not a
  function the router used to call in an earlier implementation. If a test
  patches something and still makes a real network call (slow test, or an
  assertion failure with an unexpected NVIDIA/LM Studio error message in
  it), that's the signal the patch target is stale — check what the router
  actually imports and calls now before assuming the test's expected
  behavior is wrong.

## 3. Full regression pass

Run both suites before calling a cross-cutting change (routing, auth,
shared components, API contracts) done:

```bash
cd rag_backend && set -a && source .env && set +a && python -m pytest -q
cd .. && ./node_modules/.bin/tsc --noEmit -p . && npx jest --silent
```

If either suite has pre-existing failures unrelated to your change, don't
silently ignore them and don't silently "fix" them by changing production
code to match a stale test's assumption — check which one is actually
wrong (read the current implementation, not just the test's intent) and
say so. Assertion text that references an old message/behavior (e.g. a
test asserting "LM Studio" in an error message when the code now checks
NVIDIA NIM first) is test drift, not a regression — fix the test to match
current, intentional behavior, and note it instead of quietly patching it.

## 4. Adding tests for new UI

For a new component under `app/components/`, add `__tests__/<Name>.test.tsx`
covering: it renders, its core interactive behavior (click/toggle/paginate),
and any accessibility attributes it sets (`aria-current`, `aria-expanded`,
`aria-label`) since those are also the contract other code/tests rely on.
