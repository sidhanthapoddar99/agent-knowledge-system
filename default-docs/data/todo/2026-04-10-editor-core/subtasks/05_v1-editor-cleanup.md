---
title: "V1 editor cleanup"
status: done
---

V1 editor code was removed; `src/dev-toolbar/editor/` now contains only the shared v2 backend.

## Tasks

- [x] Removed `src/dev-toolbar/editor-ui/` (old client)
- [x] Removed `src/dev-toolbar/editor-app.ts`
- [x] Removed v1 config branches from `integration.ts`
- [x] Dropped the `editor.version` switch in `site.yaml`
- [x] `src/dev-toolbar/editor/` retained — it is the v2 backend (`yjs-sync.ts`, `server.ts`, `middleware.ts`, `presence.ts`), not v1 leftovers
