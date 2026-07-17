# AGENTS.md

## Memory Bank (mandatory)

Operational memory is ephemeral between sessions. Before undertaking **any**
task or responding to **any** prompt, agents **MUST** read and process the
**entire contents** of all core Memory Bank files in `.memory/`:

1. `.memory/00-description.md` — start here (project foundation)
2. `.memory/01-brief.md`
3. `.memory/10-product.md`
4. `.memory/20-system.md`
5. `.memory/30-tech.md`
6. `.memory/40-active.md`
7. `.memory/50-progress.md`
8. `.memory/60-decisions.md`
9. `.memory/70-knowledge.md`

Ground decisions in `00-description.md`. Use `.memory/semantic-index.json` for
targeted retrieval after the full read. After significant work, update the
relevant Memory Bank files (especially `40-active.md` and `50-progress.md`).

**Exception:** skip the full read only when the user prompt explicitly includes
`mem:fix` (minor, immediate corrections). See
`.cursor/skills/memory-bank/SKILL.md` for `mem:init`, `mem:update`,
`mem:snapshot`, `mem:search`, and `mem:health`.

## Cursor Cloud specific instructions

Sudokapelago is a single-page TypeScript app (React + Vite) for a configurable
Sudoku website with Archipelago multiworld integration via `archipelago.js`.

- Dependencies are installed with `npm install` (npm; `package-lock.json` is committed). This is handled by the startup update script, so you normally do not need to run it manually.
- Standard scripts live in `package.json`; see `README.md` for the full table. In short: `npm run dev` (Vite dev server + HMR), `npm run build` (`tsc -b` + `vite build`), `npm run preview`, `npm run lint` (oxlint), `npm run test:e2e` (Playwright).
- The dev server runs on http://localhost:5173 by default. It is a client-only app with no backend/database, so no other services are required to run or test it.
- Linting uses oxlint (config in `.oxlintrc.json`), not ESLint.

## Testing expectations

- Every source file should have unit tests covering its behavior.
- Every user-facing feature should have a Playwright test covering the primary workflow.
