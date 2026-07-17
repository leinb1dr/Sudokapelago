# Active Focus & State

Grounded in [00-description.md](00-description.md). Last updated: 2026-07-17
(Memory Bank `mem:init`).

## Current focus

- Establish Memory Bank under `.memory/` so Cursor sessions load durable
  project context (this init)
- Product surface is playable: standard + overlapping human-technique Sudoku
  with pan/zoom and pencil marks
- Next major product gap: Archipelago session connect / multiworld behavior

## Recent changes (from git history)

- Memory Bank Cursor skill added (`#25`)
- Keyboard edge pan for puzzle viewport (`#24`)
- Unified overlapping lattice rendering (`#23`)
- Long-press pan for overlapping viewport (`#22`)
- Overlapping engine + viewport (`#20`)
- Pencil marks + keyboard mark controls
- Human-technique setter + debug solve logging
- GitHub Pages deploy + modular component rule

## Priorities

1. Keep Memory Bank fresh after significant features (`mem:update`)
2. Archipelago connection UX and protocol wiring
3. Continue test coverage for every new source file and user workflow
4. Harden overlapping generation performance / failure messaging as needed

## Open questions

- What Archipelago items/locations should Sudoku expose?
- Should overlapping puzzles be first-class multiworld content or local-only?
- Persistence: URL seed / export for sharing puzzles?

## Blockers

- None for local Sudoku play or static deploy
- Archipelago multiworld design not yet specified in-repo

## Learnings

- Difficulty must stay bound to `TECHNIQUE_TIERS` / `getTechniquesForDifficulty`
- Overlapping uniqueness stays tractable when shared boxes keep denser clues
- Unified lattice UX beats rendering separate overlapping grids as cards
- Worker fill helps keep the UI responsive during heavy generation
