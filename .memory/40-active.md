# Active Focus & State

Grounded in [00-description.md](00-description.md). Last updated: 2026-07-17
(Archipelago progression plan captured).

## Current focus

- Product surface is playable: standard + overlapping human-technique Sudoku
  with pan/zoom and pencil marks
- Archipelago **progression design** is decided for v1 (see plan below); next
  engineering gap is session connect / multiworld wiring against that design
- Keep Memory Bank fresh after significant features

## Archipelago progression plan (v1)

Skill-first unlocks. The board stays playable; items widen tools and assists.
Grid unlocks are an optional world mode, not the only fantasy.

### In scope

| Pillar | Behavior |
| --- | --- |
| Digit License | Digits 1–9 are all unlockable. World setting for starting licenses; **default `1,2,3`**. Cannot enter unlicensed digits until the item is received. |
| Notation progression | Unlock pencil/candidate capability in tiers (e.g. none → center marks → corner marks → further notation power). Early game is harder by skill, not by missing boards. |
| Progressive highlighting | Unlockable layers: conflict **warning**, **highlight** conflicts, **remove** conflicts. Player-facing options can disable these even when unlocked (preference for solvers who dislike assists). |
| Optional grid unlocks | World option to treat overlapping grids as unlockable items for hosts who want that mode. |

### Out of scope / deferred

- **Technique keys** — skipped for v1 (do not gate Naked Pair / X-Wing / etc. as items yet).
- **Constraint cosmetics** — thermo, killer, diagonals, fog, etc. reserved for future versions.

### Design notes

- Prefer soft-lock as “awkward without tool X” over “cannot progress until Grid N.”
- Overlapping layout remains a seed/style; grid gating is opt-in via world settings.
- Highlight assists must be toggleable in client settings independent of AP ownership where possible.

### Implementation sequencing (when building AP)

1. Model player inventory: licensed digits, notation tier, highlight tiers, optional unlocked grid ids
2. Enforce digit + notation gates in entry UI (standard + overlapping)
3. Add progressive conflict assist UI + preference toggles
4. Wire Archipelago items/locations to that inventory
5. Expose world options: starting digits (default 1–3), notation start tier, highlight start, enable grid unlocks
6. Connect session (login/room) and check send/receive

## Recent changes (from git history)

- Archipelago progression pillars recorded in Memory Bank decision log
- `AGENTS.md` requires reading `.memory/` core files before any task
- Memory Bank initialized under `.memory/` (`mem:init`)
- Memory Bank Cursor skill added (`#25`)
- Keyboard edge pan for puzzle viewport (`#24`)
- Unified overlapping lattice rendering (`#23`)
- Long-press pan for overlapping viewport (`#22`)
- Overlapping engine + viewport (`#20`)
- Pencil marks + keyboard mark controls
- Human-technique setter + debug solve logging
- GitHub Pages deploy + modular component rule

## Priorities

1. Keep Memory Bank aligned with AP design as it is refined
2. Archipelago connection UX and protocol wiring (against v1 pillars above)
3. Continue test coverage for every new source file and user workflow
4. Harden overlapping generation performance / failure messaging as needed

## Open questions

- Exact notation tier list and which tiers are separate AP items vs bundled
- Location/check list (placements, puzzle clears, assist-free clears, etc.)
- How optional grid unlocks interact with spiral topology when enabled
- Persistence: URL seed / export for sharing puzzles?

## Blockers

- None for local Sudoku play or static deploy
- Archipelago session not connected yet (design direction now documented)

## Learnings

- Difficulty must stay bound to `TECHNIQUE_TIERS` / `getTechniquesForDifficulty`
- Overlapping uniqueness stays tractable when shared boxes keep denser clues
- Unified lattice UX beats rendering separate overlapping grids as cards
- Worker fill helps keep the UI responsive during heavy generation
- AP uniqueness vs other Sudoku worlds: gate **tools/assists**, not only grids
