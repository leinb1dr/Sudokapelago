# AGENTS.md

## Cursor Cloud specific instructions

Sudokapelago is a single-page TypeScript app (React + Vite) for a configurable
Sudoku website with Archipelago multiworld integration via `archipelago.js`.

- Dependencies are installed with `npm install` (npm; `package-lock.json` is committed). This is handled by the startup update script, so you normally do not need to run it manually.
- Standard scripts live in `package.json`; see `README.md` for the full table. In short: `npm run dev` (Vite dev server + HMR), `npm run build` (`tsc -b` + `vite build`), `npm run preview`, `npm run lint` (oxlint).
- The dev server runs on http://localhost:5173 by default. It is a client-only app with no backend/database, so no other services are required to run or test it.
- Linting uses oxlint (config in `.oxlintrc.json`), not ESLint.
