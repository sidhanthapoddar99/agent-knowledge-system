---
title: "Notes + agent-log: 2-level subfolder tree, no naming convention"
state: done
done: true
---

Extend `notes/` and `agent-log/` to support a 2-level subfolder tree (deeper than the 1-level grouping landed in [subtask 15](./15_agent-log-nested-folders.md)). Folders and files are picked up by the loader without any `NNN_` numbered-prefix requirement.

- [x] Allow 2-level tree (notes + agent-log, no naming convention)
- [x] Test
- [x] Update docs
- [x] Update plugin skills

Landed in commit `edc630d`. Loader/route changes in `astro-doc-code/src/loaders/issues.ts`, `pages/lib/route-match.ts`, `static-paths.ts`; layout updates in `layouts/issues/default/parts/detail/SubdocTree.astro` (+ siblings). Test fixtures added under `notes/design/phase-1/deeper/` and `agent-log/exploration/phase-1/deeper/`. Docs updated in `user-guide/19_issues/03_folder-structure.md` and `05_sub-docs/{04_notes,05_agent-log}.md`. Plugin skills updated in `plugins/documentation-guide/references/issue-layout.md` and `scripts/issues/{_lib,add-agent-log,check,show}.mjs`. `check.mjs` warns when subfolders exceed the 2-level cap.
