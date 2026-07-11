# Common Patterns to Identify in Sudokapelago

Use this checklist when running `/codebase-analysis` in this TypeScript/React/Vite repo.

## Application patterns

### Client-only React SPA

Indicators:
- `src/main.tsx` calls `createRoot`.
- `src/App.tsx` and component files own rendering.
- Vite handles dev server, build, and asset bundling.

Analysis implications:
- Entry points are render flow, event handlers, hooks, and browser APIs.
- Build/deploy risks often live in Vite config, asset paths, and GitHub Pages base paths.

### Component + hook split

Indicators:
- Components render UI and delegate behavior to hooks/helpers.
- Hooks own side effects such as connection lifecycle or storage.
- Pure helpers do not import React or CSS.

Analysis implications:
- Business/game logic should be testable without rendering.
- Side effects should be easy to locate and cleanup.

### Pure game logic boundary

Indicators:
- Exported `type`/`interface` definitions for puzzle, cell, board, candidates, and options.
- Validators, generators, reducers, or selectors without React imports.

Analysis implications:
- Sudoku rules and state transitions belong here.
- UI should not duplicate validation rules.

## Domain patterns

### Sudoku board and cell model

Look for:
- grid size, row/column/box coordinates
- fixed givens vs player entries
- candidate values and validation state
- solved/completed markers

### Configuration model

Look for:
- difficulty or generation settings
- Archipelago options and connection fields
- feature flags or URL/env-driven settings

### Archipelago session model

Look for:
- connection state
- player/team/slot identity
- received items
- checked locations
- deathlink or message event handling if added

## Integration patterns

### Archipelago client boundary

Indicators:
- imports from `archipelago.js`
- client connect/disconnect calls
- item, location, room, player, or message event listeners

Analysis implications:
- Side effects must be idempotent where duplicate sends would be harmful.
- Connection errors need user-visible recovery paths.
- Cleanup matters when React components unmount or reconnect.

### Browser platform boundary

Indicators:
- `localStorage`, `sessionStorage`, `window`, `document`, `navigator`, `URLSearchParams`
- timers or event listeners

Analysis implications:
- State persistence and cleanup should be explicit.
- Browser-only APIs must not leak into pure helpers.

## Validation patterns

Look for:
- value range checks for Sudoku digits and grid coordinates
- duplicate row/column/box detection
- connection form validation
- graceful handling of malformed external data

Each validation rule is a business or gameplay requirement. Capture the rule and its enforcement points.

## Risk checklist

- [ ] React effects clean up subscriptions, timers, and connection listeners.
- [ ] Archipelago location checks are idempotent.
- [ ] Connection failures are visible to the player, not only logged.
- [ ] Pure Sudoku logic does not depend on React rendering.
- [ ] Vite/GitHub Pages base paths keep static assets working in production.
- [ ] `npm run build` and `npm run lint` cover the changed surface.
