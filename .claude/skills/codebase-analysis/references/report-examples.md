# Codebase Analysis — Report Examples for Sudokapelago

These examples show the expected shape of reports when analyzing this TypeScript/React/Vite app. They are illustrative only; every real finding must cite actual file and line evidence.

## Orientation map example

```text
ORIENTATION MAP — app-bootstrap
────────────────────────────────
Pivot            : src/App.tsx (application shell and Archipelago client initialization)
External callers : src/main.tsx via React createRoot
Key dependencies : react, archipelago.js, app CSS
Shape            : App component -> local client setup -> rendered landing content
Pattern          : client-only React/Vite SPA

Phase 2 starting point: src/App.tsx
Phase 4 starting point: src/main.tsx / App render flow
```

## Domain model example

```text
DOMAIN MODEL — sudoku-configuration
────────────────────────────────────
Entities / concepts:
  - Puzzle configuration: grid size, difficulty, generation options
  - Sudoku cell: row, column, value, candidates, fixed/user-entered state
  - Archipelago location: puzzle milestone that can be checked

State markers:
  - connection status: disconnected -> connecting -> connected -> error
  - cell source: givens vs player entries

PROMOTE-CANDIDATEs:
  - "Puzzle state and Archipelago location checks must stay decoupled from React rendering"
    -> .claude/rules/typescript-react.md [medium — design constraint to verify as app grows]
```

## Business logic example

```text
BUSINESS LOGIC — archipelago-session
────────────────────────────────────
Entry points covered  : App initialization, user connect action
Main flow             : render app -> create client -> connect -> receive items -> check locations
Rules identified      :
  [IMPLICIT] Location checks must be idempotent to avoid duplicate multiworld sends [File:line]
State transitions     : disconnected -> connected -> disconnected/error
PROMOTE-CANDIDATEs    : 1 identified
```

## Integration map example

```text
INTEGRATION MAP — archipelago-session
─────────────────────────────────────
IN  : user connection settings -> Archipelago client options | failure: validation message [File:line]
OUT : archipelago.js client -> multiworld server            | failure: connection error UI [File:line]
OUT : location check -> Archipelago server                  | failure: retry or visible error [File:line]
Outgoing triggers  : item received -> update puzzle state; puzzle solved -> check location
Coupling violations: none
Phase 1.3 coverage : all imports explained
```

## Risk register example

```text
RISK REGISTER — app-shell
────────────────────────────────────────────────────────────────
[P0] Duplicate location checks could desync Archipelago progress  source: integration state [File:line]
[P1] Connection failure only logged, not surfaced to player       source: swallowed catch [File:line]
[P2] Vite base path mismatch can break GitHub Pages assets        source: deployment config [File:line]
Known issues    : none found in git history
Test boundaries : build, lint, manual connection flow when implemented
```

## Output gate example

```text
ANALYSIS COMPLETE — archipelago-session [component]
──────────────────────────────────────────────────
Scope       : src/App.tsx, future src/archipelago/* helpers
Key files   : src/main.tsx, src/App.tsx, package.json

Livrables :
  ORIENTATION     : App shell and Archipelago client setup
  DOMAIN MODEL    : session, item, location, connection state
  BUSINESS LOGIC  : connect, receive item, check location
  INTEGRATION MAP : archipelago.js client boundary
  RISK REGISTER   : duplicate checks, surfaced connection errors, deploy config

PROMOTE-CANDIDATEs :
  - "Archipelago session side effects must be isolated from pure Sudoku logic"
    -> .claude/rules/archipelago.md [medium — architecture rule]

What to do with these results?
  1. Capture in project memory: /architecture-document archipelago-session type=component
  2. Export to folder
  3. Keep in conversation only
```
