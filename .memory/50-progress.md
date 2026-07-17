# Progress

Grounded in [00-description.md](00-description.md). Snapshot as of Memory Bank
init (2026-07-17).

## Status

**Playable SPA** with human-technique generation for standard and overlapping
Sudoku. Archipelago client is initialized but not connected. Deployed via
GitHub Pages.

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
| M6 Memory Bank continuity | In progress (this init) |
| M7 Archipelago session integration | Backlog |

## Issues / risks

- Overlapping generation can be expensive at high grid counts
- Archipelago scope undefined — risk of premature protocol assumptions
- README structure section may lag file tree (many new modules)

## Backlog (high level)

- Connect Archipelago client to a server / room
- Multiworld item/check design for Sudoku
- Puzzle seed/share/export
- Further technique expansion or custom technique presets in UI
- Keep README / AGENTS.md aligned with structure

## Velocity notes

Feature work has landed as focused PRs (setter, marks, overlap, viewport).
Agents should match that granularity and always add Vitest + Playwright where
user-facing.
