# Cursor agent skills for Sudokapelago

This directory contains a repo-local copy of agent skills and commands from `monsefchafik/claude-code-skills`, converted for Sudokapelago and wired for Cursor's `AGENTS.md` convention.

## Installed layout

- `skills/codebase-analysis/` - structured codebase analysis adapted for TypeScript, React, Vite, CSS, and `archipelago.js`.
- `skills/architecture-document/` - converts analysis output into `docs/ai/architecture/*` documentation.
- `skills/architecture-reviewer/` - isolated architecture-doc reviewer.
- `skills/memory-maintainer/` - audits and maintains Cursor agent memory layers.
- `commands/memory-bootstrap.md` - initializes memory files from this repository's actual structure.
- `commands/promote-to-memory.md` - promotes durable findings from a session or analysis file.

## Repo-specific conversion notes

The source skills were mostly stack-agnostic, but several examples assumed Java/Spring. Those prompts now steer agents toward:

- `package.json`, `README.md`, Vite config, and TypeScript configs for stack detection.
- `src/main.tsx`, React components/hooks, CSS, and browser event surfaces for entry points.
- `archipelago.js`, WebSocket/client connection code, browser storage, and environment variables for integration mapping.
- `npm run build` and `npm run lint` as standard validation commands.

Keep skill edits grounded in this repository. If the app grows new folders such as `src/components/`, `src/lib/`, `src/game/`, or `src/archipelago/`, update the examples here rather than re-importing the upstream Java-oriented defaults.
