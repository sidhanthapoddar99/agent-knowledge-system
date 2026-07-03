---
title: "Understand + pin the documentation/engine versioning structure"
status: done
---

Map how migration works today (skill-owned scripts inside the plugin, no version
linkage anywhere) and pin the full target structure: version format, the three
anchors (site.yaml `engine_version`, engine `ENGINE_VERSION`, floor
`MIN_CONTENT_VERSION`), gate behavior in both directions, root-owned `migration/`
with version-based naming, and the engine/skill ownership split.

- [x] Current-state map → `brainstorm/01_idea_version-gate.md`
- [x] Pinned specification → `notes/01_versioning-and-migration-design.md`
