---
title: Refactor the documentation-guide tracker's own issues
state: open
---

Migrate the existing issues in this tracker to the new anatomy — dogfood the
structure on our own backlog.

- [ ] Move agent-log content into flat `NNN_<name>/` activity folders
- [ ] Relocate pre-decision deliberation currently mis-filed as `notes/discussion/`
      into `brainstorm/` (e.g. `runtime-stack-migration` has a `notes/discussion/`
      that is really brainstorm)
- [ ] Split Notes into finalized-output vs reference where they're currently mixed

**Brainstorming that ended up as separate issues.** Some of the issues we created
are really *brainstorming on a topic* that would, under the new model, live in a
single issue's `brainstorm/`. The clearest case is the cluster of cancelled
migration-direction issues — `2026-04-25-framework-as-npm-package`,
`2026-06-09-astro-6-upgrade`, `2026-04-26-editor-as-standalone-product` — which are
deliberation that converged on `2026-05-08-runtime-stack-migration`. During the
refactor, evaluate moving that deliberation **directly into the migration issue's
`brainstorm/`** and refactoring it a bit, rather than leaving it as standalone
cancelled issues.

- [ ] Assess the cancelled migration-direction issues → `runtime-stack-migration/brainstorm/`
- [ ] Decide the keep-as-issue vs move-to-brainstorm rule (feeds subtask 02's rules)
