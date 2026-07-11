# Architecture Decisions

| Date | Decision | Rationale | Source |
|------|----------|-----------|--------|
| 2026-07-11 | Build Sudokapelago as a client-only React + TypeScript + Vite single-page app. | The current repository has a Vite entry point, React component tree, browser CSS, and no backend service. | `README.md`, `package.json`, `src/main.tsx` |
| 2026-07-11 | Use `archipelago.js` as the Archipelago protocol client. | The dependency is declared and `src/App.tsx` constructs a `Client` to verify integration wiring. | `package.json`, `src/App.tsx` |
| 2026-07-11 | Deploy through GitHub Pages with a Vite base path derived from `GITHUB_REPOSITORY` when `GITHUB_PAGES=true`. | This keeps local development at `/` while producing repository-scoped asset paths for Pages. | `README.md`, `vite.config.ts` |
| 2026-07-11 | Use npm scripts and oxlint for local validation. | `package-lock.json` is committed, and scripts expose `dev`, `build`, `preview`, and `lint`. | `package.json`, `.oxlintrc.json` |
