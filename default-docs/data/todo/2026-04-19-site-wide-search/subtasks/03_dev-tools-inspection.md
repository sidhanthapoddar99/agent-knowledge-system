---
title: "Surface the search index in dev-tools (cache + RAM viewers)"
status: open
---

The search index is another in-memory cache + another source of RAM pressure. The dev-tools already expose both axes — extend them so the search index is visible alongside Yjs rooms / editor docs / presence.

## Cache Inspector (`src/dev-tools/cache-inspector/`)

Add a new card: **Search Index**. Rows:

| field | source |
|---|---|
| Document count | `orama.count()` |
| Index on-disk snapshot size | `statSync('.cache/search-index.bin').size` |
| Last snapshot time | from snapshot mtime |
| Last bulk reindex duration | tracked in `src/search/index.ts` |
| Dirty documents pending flush | internal counter |
| Avg query time (last 20) | rolling window in `src/search/index.ts` |

Per-document drill-down is probably too noisy at 4k+ records — prefer a "top N largest by content bytes" list if we want any drill.

## System Metrics (`src/dev-tools/system-metrics/`)

Add to the server-side payload returned by `GET /__editor/system`:
- `search.memoryBytes` — best-effort estimate of index RAM (Orama exposes no direct API; approximate via sum of field byte lengths × overhead factor, or track via `process.memoryUsage()` delta after init).
- `search.indexHealth` — `ok | degraded | rebuilding`

Render in the same card structure as the existing server RAM/CPU block.

## Endpoint changes

Extend `GET /__editor/system` middleware response with a `search` section. No new endpoint needed.

## Out of scope
- Exposing query logs (privacy / noise).
- Editing documents from dev-tools (that's the live editor's job).
