---
title: "Browser Cache dev-toolbar app (list + clear localStorage state)"
done: true
state: closed
---

New toolbar app below Cache Inspector in the 3-dot overflow: lists the framework's localStorage keys grouped by prefix, with per-group Clear and Clear-all.

- [x] `src/dev-tools/browser-cache/index.ts` — groups: docs sidebar collapse (`sidebar-collapse:`), issues sidebar collapse (`issues-sidebar-collapse:`), issues list filters (`issues-filters:` / `issues-filter-mode:` / `issues-page-size`), editor UI prefs (`ev2-`); count + bytes + first 3 keys per group; dynamic values escaped before innerHTML (same pattern as cache-inspector).
- [x] Registered in `dev-tools/integration.ts` directly after cache-inspector.
- [x] `./start build` clean.

Artefact: code diff. Human-verified in browser 2026-06-10 → closed.
