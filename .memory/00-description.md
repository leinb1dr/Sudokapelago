# Sudokapelago — Project Description

## Overview

Sudokapelago is a single-page TypeScript web application for generating and
playing configurable Sudoku puzzles, with planned integration into
[Archipelago](https://archipelago.gg/) multiworld randomizer sessions via
[archipelago.js](https://archipelago.js.org/stable/).

The product name blends “Sudoku” and “Archipelago.” The live site is hosted on
GitHub Pages at https://leinb1dr.github.io/Sudokapelago/.

## Vision

Deliver a browser-native Sudoku experience where puzzle difficulty is defined
by human-solving techniques (not brute force), including custom overlapping
multi-grid layouts, and eventually wire those puzzles into Archipelago
multiworld gameplay.

## Scope

### In scope

- Generate human-solvable standard 9×9 Sudoku puzzles at Easy / Medium / Hard /
  Expert difficulty tiers
- Generate overlapping multi-grid Sudoku layouts (shared 3×3 boxes between
  adjacent grids) with pan/zoom viewport play
- Play puzzles in-browser: digit entry, pencil marks (standard and
  corner/center), keyboard navigation, selection
- Debug human-technique solves with step logging
- Client-side Archipelago.js client initialization (connection/session handling
  planned)
- Deploy as a static site to GitHub Pages

### Out of scope (current)

- Server/backend, databases, or user accounts
- Full Archipelago multiworld session, item checks, or location logic
- Mobile-native apps (responsive web only)
- Puzzle sharing / persistence beyond the current browser session

## Primary use cases

1. **Generate and play a standard puzzle** — pick difficulty, generate, solve
   with digits and pencil marks.
2. **Generate and explore overlapping layouts** — choose overlap box count and
   grid count, generate, pan/zoom, and enter values on the unified lattice.
3. **Inspect human solving** — run debug solve to apply selected techniques and
   log detailed step reasoning.
4. **(Future) Connect to Archipelago** — join a multiworld session and receive
   or send Sudoku-related items/checks. v1 progression pillars are documented
   in Memory Bank (Digit License, notation progression, progressive
   highlighting, optional grid unlocks).

## Technical specifications

| Area | Choice |
| --- | --- |
| Language | TypeScript |
| UI | React 19 |
| Bundler / dev | Vite 8 |
| Lint | oxlint |
| Unit tests | Vitest + Testing Library + jsdom |
| E2E tests | Playwright |
| Archipelago | `archipelago.js` ^2 |
| Runtime | Browser only; Node 20+ (dev against 22) for tooling |
| Hosting | GitHub Pages via Actions |

## Non-technical considerations

- **Accessibility:** grids expose ARIA roles (`grid` / `gridcell`), selection
  state, and accessible names for cell values.
- **Quality bar:** every source file should have unit tests; every user-facing
  feature should have a Playwright primary-workflow test.
- **Open development:** GitHub-hosted, Actions-deployed static site.

## Boundaries & source of truth

This document is the foundation for all Memory Bank files. Product decisions,
architecture, and tech choices must stay aligned with the vision and scope
above unless explicitly revised here.
