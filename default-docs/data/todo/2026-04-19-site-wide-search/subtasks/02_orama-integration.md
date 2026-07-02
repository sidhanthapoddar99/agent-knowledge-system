---
title: "Orama integration — in-process index + save-hook wiring"
status: open
---

Land the core engine wired into the Astro server.

## Scope

### Setup
- `bun add @orama/orama @orama/plugin-data-persistence`
- New module: `src/search/index.ts` — owns the singleton `Orama` DB, schema, init/persist/restore, query wrappers.
- Call `initSearchIndex()` once from `src/dev-tools/integration.ts` (or a new `src/integrations/search.ts` if this needs to run outside dev-tools too — likely yes, since prod needs it).

### Schema
```ts
{
  id: 'string',
  url: 'string',
  type: 'enum',          // docs | blog | issue | subtask | note | agent-log
  section: 'string',     // user-guide | dev-docs | blog | issues | ...
  parent_id: 'string',   // for subtasks / notes / agent-logs
  title: 'string',
  excerpt: 'string',
  content: 'string',
  tags: 'enum[]',
  status: 'enum',        // issues only
  priority: 'enum',      // issues only
  mtime: 'number',
}
```

### Bulk index on boot
- Walk content dirs (already done by the existing loaders — reuse, don't re-walk).
- For each file: parse frontmatter + body, push to Orama.
- Log duration — should be seconds for current corpus, target <30s for 20× growth.

### Incremental updates
- Hook `editor-store.updateRaw()` save path → after file write, `update(db, id, doc)`.
- Hook the `cache-manager` file-watcher → on external edits, `update(db, id, doc)`.
- Debounce 500ms per `id`.

### Persistence
- Snapshot to `.cache/search-index.bin` on graceful shutdown + every 30s while dirty.
- On boot, if snapshot exists AND `snapshot.mtime > max(content-file.mtime)` → restore. Else bulk-reindex.

### Query wrapper
- `searchIndex(q, { section, type, filters, fuzzy, limit, offset })` → normalized response
- Wrap Orama's `search()` to enforce a default `tolerance` (fuzzy edit distance 1–2) + prefix matching.

## Out of scope here
- Dev-tools index inspector (subtask 03)
- HTTP endpoint (subtask 05)
- UI (subtask 08)
