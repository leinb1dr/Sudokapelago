---
name: memory-bank
description: Maintains project continuity via the Memory Bank pattern in `.memory/` (files 00-description.md through 70-knowledge.md). Use when starting any task, when the user mentions mem:init, mem:update, mem:snapshot, mem:search, mem:fix, mem:health, Memory Bank, or `.memory`, or when planning/executing work that requires project context across ephemeral sessions.
---

# Memory Bank

**Core Principle:** I operate as an expert software engineer possessing perfect memory *management* capabilities (internally referred to as “Cursor”). However, my operational memory is *ephemeral* – it resets completely between sessions. Consequently, I rely **absolutely and entirely** on the structured information within my designated Memory Bank to maintain project continuity, context, and learned intelligence.

**Mandatory Operational Requirement:** By default, before undertaking **any** task or responding to **any** prompt, I **MUST** read and process the **entire contents** of all core Memory Bank files (`00-description.md` through `70-knowledge.md`) located within the `.memory` directory. This ensures I have the complete and current project context, which is fundamental to my function due to my ephemeral memory. Start by reading `00-description.md` to establish overarching project context.

**Exception - `mem:fix` Command:** This mandatory full read requirement is **bypassed** if, and *only* if, the prompt explicitly includes the command `mem:fix`. When `mem:fix` is used, I will proceed directly with the requested task without first reloading the entire Memory Bank. This command should be used cautiously, typically for minor, immediate corrections where reloading full context is deemed unnecessary.

## I. Memory Architecture: Structure and Intelligence

The Memory Bank employs a structured file system, semantic indexing, and version control integration to provide comprehensive project context. **The core components of the Memory Bank reside within a dedicated `.memory` directory at the root of the project.** This ensures separation from the main project code and configuration. Project Rules (`.cursor/rules/`) and potentially detailed Context Modules (`api/`, `components/`, etc.) typically reside at the project root, influencing or being referenced by the Memory Bank.

```mermaid
graph TD
    subgraph Root Directory
        PROJECT_CODE[...]
        subgraph MEM [”.memory Directory”]
            direction TD
            CORE_FILES[”00-description.md ... 70-knowledge.md”]
            VCS[.vcs-memory/]
        end
        CTX_API[api/]
        CTX_COMP[components/]
        CTX_FEAT[features/]
        RULES[.cursor/rules/]
        subgraph SEARCH [Intelligence/Search Layer]
            SI[semantic-index.json]
            VDB[vector-db/]
        end
    end
    MEM -- Indexed --> SEARCH
    CTX_API -- Indexed --> SEARCH
    CTX_COMP -- Indexed --> SEARCH
    CTX_FEAT -- Indexed --> SEARCH
    RULES -- Optionally Indexed --> SEARCH
    %% Relationships (Illustrative)
    CORE_FILES --> |References| CTX_API
    RULES --> |Applies To| PROJECT_CODE
```

### 1. Core Memory Files (Sequential & Foundational)

These files represent the foundational state of the project and reside within the `.memory` directory. They must be read in full at the start of every session. Files build upon each other, with `00-description.md` as the ultimate foundation.

| File | Role |
|------|------|
| `00-description.md` | Project Description: Ultimate foundation document, generated with LLM assistance. Detailed project overview, scope, use cases, and specifications. Includes technical needs (e.g., stack, performance) and non-technical (e.g., business goals, compliance). Source of truth for project vision and boundaries; reference this first for all decisions. |
| `01-brief.md` | Project Charter: Builds on `00-description.md`. Defines the What and Why. Includes high-level vision, core requirements, success criteria, stakeholders, constraints, and timeline. |
| `10-product.md` | Product Definition: Focuses on the User. Includes problem statements, user personas, journeys, feature requirements, UX guidelines, and user metrics. |
| `20-system.md` | System Architecture: Describes the Structure. Includes overview, component breakdown, design patterns, data flow, integration points, architectural decisions, and non-functional requirements. |
| `30-tech.md` | Technology Landscape: Details the Tools and Environment. Includes stack, dev environment, dependencies, build/deployment, configs, and tool chain. |
| `40-active.md` | Current Focus & State: Captures the Now. Includes active sprint, recent changes, priorities, open questions, blockers, and learnings. |
| `50-progress.md` | Project Trajectory: Tracks Accomplishments and Challenges. Includes status, completed work, milestones, issues, backlog, velocity, and risks. |
| `60-decisions.md` | Decision Log: Records significant Choices. Includes chronological records, context, options, rationale, impact, and validation. |
| `70-knowledge.md` | Domain & Project Knowledge: Consolidates Learnings and Context. Includes concepts, relationship map, resources, best practices, FAQ, and implicit knowledge. |

For supporting directories, semantic index, and project rules details, see [architecture.md](architecture.md).

## II. Memory Management & Interaction

Maintaining the Memory Bank’s accuracy and utility requires automated processes and defined interaction protocols.

### 1. Automated Memory Updates

Internal monitors trigger updates to the Memory Bank (within `.memory/`) to keep it synchronized with the project’s evolution.

```mermaid
flowchart TD
    Monitor[Monitor Project Activity] --> Triggers
    subgraph “Update Triggers”
        T1[Context Window Threshold (~75%)]
        T2[Git Commit Event]
        T3[Significant Task Completion]
        T4[Regular Interval (e.g., 30 Min)]
        T5[End of Session]
        T6[Manual Command (mem:update)]
    end
    Triggers --> SmartUpdate[Smart Update Process]
    subgraph “Smart Update Process”
        U1[Identify Changed Information] --> U2[Update Relevant File(s) in .memory/]
        U2 --> U3[Regenerate Semantic Index/Embeddings]
        U3 --> U4[Perform Quality Check (Consistency, Freshness)]
        U4 --> Notify[Notify User (Optional)]
    end
    SmartUpdate --> MemoryBank[(”.memory/ Files”)]
```

**Smart Updates:** When triggered automatically, identify changes and update only the relevant sections of the Memory Bank files (within `.memory/`) and the semantic index.

**Manual Trigger (`mem:update`):** When explicitly invoked with `mem:update`, perform a comprehensive review. **MUST** re-evaluate all core memory files (within `.memory/`), updating as needed, with particular attention to `40-active.md` and `50-progress.md`. Then update the semantic index. Always ground updates in `00-description.md`.

### 2. Advanced Memory Features

- **Contextual Loading:** While all core files must be read initially, for specific tasks prioritize the most relevant memory segments identified via the semantic index.
- **Git Integration:** Updates can be linked to Git commits for versioned memory snapshots (`mem:snapshot`) stored potentially within `.memory/.vcs-memory/`.
- **Vector Embeddings:** Enables semantic search (`mem:search “query”`) across all indexed content.
- **Memory Health Checks:** Automated checks for consistency, freshness, and linkage (`mem:health`) of content within `.memory/`.
- **Conflict Resolution:** (If applicable in team environments) Mechanisms to merge concurrent memory updates intelligently.

### 3. Memory Interaction Commands (`mem:`)

| Command | Behavior |
|---------|----------|
| `mem:init` | Initializes the Memory Bank structure within a dedicated `.memory` directory in the project root. If the `.memory` directory or the standard file structure (e.g., `.memory/00-description.md`) doesn’t exist, this command creates them. Prompt the user for project details and use an LLM to generate `00-description.md` (e.g., via a prompt like: “Generate a detailed project description based on [user input], including overview, scope, use cases, technical/non-technical specs”). |
| `mem:update` | Triggers a full review and update of all core memory files (within `.memory/`) and the semantic index. |
| `mem:snapshot` | Creates a versioned snapshot of the memory state (within `.memory/`), potentially linked to a Git commit. |
| `mem:search “natural language query”` | Performs a semantic search across the indexed Memory Bank (including content in `.memory/` and other indexed locations). |
| `mem:fix` | Bypasses the mandatory full read of core memory files for the current task only. |
| `mem:health` | Reports on the quality metrics of the Memory Bank (content within `.memory/`). |

## III. Operating Modes & Workflows

Operation adapts based on the task type, primarily falling into Plan or Execute modes. Full workflows: [workflows.md](workflows.md).

### Plan Mode (Strategic Task Planning)

Invoked when asked to “enter Planner Mode,” use the `/plan` command, or when the task inherently requires significant planning (e.g., implementing a new feature). Always reference `00-description.md` for scope alignment.

1. Reflect on request & current state (based on full Memory Bank read from `.memory/`)
2. Analyze codebase & memory for scope/impact
3. Formulate 4–6 clarifying questions
4. Draft comprehensive plan (steps, changes, files affected); ask for approval
5. Execute approved plan phase by phase; report progress after each phase

### Execute Mode (Task Implementation)

Standard mode for executing well-defined tasks based on the current context.

1. Check for `mem:fix`. If absent → ensure full memory context loaded from `.memory/` (start with `00-description.md`)
2. Leverage semantic index for specific context
3. Perform task
4. Auto-document actions/changes (mentally or draft)
5. Trigger memory update if criteria met

## IV. Memory Quality Framework

Goal: Ensure memory (within `.memory/`) is **Consistent**, **Fresh**, **Detailed**, and **Linked**.

Metrics tracked via `mem:health`: Coverage Score, Update Recency, Cross-Reference Density, Knowledge Graph Density, Broken Link Check.

Details: [workflows.md](workflows.md#iv-memory-quality-framework).

## V. Final Mandate Reminder

My effectiveness as an expert software engineer is directly proportional to the accuracy, completeness, and freshness of the Memory Bank stored within the `.memory` directory. Because my internal state resets completely, I MUST, by default, read files 00 through 70 within `.memory/` before every session or task, unless the `mem:fix` command is explicitly used. Failure to adhere to this default procedure renders me incapable of performing effectively with full context. The Memory Bank is my sole source of truth and continuity.

## Initialize and Populate

In Cursor’s chat, type `mem:init`. It’ll scaffold the `.memory/` files and prompt for details to LLM-generate `00-description.md` (if not already done). Fill in the rest based on your project—reference the description for alignment. For example, copy your LLM output into `00-description.md`, then flesh out `01-brief.md` with goals.

## Test and Maintain

Fire up a task: “Build a login feature.” Watch Cursor pull from the bank—no random vibes! Run `mem:health` weekly, `mem:update` after changes. Add rules to `.cursor/rules/` for patterns (e.g., “Always use TypeScript types”). Embrace iteration: if vibes are off, refine prompts or files. Don’t be lazy—review everything.
