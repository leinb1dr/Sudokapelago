# Data Sources

| Source | Current role | Notes |
|--------|--------------|-------|
| Static bundle | Loads the React app, CSS, and public assets in the browser. | Built by Vite from `src/`, `index.html`, and `public/`. |
| User interaction | Drives current UI state. | `src/App.tsx` toggles a greeting with local React state. |
| Build environment | Controls GitHub Pages base-path behavior. | `GITHUB_PAGES` and `GITHUB_REPOSITORY` are read in `vite.config.ts`. |
| Archipelago server | Future source of session, item, and location state. | No connection to a server is implemented yet. |
| Browser storage | Future persistence candidate. | No localStorage, IndexedDB, or cookie usage is implemented yet. |
