---
title: "Update the sidebar-state-cache dev-docs page to the v2 format"
done: true
state: closed
---

`dev-docs/05_architecture/05_layout-internals/07_sidebar-state-cache.md` was written against the v1 per-folder format; rewrite the key/value/TTL/GC sections for v2 (per-scope blobs, delete-on-default, legacy-key migration) and mention the Browser Cache toolbar app.

- [x] Key shape table → scope keys; value shape → `{ts, f:{…}}`.
- [x] TTL/GC section → one ts per scope; legacy v1 keys dropped by GC.
- [x] Delete-on-default section → now implemented (was listed as "known improvement").
- [x] Browser Cache toolbar app cross-referenced.
