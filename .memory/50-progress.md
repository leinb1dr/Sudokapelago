# Progress

Grounded in [00-description.md](00-description.md). Snapshot as of Memory Bank
init (2026-07-17).

## Status

**Playable SPA** with human-technique generation for standard and overlapping
Sudoku. Archipelago client is initialized but not connected; v1 progression
pillars are documented in Memory Bank. Deployed via GitHub Pages.

## Completed work

- TypeScript + React + Vite bootstrap with archipelago.js dependency
- GitHub Pages Actions deploy
- Modular web component Cursor rule
- Playwright E2E + Vitest unit suites across domain and UI
- Empty → playable Sudoku grid (selection, digits, borders/polish)
- Configurable human-technique setter (Easy–Expert)
- Debug solve with detailed technique step logging
- Pencil marks (standard / corner / center) + Shift/hotkeys
- Arrow + WASD navigation; keyboard edge pan on viewport
- Overlapping Sudoku engine (topology, constrained fill, worker, setter)
- Unified overlapping lattice + pan/zoom + minimap + long-press pan
- Responsive slim control panel / entry controls placement
- Memory Bank skill under `.cursor/skills/memory-bank/`

## Milestones

| Milestone | State |
| --- | --- |
| M1 Bootstrap SPA + Pages | Done |
| M2 Playable standard grid | Done |
| M3 Human-technique setter | Done |
| M4 Pencil marks & keyboard UX | Done |
| M5 Overlapping engine + viewport | Done |
| M6 Memory Bank continuity | Done (`.memory/` + AGENTS.md mandate) |
| M7 Archipelago progression design (items) | Done (Memory Bank plan; no protocol yet) |
| M8 Archipelago session integration | Backlog |

## Issues / risks

- Overlapping generation can be expensive at high grid counts
- Optional grid-unlock world mode can still soft-lock; keep skill tools as
  the default-facing progression story
- README structure section may lag file tree (many new modules)

## Backlog (high level)

- Implement Digit License / notation / highlighting inventory in the client
- Connect Archipelago client to a server / room against v1 pillars
- Optional overlapping grid unlock world option
- Location/check table (placements, clears, assist-free clears)
- Puzzle seed/share/export
- Future: constraint cosmetics; technique keys remain skipped for now
- Keep README / AGENTS.md aligned with structure

## Velocity notes

Feature work has landed as focused PRs (setter, marks, overlap, viewport).
Agents should match that granularity and always add Vitest + Playwright where
user-facing.
