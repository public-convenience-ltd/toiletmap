# Minimal Toilet Map Frontend

This workspace hosts an experimental frontend rewrite that keeps dependencies to a minimum while relying solely on the new CSS module design system.

## Getting started

```bash
cd workspaces/minimal-frontend
pnpm install
pnpm dev
```

By default the app expects the existing Next.js backend to be running on `http://localhost:3000` so that `/api/graphql` remains available. The Vite dev server proxies any `/api` request to that backend. If your GraphQL API lives elsewhere, set `VITE_GRAPHQL_ENDPOINT` in a `.env` file.

## Project structure

- `src/design-system/` – the lightweight component library implemented with CSS modules
- `src/features/map/` – map rendering with Leaflet and marker clustering
- `src/lib/graphqlClient.ts` – small fetch-based GraphQL helper (no Apollo dependency)

## Design considerations

- No Next.js runtime dependencies – the build is Vite + React only
- Styling is limited to CSS modules and a shared token stylesheet
- Map clustering is provided by `leaflet.markercluster`; no React-specific map bindings are used
- The GraphQL client is a thin wrapper around `fetch`
