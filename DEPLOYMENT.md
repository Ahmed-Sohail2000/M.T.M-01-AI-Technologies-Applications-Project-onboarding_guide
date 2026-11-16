# Deployment & CI/CD

Production: **https://vaultmind-gilt.vercel.app** (Vercel project `vaultmind`)

## Topology

| Component | Where it runs | Notes |
|---|---|---|
| Next.js frontend (repo root) | **Vercel** | Deployed by GitHub Actions only (`vercel.json` disables Vercel's Git auto-deploy). |
| FastAPI backend (`rag_backend/`) | Any container host (Render, Fly.io, Railway, a VM via `docker-compose.yml`) | Not deployed to Vercel: it needs a persistent ChromaDB directory, Postgres and long-running LLM calls, which don't fit serverless functions. |

The frontend reaches the backend through `NEXT_PUBLIC_API_URL`, which is
**inlined at build time**. Changing it requires a redeploy.

Without a reachable backend the deployed site still serves the landing page,
docs, and the scripted department chat demo; login, documents and
integrations need the API.

## Pipeline (`.github/workflows/ci.yml`)

```
PR to main ─┬─ frontend: npm ci → lint → typecheck → jest → next build
            ├─ backend:  pip install (no torch/whisper) → pytest (SQLite)
            └─ (both green) → deploy-preview → Vercel preview URL commented on PR

push to main ─ same gates ─→ deploy-production → vercel --prod → smoke test (/, /login, /docs)
```

- Deploys use the `vercel pull → vercel build → vercel deploy --prebuilt` flow, so
  the exact artifact built in CI is what ships.
- Superseded PR runs are cancelled; production deploys are serialized and never cancelled.
- PRs from forks skip the preview deploy (no secrets exposed to forks).
- `workflow_dispatch` on `main` lets you redeploy production manually (e.g. after changing env vars).
- Dependabot (`.github/dependabot.yml`) opens weekly npm/pip and monthly Actions update PRs, which go through the same gates.

## One-time setup

1. **Create/link the Vercel project** (from the repo root):
   ```bash
   npx vercel@65.16.0 login
   npx vercel@65.16.0 link        # creates .vercel/project.json (gitignored)
   ```
   `.vercel/project.json` contains `orgId` and `projectId`.

2. **Set the frontend env var in Vercel** (Project → Settings → Environment Variables),
   for Production and Preview:
   `NEXT_PUBLIC_API_URL=https://<your-backend-host>`

3. **Add GitHub repository secrets** (Settings → Secrets and variables → Actions):
   | Secret | Value |
   |---|---|
   | `VERCEL_TOKEN` | Vercel → Account Settings → Tokens (scope it to the team) |
   | `VERCEL_ORG_ID` | `orgId` from `.vercel/project.json` |
   | `VERCEL_PROJECT_ID` | `projectId` from `.vercel/project.json` |

   With the GitHub CLI: `gh secret set VERCEL_TOKEN`, etc.

   Also add the repository **variable** `PRODUCTION_URL` (e.g. `https://vaultmind-gilt.vercel.app`).
   The post-deploy smoke test hits it, because per-deployment `*.vercel.app` URLs are behind
   Vercel Authentication and answer `302` to anonymous requests.

4. **Protect production** (recommended): Settings → Environments → `production` →
   add required reviewers; Settings → Branches → protect `main` and require the
   `Frontend · …` and `Backend · pytest` checks.

5. **Allow the frontend origin on the backend** (`rag_backend/.env` or host env):
   ```bash
   CORS_ORIGINS=["https://<project>.vercel.app"]
   CORS_ORIGIN_REGEX=^https://<project>(-[a-z0-9-]+)?\.vercel\.app$   # preview deploys
   ```

## Rollback

Vercel keeps every deployment immutable. To roll back instantly:

```bash
npx vercel@65.16.0 rollback            # previous production deployment
npx vercel@65.16.0 rollback <url|id>   # a specific one
```

or use **Instant Rollback** in the Vercel dashboard. Then revert the offending
commit on `main` so the next deploy doesn't reintroduce it.

## Running the gates locally

```bash
npm ci && npm run lint && npm run typecheck && npm test && npm run build
cd rag_backend && DATABASE_URL=sqlite:///./ci_test.db python -m pytest -q
```

## Known local gotcha

`vercel build` on Windows fails with `EPERM ... symlink` unless Developer Mode
is enabled (Vercel's builder cache uses symlinks). CI runs on Linux and is
unaffected; locally, use `vercel deploy` (remote build) instead.
