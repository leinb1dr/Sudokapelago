# System Patterns

> **Entry threshold**: add a pattern when the same approach appears in 2 or more distinct files
> in the codebase, OR when a non-obvious design decision has been validated by the team.
> Format: pattern name, when to use it, minimal code example. No prose essays.

## React State Patterns

<!-- To be completed: only `src/App.tsx` currently has React state, so no repeated state pattern is confirmed. -->

## Game Logic Patterns

<!-- To be completed: Sudoku grid, cell, puzzle generation, validation, and configuration logic are not implemented yet. -->

## Archipelago Integration Patterns

<!-- To be completed: `src/App.tsx` constructs a `Client`, but no repeated connection/session pattern is implemented yet. -->

## Styling and Asset Patterns

### Shared accent color

Use `#646cff` for the app accent when styling global links or component highlights.

```css
a {
  color: #646cff;
}

.accent {
  color: #646cff;
}
```

## Error Handling Patterns

<!-- To be completed: no user-facing connection, validation, or runtime error pattern is implemented yet. -->
