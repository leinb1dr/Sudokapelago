# Product Definition

Grounded in [00-description.md](00-description.md) and [01-brief.md](01-brief.md).

## Problem statements

1. Computer-generated Sudoku often relies on brute force; players want
   difficulty tied to known human techniques.
2. Overlapping / multi-grid Sudoku is rare in the browser with good navigation.
3. Archipelago multiworld lacks a polished Sudoku client tied to logical
   generation.

## Personas

| Persona | Needs |
| --- | --- |
| Casual solver | Clear UI, Easy/Medium puzzles, digit + pencil entry |
| Technique learner | Visible difficulty tiers, debug solve / step insight |
| Overlap explorer | Multi-grid layouts, pan/zoom, minimap |
| Archipelago player (future) | Connect to room, receive/send checks |

## User journeys

### Standard play

1. Land on Sudokapelago hero + setter panel
2. Choose difficulty → Generate
3. Select cells (click or arrows/WASD), enter digits / pencil marks
4. Optionally Debug solve to fill via human techniques

### Overlapping play

1. Switch mode to overlapping; set overlap boxes and grid count
2. Generate (may use web worker for constrained fill)
3. Pan/zoom viewport (wheel, long-press drag, keyboard edge pan)
4. Enter values on the unified lattice; use entry controls

## Feature requirements

| Feature | Status |
| --- | --- |
| Human-technique setter (standard) | Done |
| Difficulty picker (easy–expert) | Done |
| Playable grid + keyboard digits | Done |
| Arrow / WASD navigation | Done |
| Pencil marks (standard, corner/center) + hotkeys | Done |
| Debug solve + step logging | Done |
| Overlapping engine + unified lattice UI | Done |
| Pan/zoom viewport + minimap + long-press pan | Done |
| Entry controls layout for overlap | Done |
| Archipelago.js client init | Done (no session yet) |
| Archipelago connect / multiworld | Planned |
| Puzzle persistence / share | Not started |

## UX guidelines

- Brand-forward hero: “Sudo**kapelago**” with Archipelago-oriented tagline
- Slim responsive control panel; avoid dashboard clutter
- Overlapping boards are one composition (unified lattice), not separate cards
- Accessibility: `grid` / `gridcell`, `aria-selected`, descriptive cell names
- Modular React components (see `.cursor/rules/modular-web-components.mdc`)

## User metrics (informal)

- Generation completes without error for typical settings
- Primary workflows covered by Playwright
- Domain logic covered by Vitest per source module
