# Sudokapelago Claude Code Guide

@.claude/memory-bank/activeContext.md
@.claude/memory-bank/systemPatterns.md
@docs/ai/known-issues.md

Sudokapelago is a single-page TypeScript app built with React and Vite. It renders a configurable Sudoku website and is expected to integrate with Archipelago multiworld sessions through `archipelago.js`.

## Project commands

- Install dependencies with `npm install` when needed. `package-lock.json` is committed.
- Run the app with `npm run dev`; Vite serves http://localhost:5173 by default.
- Verify production readiness with `npm run build`.
- Run linting with `npm run lint`; this project uses oxlint, not ESLint.

## Repository shape

- `src/main.tsx` is the React entry point.
- `src/App.tsx` is the current application component and initializes the Archipelago client.
- `src/App.css` contains component-level styles.
- `src/index.css` contains global styles.
- `public/` contains static assets.

## On-demand memory references

- Read `.claude/memory-bank/progress.md` before milestone, status, or planning work.
- Read `docs/ai/architecture-decisions.md` before changing core project architecture, tooling, hosting, or integration boundaries.
- Read `docs/ai/domain-glossary.md` before introducing Sudoku or Archipelago domain terms.
- Read `docs/ai/integration-patterns.md` before changing `archipelago.js`, deployment, or hosting behavior.
- Read `docs/ai/data-sources.md` before adding persistence, external data, browser storage, or session state.
- Read `.claude/claude-files-registry.md` before creating or using local subtree `CLAUDE.md` files.

## Claude skills installed

This repository includes a converted Claude Code skill bundle under `.claude/`:

- `/codebase-analysis` for structured analysis of the React/Vite codebase.
- `/architecture-document` for turning an analysis into `docs/ai/architecture/*` documentation.
- `architecture-reviewer` for isolated review of documented mechanisms.
- `/memory-bootstrap` to initialize Claude memory files for this repo.
- `/promote-to-memory` and `memory-maintainer` for ongoing memory upkeep.

Before changing documented mechanisms, check `docs/ai/architecture-map.md` if it exists and read the linked `summary.md` first.
