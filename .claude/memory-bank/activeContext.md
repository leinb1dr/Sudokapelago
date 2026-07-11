# Active Context

> **Lifecycle rules**
> - Entries here describe CURRENT work only.
> - When done -> move the entry to `progress.md`. Do not leave completed work here.
> - When blocked/paused -> note the blocker inline with a date.
> - This file must stay short (~15 lines max). If it grows beyond that, prune it.

## Current Focus

- 2026-07-11: Bootstrap the repository memory system.
- Product work visible in `README.md`: configurable Sudoku boards and full Archipelago session handling are planned, not implemented.

## Active Risks

- Sudoku generation, validation, puzzle state, item/location mapping, and session handling do not exist yet; avoid documenting them as current behavior.
- `archipelago.js` is only instantiated in `src/App.tsx`; no connection, retry, or failure handling is implemented.

## Pending Decisions

- Define the Sudoku data model, puzzle lifecycle, and Archipelago location/item mapping before implementing game logic.
