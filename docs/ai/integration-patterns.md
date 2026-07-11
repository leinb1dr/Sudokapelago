# Integration Patterns

## Archipelago client

- Import `Client` from `archipelago.js` when implementing Archipelago behavior.
- Current implementation creates a module-level client in `src/App.tsx` only to verify that the dependency is wired.
- Do not assume connection lifecycle, authentication, item handling, location checks, retries, or recovery semantics exist yet.

## GitHub Pages deployment

- `vite.config.ts` keeps local builds rooted at `/`.
- When `GITHUB_PAGES=true` and `GITHUB_REPOSITORY` is present, Vite builds with `/<repository-name>/` as the base path.
- Keep asset and router changes compatible with both local Vite development and repository-scoped GitHub Pages hosting.
