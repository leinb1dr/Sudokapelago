# Memory Bank Architecture Details

Companion to [SKILL.md](SKILL.md). Read when implementing `mem:init`, indexing, or inspecting supporting layout.

## 2. Context Modules & Supporting Directories

These directories contain detailed information or supporting data. Their location may vary:

- **Project Root (Typical):** Directories containing project artifacts referenced by the Memory Bank (e.g., `api/`, `components/`, `features/`).
- **Inside `.memory` Directory (Likely):** Directories purely for internal Memory Bank function (e.g., `.vcs-memory/` for snapshots).

Content within these directories is typically indexed for search but not necessarily read entirely unless the current task requires deep dives.

## 3. Semantic Index & Vector Database

`semantic-index.json` & `vector-db/`: These components enable intelligent search across the entire indexed Memory Bank (Core Files within `.memory/`, specified Context Modules, and potentially Project Rules). They store vector embeddings of the content, allowing finding relevant information based on meaning, not just keywords, using the `mem:search` command. Reside likely within `.memory` or a dedicated cache location.

## 4. Project Rules (`.cursor/rules/`)

This component defines rules, guidelines, and configurations specific to this project, providing contextual instructions during development. It captures patterns, preferences, and insights (e.g., aligned with `00-description.md`).

- **Location:** Project-specific rules are stored within the `.cursor/rules/` directory at the project root. This structure allows for potentially multiple, organized rule files targeting different aspects of the project.
- **Mechanism:** Rules within this directory are intended to be automatically consulted and applied when interacting with files or contexts they are associated with (e.g., matching file patterns, specific directories, or task types). This provides contextual guidance during development tasks. Rules can optionally be indexed to enhance semantic search capabilities across all project knowledge.
- **Content Examples:** Project-specific coding standards, preferred API usage patterns, component interaction protocols, required documentation formats, security guidelines, or workflow enforcement rules.
- **Deprecation Notice:** This `.cursor/rules/` system replaces the older, single `.cursorrules` file. If a `.cursorrules` file exists, its contents should be migrated to the new `.cursor/rules/` directory structure for improved organization, contextual application, and future compatibility.

## Core file scaffold (`mem:init`)

When initializing, create `.memory/` with these empty or stub files if missing:

```
.memory/
├── 00-description.md
├── 01-brief.md
├── 10-product.md
├── 20-system.md
├── 30-tech.md
├── 40-active.md
├── 50-progress.md
├── 60-decisions.md
├── 70-knowledge.md
└── .vcs-memory/          # optional; for mem:snapshot
```

Always generate or update `00-description.md` first; ground every other file in it.
