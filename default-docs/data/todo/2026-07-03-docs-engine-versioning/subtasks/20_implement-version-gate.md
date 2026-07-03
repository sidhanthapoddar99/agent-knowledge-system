---
title: "Implement the version gate in the engine"
status: done
---

Per `notes/01_versioning-and-migration-design.md`: the engine refuses to run
against content outside its supported range.

- [x] `src/loaders/engine-version.ts` — `ENGINE_VERSION = "0.7.0"`,
      `MIN_CONTENT_VERSION = "0.7.0"`, and a small `compareVersions()` (numeric
      per segment; gate compares major.minor only).
- [x] Gate in `loadSiteConfig()` (`src/loaders/config.ts`): read top-level
      `engine_version` (missing → `0.0.0`), throw with the AI-actionable
      migration message when below the floor, throw "upgrade the engine" when
      above `ENGINE_VERSION`.
- [x] Declare `engine_version: "0.7.0"` in `default-docs/config/site.yaml` (with
      an explanatory comment) so the dogfood project passes its own gate.
- [x] `/docs-init` scaffold writes `engine_version` into new projects.
- [x] Verify: build green with the declaration; temporarily drop/raise it and
      confirm both error directions fire with the right message.
