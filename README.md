# TanStack Start Template

An opinionated starter for new front-end apps, matching the conventions used across
the Cortex products (`cortex-coder-front`, `cortex-support-front`).

**Stack:** TanStack Start (SSR via Nitro) · TanStack Router (file-based) · TanStack Query ·
React 19 · TypeScript 5.9 · Vite 8 · Tailwind CSS 3.4 · shadcn/ui (New York, dark-only) ·
Vitest + Testing Library · ESLint 9 + Prettier · Docker.

Ships with an end-to-end example: JWT auth (login + protected layout), a sample CRUD entity
(`example`) wired with TanStack Query, an app shell (sidebar + topbar), and the Cortex design
tokens baked in.

---

## Repository layout

The Vite project lives in `app/`; the repo root holds ops/deploy files (Docker context is
`./app`). This mirrors the existing Cortex apps.

```
.
├── Makefile                     # docker-compose orchestration + Trivy scans
├── docker-compose.yml           # dev container (builds app/Dockerfile-dev)
├── docker-compose.override.yml
├── build-and-push.sh            # build + push prod image to GHCR
└── app/                         # ← the actual project (npm root)
    ├── app/                     # TanStack Start entries + file-based routes
    │   ├── client.tsx  ssr.tsx  router.tsx
    │   ├── routeTree.gen.ts      # generated & committed (see note below)
    │   └── routes/
    │       ├── __root.tsx        # Query + Auth + Toaster providers, 401→logout
    │       ├── _layout.tsx       # auth guard + AppLayout shell
    │       ├── index.tsx  login.tsx
    │       └── _layout/example*  # sample CRUD (list / detail / new)
    └── src/
        ├── index.css             # design tokens + typography utilities
        ├── components/ui/        # shadcn/ui components (dark, New York)
        ├── components/layout/    # app shell
        ├── lib/                  # auth, api client, server-fns, query hooks, utils
        └── types/
```

## Getting started

```bash
cd app
cp .env.sample .env          # point API_BASE_URL / VITE_API_BASE_URL at your backend
npm install                  # postinstall applies the router-plugin HMR patch
npm run dev                  # http://localhost:5173
```

### Rename for a new project

```bash
cd app
node scripts/rename-app.mjs acme-console "Acme Console" Acme
```

This rewrites the identity tokens (`tanstack-start-template`, `TanStack Start Template`,
short name `Template`) across `package.json`, `index.html`, the manifest, `src/lib/site.ts`,
the `Makefile`, `docker-compose.override.yml`, and `build-and-push.sh`. Review the diff and commit.

## Scripts (`app/`)

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server (SSR) on `:5173` |
| `npm run build` | `tsc -b && vite build` → `.output/server/index.mjs` |
| `npm start` | Run the built SSR server |
| `npm run lint` | ESLint 9 (flat config) |
| `npm run format` / `format:check` | Prettier |
| `npm run typecheck` | `tsc -b` (no emit) |
| `npm test` / `test:watch` / `test:coverage` | Vitest |
| `npm run gen:icons` | Rasterize `public/icons/icon.svg` → PWA PNGs (sharp) |

## Docker (repo root)

```bash
make build && make up      # dev container with hot reload
make logs                  # tail logs
make down                  # stop
make security-scan         # Trivy filesystem scan
docker build -f app/Dockerfile app   # production image (SSR, non-root, healthcheck)
```

## Conventions

- **Routing** — file-based under `app/app/routes`. Protected pages live under `_layout/`
  (guarded by `beforeLoad`). Entities are modeled as routes, not modals (list / `$id` / `new`).
- **Data fetching** — TanStack Query with a **query-key factory** per entity
  (`src/lib/queries/example.ts`). Mutations invalidate through those keys.
- **Auth** — JWT stored as an SSR cookie + client localStorage. A single 401 handler in the
  root `QueryCache`/`MutationCache` clears the session and redirects to `/login`.
- **API** — `src/lib/api-client.ts` (client, uses `VITE_API_BASE_URL`) and
  `src/lib/server-fns.ts` (`createServerFn`, uses `API_BASE_URL`).
- **Env vars** — `API_BASE_URL` (server-only) and `VITE_API_BASE_URL` (public).
- **Path alias** — `@/*` → `app/src/*`.

## Design system

Dark-only, shadcn/ui **New York**. The tokens are **copied**, not installed as a package —
they live in [`app/tailwind.config.js`](app/tailwind.config.js) (Cortex `surface-*`/`k-*`
tokens + shadcn HSL semantic layer) and [`app/src/index.css`](app/src/index.css) (CSS variables
+ `.text-*` typography utilities). Reference specs: the `cortex-design-system` repo (`llm/`
folder — `design-tokens.md`, `components/`, `patterns/`).

Add more components with the shadcn CLI (config in `app/components.json`):

```bash
cd app && npx shadcn@latest add popover command
```

## Notes

- `app/app/routeTree.gen.ts` is **committed**. `build` runs `tsc -b` before Vite regenerates
  the tree, so a fresh clone needs the file present. It is regenerated on every `dev`/`build`.
- `scripts/apply-router-plugin-patch.cjs` (run on `postinstall`/`predev`) patches a known HMR
  bug in `@tanstack/router-plugin`. Remove it once the upstream fix lands.
