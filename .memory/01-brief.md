# Project Brief

Grounded in [00-description.md](00-description.md).

## What

A configurable Sudoku website that generates puzzles verified by human-solving
techniques, supports overlapping multi-grid layouts, and prepares for
Archipelago multiworld integration.

## Why

Archipelago players and Sudoku fans need puzzles whose difficulty matches
logical techniques rather than computer search. Overlapping layouts and
future multiworld hooks make Sudokapelago a distinctive client for that
audience.

## High-level vision

1. Reliable human-technique puzzle generation (standard + overlapping)
2. Comfortable browser play (keyboard, pencil marks, viewport for large boards)
3. Archipelago session connectivity and multiworld gameplay hooks (v1:
   Digit License, notation progression, progressive highlighting, optional
   grid unlocks; see Memory Bank decision / active plan)

## Core requirements

- Human-technique setter: start from a valid solution, try removing each clue
  once; keep only removals that remain fully solvable with the selected
  technique set
- Difficulty tiers map to technique sets (Easy → Expert)
- Standard 9×9 and overlapping multi-grid modes
- Playable UI with digit entry, pencil marks, navigation
- Static deploy to GitHub Pages
- Strong automated test coverage (Vitest + Playwright)

## Success criteria

- Users can generate and complete puzzles at each difficulty
- Overlapping puzzles remain unique/tractable under the human-technique policy
- `archipelago.js` is present and ready for session work
- CI/deploy keeps the GitHub Pages site current on `main`
- Memory Bank and Cursor rules keep agent sessions consistent with project intent

## Stakeholders

| Role | Interest |
| --- | --- |
| Maintainer / players | Feature quality, playability, Archipelago path |
| Cursor / cloud agents | Continuity via Memory Bank and AGENTS.md |
| Archipelago community (future) | Protocol-compatible multiworld Sudoku |

## Constraints

- Client-only SPA; no backend
- Generation must stay responsive enough for interactive use (workers used for
  heavy overlapping fill where needed)
- Technique set is the difficulty contract — changing techniques changes
  puzzle difficulty semantics
- GitHub Pages base path must work for project-site hosting

## Timeline posture

No calendar estimates. Progress is feature-driven: complete playable setter →
overlapping engine/UI → Archipelago session integration.
