# Decision Log

Grounded in [00-description.md](00-description.md). Chronological; newest first
where known.

## 2026-07 — Archipelago progression: skill tools first

- **Context:** Need a unique Archipelago item design. Unlocking overlapping grids
  alone copies another game and soft-locks on other players. Topology gates
  (e.g. triangle: finish two bases before the apex) spend solve progress as a
  key and fight skill-based flow.
- **Options considered:** Grid unlocks only; topology gates; digit licenses;
  notation progression; technique keys; constraint cosmetics; progressive
  conflict highlighting; optional grid unlocks as a world setting.
- **Decision (v1 progression pillars):**
  1. **Digit License** — all digits 1–9 are unlockable items. AP world setting
     chooses starting licensed digits; **default start = 1, 2, 3**. Unlicensed
     digits cannot be entered until received.
  2. **Notation progression** — pencil / candidate tooling unlocks in tiers
     (no marks → center → corner → richer assist), so early play is skill-hard
     without map-blocking the board.
  3. **Progressive highlighting** — unlockable assist layers: conflict warning,
     highlight conflicts, remove conflicts. Client options let players turn
     these off (some solvers dislike assists) even when items are owned.
  4. **Optional grid unlocks** — world option to gate overlapping grids as
     items (compatibility / variety), not the default sole progression model.
- **Deferred:** Technique keys (skipped for v1). Constraint cosmetics
  (thermo, killer, diagonals, etc.) saved for future versions.
- **Design principle:** Boards stay reachable; items widen the legal move set
  and information channel. Soft-lock allowed as temporary difficulty, not as
  permanent map dead-ends. Skill remains the primary gate.
- **Impact:** Guides AP world YAML / slot options, item pool, and client UX
  before protocol wiring. See [40-active.md](40-active.md) plan section.
- **Validation:** Product + active Memory Bank updated; no protocol code yet.

## 2026-07 — AGENTS.md enforces Memory Bank reads

- **Context:** Cloud agents load AGENTS.md automatically; Memory Bank skill alone
  may not be attached every session.
- **Decision:** Put a mandatory Memory Bank section at the top of `AGENTS.md`
  requiring a full read of `.memory/00`–`70` before any task (`mem:fix` only
  exception).
- **Impact:** Continuity is enforced for Cursor Cloud without relying on skill
  attachment alone.
- **Validation:** AGENTS.md opens with Memory Bank (mandatory) section.

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
