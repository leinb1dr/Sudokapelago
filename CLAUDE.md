# Sudokapelago Claude Code Guide

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

## Claude skills installed

This repository includes a converted Claude Code skill bundle under `.claude/`:

- `/codebase-analysis` for structured analysis of the React/Vite codebase.
- `/architecture-document` for turning an analysis into `docs/ai/architecture/*` documentation.
- `architecture-reviewer` for isolated review of documented mechanisms.
- `/memory-bootstrap` to initialize Claude memory files for this repo.
- `/promote-to-memory` and `memory-maintainer` for ongoing memory upkeep.

Before changing documented mechanisms, check `docs/ai/architecture-map.md` if it exists and read the linked `summary.md` first.
