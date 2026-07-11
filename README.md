# Sudokapelago

A configurable Sudoku website with [Archipelago](https://archipelago.gg/)
multiworld randomizer integration, built with TypeScript, React, and Vite.

Sudokapelago will let you generate and play Sudoku puzzles with a variety of
configuration options, and connect those puzzles to an Archipelago multiworld
session using [archipelago.js](https://archipelago.js.org/stable/).

## Status

Early bootstrap. The app currently renders an initial empty Sudoku grid and
initializes the `archipelago.js` client to confirm the integration is wired up.
Puzzle generation and full Archipelago session handling are planned.

## Tech stack

- [TypeScript](https://www.typescriptlang.org/)
- [React](https://react.dev/)
- [Vite](https://vite.dev/) (dev server / bundler)
- [oxlint](https://oxc.rs/docs/guide/usage/linter) (linting)
- [Playwright](https://playwright.dev/) (browser feature testing)
- [archipelago.js](https://archipelago.js.org/stable/) (Archipelago protocol client)

## Requirements

- Node.js 20+ (developed against Node 22)
- npm (a `package-lock.json` is committed)

## Getting started

Install dependencies:

```
npm install
```

Start the development server (with hot module reloading):

```
npm run dev
```

Then open the URL printed in the terminal (defaults to http://localhost:5173).

## GitHub Pages hosting

The app is configured to deploy to GitHub Pages at
https://leinb1dr.github.io/Sudokapelago/.

Deployment runs through the `Deploy to GitHub Pages` workflow on every push to
`main`, or manually from the GitHub Actions tab. In the repository settings,
set Pages to use the `GitHub Actions` source.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) and build a production bundle |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run oxlint over the project |
| `npm run test:e2e` | Run Playwright browser tests |

## Testing expectations

- Every source file should have unit tests covering its behavior.
- Every user-facing feature should have a Playwright test covering the primary workflow.

## Project structure

```
index.html          # Vite HTML entry point
playwright.config.ts # Playwright browser test configuration
src/
  main.tsx          # React entry point
  App.tsx           # Initial Sudoku page + archipelago.js client
  App.css           # App page styles
  SudokuGrid.tsx    # Empty 9x9 Sudoku board component
  SudokuGrid.css    # Sudoku board styles
  index.css         # Global styles
tests/
  app.spec.ts       # Playwright coverage for the current initial page
```
