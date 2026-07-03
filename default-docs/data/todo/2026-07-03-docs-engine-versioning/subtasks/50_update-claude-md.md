---
title: "Update CLAUDE.md with the versioning contract (run last)"
status: done
---

Last subtask by design (sidhantha) — CLAUDE.md describes shipped reality, so it
updates only after 20–40 land.

- [x] Repository Layout tree: add root `migration/` with a one-line description.
- [x] Key Architecture Concepts: a short "Version contract" paragraph —
      site.yaml `engine_version` vs `ENGINE_VERSION`/`MIN_CONTENT_VERSION` in
      `src/loaders/engine-version.ts`, hard gate in `loadSiteConfig()`, missing
      → 0.0.0, migrations at root named `<to-version>_<statement>.py`.
- [x] Key Rules: add the gate as a numbered rule (site.yaml `engine_version`
      required going forward).
