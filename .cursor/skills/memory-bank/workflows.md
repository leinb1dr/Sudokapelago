# Operating Modes, Workflows & Quality

Companion to [SKILL.md](SKILL.md).

## III. Operating Modes & Workflows

Operation adapts based on the task type, primarily falling into Plan or Execute modes.

### 1. Plan Mode (Strategic Task Planning)

Invoked when asked to “enter Planner Mode,” use the `/plan` command, or when the task inherently requires significant planning (e.g., implementing a new feature). Always reference `00-description.md` for scope alignment.

```mermaid
flowchart TD
    Start[Request Requires Planning] --> Reflect[1. Reflect on Request & Current State (Based on Full Memory Read from .memory/)]
    Reflect --> Analyze[2. Analyze Codebase & Memory for Scope/Impact]
    Analyze --> Ask[3. Formulate 4-6 Clarifying Questions (Based on Analysis)]
    Ask --> Wait{Wait for Answers}
    Wait --> Draft[4. Draft Comprehensive Plan (Steps, Changes, Files Affected)]
    Draft --> Approve{Ask for Plan Approval}
    Approve --> Execute[5. Execute Approved Plan (Phase by Phase)]
    Execute --> Report[6. Report Progress After Each Phase]
```

**Process:** Deep reflection on the request against the full Memory Bank context (read from `.memory/`), codebase analysis, formulation of clarifying questions, drafting a detailed plan for approval, and then executing step-by-step with progress updates.

### 2. Execute Mode (Task Implementation)

Standard mode for executing well-defined tasks based on the current context.

```mermaid
flowchart TD
    Start[Receive Task] --> CheckFix{mem:fix used?}
    CheckFix -- No --> Context[1. Ensure Full Memory Context Loaded from .memory/ - Start with 00-description.md]
    CheckFix -- Yes --> LoadRelevant
    Context --> LoadRelevant[2. Leverage Semantic Index for Specific Context]
    LoadRelevant --> Execute[3. Perform Task (Code, Write Docs, etc.)]
    Execute --> AutoDoc[4. Auto-Document Actions/Changes (Mentally or Draft)]
    AutoDoc --> TriggerUpdate[5. Trigger Memory Update (if criteria met)]
```

**Process:** Check for `mem:fix`. If not present, load full memory from `.memory/`. Leverage search for specific context if needed. Execute the task, mentally note changes, and trigger automated memory updates (to files in `.memory/`) as appropriate.

## IV. Memory Quality Framework

Maintaining the Memory Bank’s quality (within `.memory/`) is crucial for effectiveness.

```mermaid
graph LR
    subgraph “Quality Dimensions”
        C[Consistency (Internal & Code)]
        F[Freshness (Up-to-date)]
        D[Detail (Sufficient Info)]
        L[Linking (Cross-referenced)]
    end
    subgraph “Quality Metrics (via mem:health)”
        M1[Coverage Score (% Documented)]
        M2[Update Recency (Last Update Time)]
        M3[Cross-Reference Density]
        M4[Knowledge Graph Density (if applicable)]
        M5[Broken Link Check]
    end
    QualityDimensions --> QualityMetrics
    QualityMetrics --> ImprovementActions[Improvement Actions (Manual/Automated)]
```

**Goal:** Ensure memory (within `.memory/`) is Consistent, Fresh, Detailed, and Linked.

**Metrics:** Tracked via `mem:health` to provide actionable insights.

### `mem:health` report shape

When running `mem:health`, report:

1. Which core files exist / are missing under `.memory/`
2. Last-updated recency per file (from git or file mtime when available)
3. Obvious staleness (e.g., `40-active.md` / `50-progress.md` vs recent commits)
4. Broken or dangling cross-references between memory files
5. Suggested improvement actions

## V. Final Mandate Reminder

My effectiveness as an expert software engineer is directly proportional to the accuracy, completeness, and freshness of the Memory Bank stored within the `.memory` directory. Because my internal state resets completely, I MUST, by default, read files 00 through 70 within `.memory/` before every session or task, unless the `mem:fix` command is explicitly used. Failure to adhere to this default procedure renders me incapable of performing effectively with full context. The Memory Bank is my sole source of truth and continuity.
