# Sudokapelago

A configurable Sudoku website with [Archipelago](https://archipelago.gg/)
multiworld randomizer integration, built with TypeScript, React, and Vite.

Sudokapelago will let you generate and play Sudoku puzzles with a variety of
configuration options, and connect those puzzles to an Archipelago multiworld
session using [archipelago.js](https://archipelago.js.org/stable/).

## Status

Early bootstrap. The app currently renders a hello-world landing page and
initializes the `archipelago.js` client to confirm the integration is wired up.
Configurable Sudoku boards and full Archipelago session handling are planned.

## Tech stack

- [TypeScript](https://www.typescriptlang.org/)
- [React](https://react.dev/)
- [Vite](https://vite.dev/) (dev server / bundler)
- [oxlint](https://oxc.rs/docs/guide/usage/linter) (linting)
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

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) and build a production bundle |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run oxlint over the project |

## Project structure

```
index.html          # Vite HTML entry point
src/
  main.tsx          # React entry point
  App.tsx           # Hello-world landing page + archipelago.js client
  App.css           # Component styles
  index.css         # Global styles
```
