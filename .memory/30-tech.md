# Technology Landscape

Grounded in [00-description.md](00-description.md).

## Stack

| Layer | Technology | Notes |
| --- | --- | --- |
| Language | TypeScript ~6 | Project references via `tsc -b` |
| UI | React 19 + react-dom | SPA |
| Build | Vite 8 + `@vitejs/plugin-react` | HMR in dev |
| Lint | oxlint | Config: `.oxlintrc.json` (not ESLint) |
| Unit test | Vitest 4 + jsdom + Testing Library | `tests/unit/**` |
| E2E | Playwright | `tests/app.spec.ts`, `playwright.config.ts` |
| Archipelago | archipelago.js ^2.0.4 | Client only so far |
| Package mgr | npm | `package-lock.json` committed |

## Development environment

- Node.js 20+ (developed against 22)
- Dev server: `npm run dev` → http://localhost:5173
- No backend or external services required for local work
- Dependencies: `npm install` / CI uses `npm ci`

## Scripts (`package.json`)

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | `tsc -b` + Vite production build |
| `npm run preview` | Preview production build |
| `npm run lint` | oxlint |
| `npm test` | Vitest run |
| `npm run test:e2e` | Playwright |

## Build & deployment

- Workflow: `.github/workflows/deploy-pages.yml`
- Triggers: push to `main`, or manual `workflow_dispatch`
- Build sets `GITHUB_PAGES=true` so Vite `base` is `/Sudokapelago/`
- Artifact: `./dist` → GitHub Pages

## Key configs

| File | Role |
| --- | --- |
| `vite.config.ts` | React plugin, Vitest include, Pages base |
| `tsconfig*.json` | App / node project references |
| `.oxlintrc.json` | Lint rules |
| `playwright.config.ts` | Browser E2E |
| `AGENTS.md` | Cursor Cloud agent instructions |

## Tool chain notes for agents

- Prefer oxlint, not ESLint
- Testing expectations in README / AGENTS.md are mandatory for feature work
- Modular component rule: `.cursor/rules/modular-web-components.mdc`
- Memory Bank skill: `.cursor/skills/memory-bank/`
