# Decision Log

Grounded in [00-description.md](00-description.md). Chronological; newest first
where known.

## 2026-07 — Memory Bank for agent continuity

- **Context:** Ephemeral Cursor / cloud agent sessions need durable project
  context beyond AGENTS.md.
- **Options:** Rely only on AGENTS.md; adopt Memory Bank skill + `.memory/`.
- **Decision:** Add Memory Bank skill and initialize `.memory/` core files.
- **Impact:** Agents must read `00`–`70` before tasks (unless `mem:fix`).
- **Validation:** Skill present under `.cursor/skills/memory-bank/`; core files
  exist and cite this description.

## 2026 — Unified overlapping lattice

- **Context:** Overlapping grids could render as separate boards or one lattice.
- **Decision:** Render as one unified lattice with pan/zoom viewport + minimap.
- **Rationale:** Clearer shared-cell UX; one composition for large topologies.
- **Impact:** `UnifiedOverlappingGrid`, `PuzzleViewport`, related CSS/math.

## 2026 — Custom overlapping engine

- **Context:** Need multi-grid Sudoku with configurable shared boxes.
- **Decision:** Custom topology (`OverlapBoxes` 1–3), sparse `GlobalBoard`,
  constrained fill (+ worker), human-technique overlap setter/solver.
- **Rationale:** Full control over uniqueness and technique-based difficulty.
- **Impact:** `src/sudoku/overlapping/*` becomes a major subsystem.

## 2026 — Human techniques define difficulty

- **Context:** Difficulty could mean clue count or technique set.
- **Decision:** Difficulty = techniques available (Easy→Expert tiers); setter
  accepts a removal only if human solve recovers the solution.
- **Rationale:** Matches player expectations for logical Sudoku.
- **Impact:** `TECHNIQUE_TIERS`, `createSudokuPuzzle`, debug solve logging.

## 2026 — Client-only SPA + GitHub Pages

- **Context:** Hosting and architecture choice at bootstrap.
- **Decision:** Vite React SPA; no backend; Pages via Actions with
  `GITHUB_PAGES` base path.
- **Impact:** All logic client-side; deploy workflow on `main`.

## 2026 — oxlint + Vitest + Playwright

- **Context:** Lint and test tooling.
- **Decision:** oxlint (not ESLint); Vitest for units; Playwright for E2E;
  every source file + every user-facing feature covered.
- **Impact:** Quality bar documented in README and AGENTS.md.

## 2026 — Modular React components rule

- **Context:** Avoid monolithic page components.
- **Decision:** Cursor rule `.cursor/rules/modular-web-components.mdc` —
  one reusable component per file.
- **Impact:** Controls and board pieces live in dedicated modules.
