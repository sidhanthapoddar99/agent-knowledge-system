---
title: "Per-scope blob format + delete-on-default (docs + issues sidebars)"
done: true
state: closed
---

Rewrote both inline persistence scripts from one-key-per-folder to one-blob-per-scope, storing only deviations from the server-rendered default.

- [x] `layouts/docs/default/Sidebar.astro` — key `sidebar-collapse:<section-root>`, value `{ts, f:{path:0|1}}`; defaults captured from initial `data-collapsed` attrs before restore; toggle-to-default deletes the entry; empty blob → `removeItem`.
- [x] `layouts/issues/default/parts/detail/DetailSidebar.astro` — key `issues-sidebar-collapse:<tracker>:<issue-id>`, same value shape; defaults from initial `details.open`; added `suppress` guard because `<details>` toggle events are queued tasks and would otherwise write back the programmatic restore/sync changes.
- [x] GC in both: prefix scan drops expired blobs (one `ts` check per scope) and legacy v1 per-folder keys (payload without `.f`) — self-migrating.
- [x] `./start build` clean (481 pages).

Artefact: code diff. Human-verified in browser 2026-06-10 → closed.
