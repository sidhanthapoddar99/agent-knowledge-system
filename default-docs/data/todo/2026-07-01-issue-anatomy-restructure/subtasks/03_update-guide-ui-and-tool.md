---
title: Update the documentation guide, UI, and tooling
state: open
---

Implement the structure in the framework once it's decided (subtask 01).

- [x] Loader (`src/loaders/issues.ts`) — `brainstorm` + `agent-memory` added to the
      sub-folder list and read via `readFreeformDocs`; comments stay flat.
- [x] Routing + sidebar — Brainstorm + Agent-memory sections wired across
      `DetailSidebar` / `SubdocTree` / `route-match` / `static-paths` / helpers /
      `SubDocLayout` / `NotePage` / `panels.ts`.
- [ ] Agent-log `kind` badge from per-folder `settings.json`
- [x] The rendered **guide** surfaced on every issue — `guide.ts` (framework-bundled,
      thin legend) rendered on a **Guide** panel; documented in CLAUDE.md as the
      skill-guide twin.
- [ ] Validators (`docs-check-section`) updated for the new sections
