# AGENTS.md

@.claude/memory-bank/activeContext.md
@.claude/memory-bank/systemPatterns.md
@docs/ai/known-issues.md

## Cursor Cloud specific instructions

Sudokapelago is a single-page TypeScript app (React + Vite) for a configurable
Sudoku website with Archipelago multiworld integration via `archipelago.js`.

- Dependencies are installed with `npm install` (npm; `package-lock.json` is committed). This is handled by the startup update script, so you normally do not need to run it manually.
- Standard scripts live in `package.json`; see `README.md` for the full table. In short: `npm run dev` (Vite dev server + HMR), `npm run build` (`tsc -b` + `vite build`), `npm run preview`, `npm run lint` (oxlint).
- The dev server runs on http://localhost:5173 by default. It is a client-only app with no backend/database, so no other services are required to run or test it.
- Linting uses oxlint (config in `.oxlintrc.json`), not ESLint.
- Repo-local agent skills and commands live under `.claude/`; see `.claude/README.md` before modifying or extending that bundle.

## Repository shape

- `src/main.tsx` is the React entry point.
- `src/App.tsx` is the current application component and initializes the Archipelago client.
- `src/App.css` contains component-level styles.
- `src/index.css` contains global styles.
- `public/` contains static assets.

## On-demand memory references

- Read `.claude/memory-bank/progress.md` before milestone, status, or planning work.
- Read `docs/ai/architecture-decisions.md` before changing core project architecture, tooling, hosting, or integration boundaries.
- Read `docs/ai/domain-glossary.md` before introducing Sudoku or Archipelago domain terms.
- Read `docs/ai/integration-patterns.md` before changing `archipelago.js`, deployment, or hosting behavior.
- Read `docs/ai/data-sources.md` before adding persistence, external data, browser storage, or session state.
- Read `.claude/agents-files-registry.md` before creating or using local subtree `AGENTS.md` files.
