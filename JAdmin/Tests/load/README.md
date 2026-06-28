# Load and performance tests (JAdmin)

Web-only load for CI job `perf-load`: k6 sessions via nginx (cookie jar), Playwright smoke, Lighthouse CI.

## Prerequisites

```bash
docker compose --env-file .env.test up -d db redis api web
```

From repo root, load env:

```bash
# PowerShell
Get-Content .env.test | ForEach-Object { if ($_ -match '^([^#=]+)=(.*)$') { Set-Item -Path "env:$($matches[1])" -Value $matches[2] } }

# bash
set -a && source .env.test && set +a
```

## k6 — web session (nginx same-origin)

```bash
k6 run JAdmin/Tests/load/k6/web/session-mixed.js
```

Environment (defaults match `.env.test` seed):

| Variable | Default |
|----------|---------|
| `K6_WEB_BASE_URL` | `http://localhost` |
| `SEED_TENANT_SLUG` | `system` |
| `SEED_SUPERADMIN_EMAIL` | `superadmin@localhost` |
| `SEED_SUPERADMIN_PASSWORD` | `SuperAdmin@123!` |
| `K6_VUS` | `10` |
| `K6_DURATION` | `1m` |

## Playwright smoke under load

Terminal 1: run k6 in background. Terminal 2:

```bash
cd web-client
npm run perf:under-load
```

Set `PLAYWRIGHT_BASE_URL=http://localhost` and E2E seed vars as in CI. Navigation uses [`e2e/helpers/navigation.ts`](../e2e/helpers/navigation.ts) (`clickNavLink`) — same as E2E specs, avoids strict mode with dashboard quick links.

## Lighthouse

Stack must include `web` on port 80:

```bash
cd web-client
npm run perf:lighthouse
```

Output: `web-client/lighthouse-results/`.

## CI

- **Performance** (`perf.yml`): dispara em **`pull_request` → `main`** (mesmo escopo que E2E Web) — aparece nos checks do PR como **Performance / perf-load**.
- Job `verify-unit-and-web-e2e`: inicia em paralelo com Unit/E2E Web e **aguarda** (poll ~30s) até **Unit** e **E2E Web** = `success` no mesmo SHA antes de liberar `perf-load`.
- **`workflow_dispatch`**: `perf-load` **sem** gate (debug only).

Scripts under `k6/scenarios/` (API/Bearer on `:8080`) are for optional local extension — not used in CI.
