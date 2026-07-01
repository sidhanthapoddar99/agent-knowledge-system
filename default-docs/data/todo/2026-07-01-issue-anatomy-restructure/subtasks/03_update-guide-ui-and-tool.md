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
- [x] The rendered **guide** surfaced on every issue — `guide.ts` (framework-bundled,
      thin legend) rendered on a **Guide** panel; documented in CLAUDE.md as the
      skill-guide twin.
- [x] **Guide generated per issue** — `buildIssueGuide(kindMap)` renders the kinds table
      (symbol · code · name · desc) from the effective `agentLogKinds`; complexity-first
      section order, pointer-style; right-rail "On this page" TOC via id-stamped `h2`s +
      `#guide-<slug>` deep links. Design settled in
      `brainstorm/01_overall-structure/09_guide.md`.
- [ ] Validators (`docs-check-section`) updated for the new sections
