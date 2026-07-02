---
title: "Architecture design — scope, indexing pipeline, API shape"
status: open
---

Nail the design before writing code. Output: a short design doc in `notes/` covering the questions below.

## Questions to answer

### Index shape
- Per-document fields and which are searchable vs. filter-only vs. return-only:
  - `id` (stable, path-based) — return-only
  - `url` — return-only
  - `type` (`docs` / `blog` / `issue` / `subtask` / `note` / `agent-log`) — filter
  - `section` (top-level content dir, e.g. `user-guide`, `dev-docs`) — filter
  - `title` — searchable, boosted
  - `excerpt` (first ~200 chars, or frontmatter `description`) — return-only
  - `content` (full stripped markdown) — searchable
  - `tags`, `status`, `priority` (issues) — filter
  - `mtime` — for staleness checks + sort
- How to handle sub-documents (subtasks / notes / agent-logs): separate records with `parent_id`, or nested? → recommend **flat records with parent_id** for filter simplicity.

### Scoping
- Three scopes, all served by the same endpoint:
  - **Global**: `/api/search?q=...`
  - **Local**: `/api/search?q=...&section=docs` (or `type=issue`)
  - **Filter-scoped**: `/api/search?q=...&filter=status:open&filter=priority:high`
- Local scope = same as filter on `section` or `type`. One code path.

### Indexing pipeline
- Cold-start bulk index on server boot (walk content dirs, push all docs).
- Incremental updates on:
  - `editor-store` save hook
  - `cache-manager` file-watcher events for external edits
- Debounce window per file (~500ms) so a fast-typing editor doesn't thrash.
- Snapshot persistence every ~30s and on graceful shutdown; restore on boot if snapshot is fresh (mtime check vs. content dirs).

### API surface
- `GET /api/search?q=...&filter=...&section=...&scope=...&fuzzy=...&limit=...&offset=...`
- Response: `{ hits: [{ id, url, title, excerpt, matches: [...], score }], total, took_ms }`
- Matches include positions for highlighting.

### Failure modes & recovery
- Index corruption → rebuild from files (safe, idempotent).
- Snapshot drift → on boot, if any content file's mtime > snapshot mtime, reindex that file.
- Process crash mid-update → last-good snapshot + rebuild missing deltas.

### What stays out of scope
- Multi-instance sync. Single instance only for this phase.
- Vector / semantic search on main path (hybrid mode stays opt-in).
- Cross-site federation.

## Deliverable

`notes/03_architecture-design.md` — concrete decisions on each of the above, plus a sequence diagram of the save → index → search flow.
