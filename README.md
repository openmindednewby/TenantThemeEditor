# tenant-theme-editor

A standalone tenant theme editor micro-frontend for SaaS white-label customization. React + Vite + TypeScript + Tailwind.

Lets a tenant admin preview and persist their brand theme (colors, typography, layout) for the Katalogos/Erevna front-ends without redeploying.

## Run locally

```sh
npm install
npm run dev    # → http://localhost:4444 (or whatever Vite assigns)
```

Other scripts:

| Command | What |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check + production bundle |
| `npm run preview` | Serve the production bundle |
| `npm run lint` | ESLint |
| `npm run test` | Vitest |

## Tilt resources

When running the SaaS umbrella via Tilt, several `theme-studio-*` resources expose this editor at different ports:

| Resource | Port | Purpose |
|---|---|---|
| `theme-studio-dev` | 4444 | Default dev server (mocked backend) |
| `theme-studio-dev-pure` | 4446 | Vite-only, no theme studio wrapper |
| `theme-studio-dev-real` | 4447 | Wired to the real backend |
| `theme-studio-prod` | 4445 | Production bundle preview |

Use these via Tilt rather than starting your own `npm run dev` — they're set to `TRIGGER_MODE_MANUAL` so they don't burn CPU on file changes.

## Module structure convention

`src/` enforces the SaaS module structure (4+ files → standard subdirs: `hooks/`, `components/`, `utils/`, `data/`; tests co-located). See `SyncfusionThemeStudio/README.md#module-structure-convention` for the full rule set — ESLint blocks violations as errors.

## .env

Two public dev URLs (no secrets):

```
VITE_IDENTITY_URL=http://localhost:5002
VITE_CONTENT_URL=http://localhost:5009
```
