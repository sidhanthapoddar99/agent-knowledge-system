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
- [x] Agent-log `kind` badge — code lives in the folder name (`NNN_<code>_<name>/`); the
      code→name map is `agentLogKinds` in issue `settings.json` merged over framework
      defaults (`lp/au/rf/it/wf`). Sidebar renders `NN  <name>  (kind-tag)`; unknown codes
      fall back to name+count; meta files (`0NN`) badge-less; milestones keep `#<iteration>`.
      *(Still todo: the **Guide** should list the effective kind set — Guide is currently
      the static `guide.ts`; needs to read the mapping.)*
- [x] The rendered **guide** surfaced on every issue — `guide.ts` (framework-bundled,
      thin legend) rendered on a **Guide** panel; documented in CLAUDE.md as the
      skill-guide twin.
- [ ] Validators (`docs-check-section`) updated for the new sections
